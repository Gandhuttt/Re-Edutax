import { hitungFasilitas31E } from '../L8/fasilitas31e';

export type TarifPajak = 'pasal_17_1_b' | 'pasal_17_2b' | 'pasal_31e' | 'lainnya';

const TARIF_PASAL_17_1_B = 0.22;
const TARIF_PASAL_17_2B = 0.17;

export interface ComputeIndukDEFInput {
	netoFiskalSebelumFasilitas: number;

	d6FasilitasBrutoVokasi: boolean;
	l13bBNilai: number[];

	d8AdaKompensasiKerugian: boolean;
	l7KompensasiTahunIni: number[];

	d10FasilitasBrutoLitbang: boolean;
	l13bC: { jumlahBiaya: number; persentaseFasilitasPajak: number }[];
	l13bDTermanfaatkanTahunSebelumnya: number;

	tarifPajak: TarifPajak | null | undefined;
	persentaseTarifLainnya: number;
	l8JumlahPeredaranBruto: number;
	l8PenghasilanKenaPajak: number;

	e13AdaKreditPajakLuarNegeri: boolean;
	l3aKreditPajak: number[];
	l3bPph: number[];
	e14AngsuranPph25TahunBerjalan: number;
	e15StpPph25: number;

	f17bAdaSkPengangsuranPenundaan: boolean;
	f17bJumlahDiangsurDitunda: number;
}

export function computeIndukDEF(input: ComputeIndukDEFInput) {
	const d4 = input.netoFiskalSebelumFasilitas;

	const d6Amt = input.d6FasilitasBrutoVokasi ? sum(input.l13bBNilai) : 0;
	const d7 = d4 - d6Amt;

	const d8Amt = input.d8AdaKompensasiKerugian ? sum(input.l7KompensasiTahunIni) : 0;
	const litbangCapBase = d7 - d8Amt;

	const jumlahTambahanPengurangLitbang = sum(
		input.l13bC.map((row) => Math.round((row.jumlahBiaya * row.persentaseFasilitasPajak) / 100))
	);
	const belumTermanfaatkanTahunIni = jumlahTambahanPengurangLitbang - input.l13bDTermanfaatkanTahunSebelumnya;
	const dapatDibebankanTahunIni = Math.max(0, Math.min(belumTermanfaatkanTahunIni, 0.4 * litbangCapBase));
	const d10Amt = input.d10FasilitasBrutoLitbang ? dapatDibebankanTahunIni : 0;

	const d9 = d7 - d8Amt - d10Amt;

	const d12 = computeD12(input.tarifPajak, d9, input.persentaseTarifLainnya, input.l8JumlahPeredaranBruto, input.l8PenghasilanKenaPajak);

	const e13Amt = input.e13AdaKreditPajakLuarNegeri
		? sum(input.l3aKreditPajak) + sum(input.l3bPph)
		: 0;

	const f17a = d12 - e13Amt - input.e14AngsuranPph25TahunBerjalan - input.e15StpPph25;
	const f17c = f17a - (input.f17bAdaSkPengangsuranPenundaan ? input.f17bJumlahDiangsurDitunda : 0);

	const angsuranPph25TahunDepan = Math.round((d12 - e13Amt) / 12);

	return {
		d4,
		d6Amt,
		d7,
		d8Amt,
		litbangCapBase,
		dapatDibebankanTahunIni,
		d10Amt,
		d9,
		d12,
		e13Amt,
		f17a,
		f17c,
		angsuranPph25TahunDepan
	};
}

function computeD12(
	tarifPajak: TarifPajak | null | undefined,
	d9: number,
	persentaseTarifLainnya: number,
	l8JumlahPeredaranBruto: number,
	l8PenghasilanKenaPajak: number
) {
	switch (tarifPajak) {
		case 'pasal_31e':
			return hitungFasilitas31E(l8JumlahPeredaranBruto, l8PenghasilanKenaPajak).pphTerutangJumlah;
		case 'pasal_17_2b':
			return Math.floor(d9 * TARIF_PASAL_17_2B);
		case 'lainnya':
			return Math.floor((d9 * persentaseTarifLainnya) / 100);
		case 'pasal_17_1_b':
		default:
			return Math.floor(d9 * TARIF_PASAL_17_1_B);
	}
}

function sum(values: number[]) {
	return values.reduce((total, value) => total + value, 0);
}
