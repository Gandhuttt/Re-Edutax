// L-3B Bagian A, REKAPITULASI PEREDARAN BRUTO TERTENTU (PP 55/2022, final 0,5%).
//
// Measured end to end in L3B.md by filling Januari and Februari with
// 3.000.000.000 each. Pure logic, no schema coupling, same reasoning as
// reusing computeLabaRugiRows from the Badan side rather than duplicating it.
//
// The exemption (500.000.000, the first Rp 500 juta of ANNUAL cumulative
// turnover) is consumed as early as possible against the running total, not
// spread evenly across months. A taxpayer whose January turnover alone exceeds
// it pays the 0,5% final rate on the excess starting that same month.
const EXEMPTION = 500_000_000;
const TARIFF = 0.005;

export interface BulanFinal {
	peredaranBruto: number;
	disetorSendiri: number;
	dipotongPihakLain: number;
}

export interface BarisFinalTerhitung {
	bulan: number;
	peredaranBruto: number;
	akumulasi: number;
	kenaPajak: number;
	pphTerutang: number;
	disetorSendiri: number;
	dipotongPihakLain: number;
	selisih: number;
}

export function hitungPeredaranBrutoFinal(bulanan: BulanFinal[]): {
	baris: BarisFinalTerhitung[];
	totalBruto: number;
	totalKenaPajak: number;
	totalPphTerutang: number;
	totalDisetorSendiri: number;
	totalDipotongPihakLain: number;
	totalSelisih: number;
} {
	let akumulasi = 0;
	const baris: BarisFinalTerhitung[] = bulanan.map((bulan, index) => {
		const sebelum = akumulasi;
		akumulasi += bulan.peredaranBruto;
		// Exemption remaining when this month starts; this month's kena is
		// bruto minus whatever of that remaining exemption it absorbs.
		const sisaBebas = Math.max(0, EXEMPTION - sebelum);
		const kena = Math.max(0, bulan.peredaranBruto - sisaBebas);
		const pphTerutang = Math.round(kena * TARIFF);
		const selisih = pphTerutang - bulan.disetorSendiri - bulan.dipotongPihakLain;

		return {
			bulan: index + 1,
			peredaranBruto: bulan.peredaranBruto,
			akumulasi,
			kenaPajak: kena,
			pphTerutang,
			disetorSendiri: bulan.disetorSendiri,
			dipotongPihakLain: bulan.dipotongPihakLain,
			selisih
		};
	});

	return {
		baris,
		totalBruto: baris.reduce((s, b) => s + b.peredaranBruto, 0),
		totalKenaPajak: baris.reduce((s, b) => s + b.kenaPajak, 0),
		totalPphTerutang: baris.reduce((s, b) => s + b.pphTerutang, 0),
		totalDisetorSendiri: baris.reduce((s, b) => s + b.disetorSendiri, 0),
		totalDipotongPihakLain: baris.reduce((s, b) => s + b.dipotongPihakLain, 0),
		totalSelisih: baris.reduce((s, b) => s + b.selisih, 0)
	};
}
