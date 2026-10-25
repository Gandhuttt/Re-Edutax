import type { Bpa1Ptkp } from './ptkp-bpa1';

// Shared BPA1/BPA2 PPh Pasal 21 calculation, used by the server (source of
// truth at Simpan Konsep) and by the detail pages (live preview) so both
// always agree. Live-verified against Coretax's own BPA1/BPA2 forms
// (docs/ui-reference/coretax/ebupot/NOTES.md "BPA1/BPA2 parity").

/** Coretax rejects Number Of Months of 0 or 12 ("between 1 to 11"). */
export const BPA_MAX_ANNUALIZED_MONTHS = 11;

/** Pensiunan Secara Teratur: Coretax caps Biaya Pensiun at 200,000/month. */
const PENSION_OBJECT_CODE = '21-100-02';
const MONTHLY_CAP_OFFICE = 500_000;
const MONTHLY_CAP_PENSION = 200_000;

export const GENERIC_RECIPIENT_TIN = '9990000000999000';

const ptkpAmounts: Record<Bpa1Ptkp, number> = {
	TK0: 54_000_000,
	TK1: 58_500_000,
	TK2: 63_000_000,
	TK3: 67_500_000,
	K0: 58_500_000,
	K1: 63_000_000,
	K2: 67_500_000,
	K3: 72_000_000
};

export const resolvePtkpAmount = (statusPtkp: Bpa1Ptkp): number => ptkpAmounts[statusPtkp];

export const monthCountInclusive = (
	masaPajakAwal: number,
	tahunAwal: number,
	masaPajakAkhir: number,
	tahunAkhir: number
): number => (tahunAkhir - tahunAwal) * 12 + (masaPajakAkhir - masaPajakAwal) + 1;

/** min(5% x bruto, monthly cap x months in Masa Pajak Awal..Akhir). */
export const calculateBiayaJabatan = (
	bruto: number,
	monthCount: number,
	kodeObjek: string
): number =>
	Math.min(
		Math.round(bruto * 0.05),
		(kodeObjek === PENSION_OBJECT_CODE ? MONTHLY_CAP_PENSION : MONTHLY_CAP_OFFICE) *
			Math.max(monthCount, 0)
	);

type RateBand = { Min: number; Max: number; Rate: number; Minus?: number };
type TaxItem = {
	TaxCertificateCode?: string;
	TaxCertificateCodes?: string[];
	Rates?: RateBand[];
};
export type BpaParameterData = { ItemList: TaxItem[] };

export type BpaCalcInput = {
	/** Penghasilan Bruto excluding Tunjangan PPh (the whole bruto for BPA2). */
	brutoTanpaTunjanganPph: number;
	/** Manual Tunjangan PPh; ignored when grossUp is on (BPA1 only). */
	tunjanganPph: number;
	grossUp: boolean;
	masaPajakAwal: number;
	tahunAwal: number;
	masaPajakAkhir: number;
	tahunAkhir: number;
	kodeObjek: string;
	disetahunkan: boolean;
	jumlahBulan: number | null;
	iuranPensiun: number;
	zakat: number;
	penghasilanNetoSebelumnya: number;
	statusPtkp: Bpa1Ptkp;
	pphDipotongSebelumnya: number;
	parameterData: BpaParameterData;
	/** BPA1 picks the ItemList entry by facility code; BPA2 has no facility (null). */
	facilityKode: string | null;
	/** BPA1 facility 11 (PPh 21 DTP): the whole terutang is borne by the government. */
	dtp: boolean;
	/** PPh 21 already withheld through prior monthly slips (Coretax getebupotmpincometaxwithheld). */
	pphDipotongBulanan: number;
};

export type BpaCalcResult = {
	tunjanganPph: number;
	penghasilanBruto: number;
	biayaJabatan: number;
	jumlahPengurangan: number;
	penghasilanNeto: number;
	penghasilanNetoSetahunDisetahunkan: number;
	penghasilanTidakKenaPajak: number;
	penghasilanKenaPajak: number;
	tarif: number;
	pphPasal21AtasPkp: number;
	pphPasal21Terutang: number;
	pphPasal21TerutangPadaIni: number;
	/** "PPh Pasal 21 yang Dipotong/Ditanggung Pemerintah" (BPA1) / "yang Telah Dipotong" (BPA2). */
	pphDipotongAtauDitanggung: number;
	pphKurangLebihDipotongDesember: number;
};

