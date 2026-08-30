import type { KodeObjekPajakParameterData } from '$lib/server/db/schema';
import type { Bpa1Ptkp } from '$lib/helpers/ptkp-bpa1';

// Amounts are the standard PMK 101/2016 PTKP table; K/0=58,500,000 and
// TK/0=54,000,000 live-verified exact on Coretax's own "Penghasilan Tidak
// Kena Pajak" field (see docs/ui-reference/coretax/ebupot/NOTES.md
// "BPA1"), the rest filled in from the same well-established, stable
// schedule (each dependent/status step is a flat +4,500,000, capped at 3
// dependents).
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

// Biaya Jabatan/Biaya Pensiun = min(5% x bruto, Rp500.000 x jumlah bulan
// dalam periode Masa Pajak Awal..Akhir). Live-verified: bruto=200,000,000
// over an 8-month period (Jan-Aug) -> Biaya Jabatan capped at 4,000,000
// (500,000 x 8), not the flat annual 6,000,000 figure -- the cap scales
// with the BPA1's actual period length, not always a full year.
export const calculateBiayaJabatan = (bruto: number, monthCount: number): number =>
	Math.min(Math.round(bruto * 0.05), 500_000 * monthCount);

export const monthCountInclusive = (
	masaPajakAwal: number,
	tahunAwal: number,
	masaPajakAkhir: number,
	tahunAkhir: number
): number => (tahunAkhir - tahunAwal) * 12 + (masaPajakAkhir - masaPajakAwal) + 1;

export type ResolvedBpa1Tax = {
	tarif: number;
	pajakPenghasilan: number;
	manualTarif: boolean;
};

// tax(x) = x * band(x).Rate/100 - band(x).Minus, the same Pasal 17
// progressive-bracket mechanism as BP21's cumulative branch
// (resolveBp21.ts) -- live-verified exact: Penghasilan Kena Pajak
// 137,500,000 -> bracket [60,000,001-250,000,000, Rate=15, Minus=6,000,000]
// -> 137,500,000*15% - 6,000,000 = 14,625,000.
export const resolveBpa1Tax = (
	parameterData: KodeObjekPajakParameterData,
	fasilitasKode: string,
	penghasilanKenaPajak: number
): ResolvedBpa1Tax => {
	const item = parameterData.ItemList.find(
		(entry) =>
			entry.TaxCertificateCode === fasilitasKode ||
			entry.TaxCertificateCodes?.includes(fasilitasKode)
	);

	if (!item) {
		throw new Error('Fasilitas pajak tidak berlaku untuk objek pajak ini');
	}

	const manualTarif = item.ManualTaxRate?.toUpperCase() === 'TRUE';

	if (penghasilanKenaPajak <= 0) {
		return { tarif: 0, pajakPenghasilan: 0, manualTarif };
	}

	const band = item.Rates?.find((b) => penghasilanKenaPajak >= b.Min && penghasilanKenaPajak <= b.Max);
	if (!band) {
		return { tarif: 0, pajakPenghasilan: 0, manualTarif };
	}

	const pajakPenghasilan = Math.round(
		penghasilanKenaPajak * (band.Rate / 100) - (band.Minus ?? 0)
	);
	return { tarif: band.Rate, pajakPenghasilan, manualTarif };
};