function selectTaxItem(parameterData: BpaParameterData, facilityKode: string | null): TaxItem {
	const item =
		facilityKode === null
			? parameterData.ItemList.find((entry) => entry.Rates && entry.Rates.length > 0)
			: parameterData.ItemList.find(
					(entry) =>
						entry.TaxCertificateCode === facilityKode ||
						entry.TaxCertificateCodes?.includes(facilityKode)
				);

	if (!item) {
		throw new Error(
			facilityKode === null
				? 'Tarif tidak dapat dihitung untuk objek pajak ini'
				: 'Fasilitas pajak tidak berlaku untuk objek pajak ini'
		);
	}

	return item;
}

// tax(x) = x * band(x).Rate/100 - band(x).Minus, the Pasal 17 progressive
// bracket mechanism (PKP 137,500,000 -> 15% - 6,000,000 = 14,625,000).
function bracketTax(item: TaxItem, penghasilanKenaPajak: number) {
	if (penghasilanKenaPajak <= 0) return { tarif: 0, pajak: 0 };
	const band = item.Rates?.find(
		(b) => penghasilanKenaPajak >= b.Min && penghasilanKenaPajak <= b.Max
	);
	if (!band) return { tarif: 0, pajak: 0 };
	return {
		tarif: band.Rate,
		pajak: Math.round(penghasilanKenaPajak * (band.Rate / 100) - (band.Minus ?? 0))
	};
}

function calculateOnce(input: BpaCalcInput, tunjanganPph: number): BpaCalcResult {
	const item = selectTaxItem(input.parameterData, input.facilityKode);
	const penghasilanBruto = input.brutoTanpaTunjanganPph + tunjanganPph;
	const monthCount = monthCountInclusive(
		input.masaPajakAwal,
		input.tahunAwal,
		input.masaPajakAkhir,
		input.tahunAkhir
	);
	const biayaJabatan = calculateBiayaJabatan(penghasilanBruto, monthCount, input.kodeObjek);
	const jumlahPengurangan = biayaJabatan + input.iuranPensiun + input.zakat;
	const penghasilanNeto = penghasilanBruto - jumlahPengurangan;
	const netoGabungan = penghasilanNeto + input.penghasilanNetoSebelumnya;

	// "Disetahunkan" uses Coretax's explicit Number Of Months (not the length of
	// the period): annualize x 12 / n, then de-annualize the tax x n / 12.
	const annualizeMonths = input.disetahunkan ? (input.jumlahBulan ?? 0) : 12;
	const annualizable = annualizeMonths > 0;
	const penghasilanNetoSetahunDisetahunkan = !input.disetahunkan
		? netoGabungan
		: annualizable
			? Math.round((netoGabungan * 12) / annualizeMonths)
			: 0;

	const penghasilanTidakKenaPajak = resolvePtkpAmount(input.statusPtkp);
	const penghasilanKenaPajak = Math.max(
		0,
		Math.floor((penghasilanNetoSetahunDisetahunkan - penghasilanTidakKenaPajak) / 1000) * 1000
	);
	const { tarif, pajak: pphPasal21AtasPkp } = bracketTax(item, penghasilanKenaPajak);
	const pphPasal21Terutang = !input.disetahunkan
		? pphPasal21AtasPkp
		: annualizable
			? Math.round((pphPasal21AtasPkp * annualizeMonths) / 12)
			: 0;
	const pphPasal21TerutangPadaIni = pphPasal21Terutang - input.pphDipotongSebelumnya;
	const pphDipotongAtauDitanggung = input.dtp
		? pphPasal21TerutangPadaIni
		: input.pphDipotongBulanan;

	return {
		tunjanganPph,
		penghasilanBruto,
		biayaJabatan,
		jumlahPengurangan,
		penghasilanNeto,
		penghasilanNetoSetahunDisetahunkan,
		penghasilanTidakKenaPajak,
		penghasilanKenaPajak,
		tarif,
		pphPasal21AtasPkp,
		pphPasal21Terutang,
		pphPasal21TerutangPadaIni,
		pphDipotongAtauDitanggung,
		pphKurangLebihDipotongDesember: pphPasal21TerutangPadaIni - pphDipotongAtauDitanggung
	};
}

export function calculateBpa(input: BpaCalcInput): BpaCalcResult {
	if (!input.grossUp) return calculateOnce(input, input.tunjanganPph);

	// Gross Up (Coretax calculation()): Tunjangan PPh := "PPh Pasal 21 Terutang
	// pada Bukti Ini", recomputed until it stops changing. The map is monotone
	// with slope < 1, so iterating from 0 settles on the same fixed point.
	let tunjanganPph = 0;
	for (let i = 0; i < 1000; i++) {
		const result = calculateOnce(input, tunjanganPph);
		if (result.pphPasal21TerutangPadaIni === tunjanganPph) return result;
		tunjanganPph = result.pphPasal21TerutangPadaIni;
	}
	throw new Error('Perhitungan Gross Up tidak konvergen');
}
