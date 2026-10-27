export const SPT_UNIFIKASI_YEARS = [2025, 2026] as const;
export type SptUnifikasiStatus = 'konsep' | 'menunggu_pembayaran' | 'dilaporkan';
export const UNIFIKASI_ARTICLES = ['Pasal 4 Ayat 2', 'Pasal 15', 'Pasal 22', 'Pasal 23', 'Pasal 26'] as const;
export type UnifikasiArticle = (typeof UNIFIKASI_ARTICLES)[number];

export type SptUnifikasiSource = {
	id: string;
	nomor: string;
	tanggalDokumen: string | null;
	identitas: string;
	nama: string;
	kodeObjek: string;
	namaObjek: string;
	pasal: UnifikasiArticle;
	kapKjs: string;
	dpp: number;
	tarif: number;
	pajak: number;
	dtp: number;
	fasilitasKode: string;
	fasilitas: string;
	nitku: string;
	status: string;
};
export type SptUnifikasiTaxRow = {
	pasal: UnifikasiArticle;
	kapKjs: string;
	pemotongan: number;
	dtp: number;
	terutang: number;
	pembayaranSebelumnya: number;
	kurangLebihBayar: number;
	harusDibayar: number;
};
export type SptUnifikasiSnapshot = {
	sources: SptUnifikasiSource[];
	rows: SptUnifikasiTaxRow[];
	totalDpp: number;
	totalPemotongan: number;
	totalDtp: number;
	totalTerutang: number;
	totalPembayaranSebelumnya: number;
	kurangLebihBayar: number;
	harusDibayar: number;
};
export type SptUnifikasiDetail = {
	id: string;
	npwpPemotong: string;
	namaPemotong: string;
	alamatPemotong: string | null;
	teleponPemotong: string | null;
	masaPajak: number;
	tahun: number;
	chainId: string;
	pembetulanKe: number;
	status: SptUnifikasiStatus;
	revision: number;
	createdAt: Date;
	tanggalDiperbarui: Date | null;
	tanggalDilaporkan: Date | null;
	pernyataan: boolean;
	snapshot: SptUnifikasiSnapshot;
	sourcesChanged: boolean;
	isLatest: boolean;
	pembayaran: number;
};
export type SptUnifikasiListRow = Pick<SptUnifikasiDetail, 'id' | 'masaPajak' | 'tahun' | 'pembetulanKe' | 'status' | 'createdAt' | 'tanggalDiperbarui' | 'tanggalDilaporkan' | 'isLatest'> & {
	kurangLebihBayar: number;
	harusDibayar: number;
};

export class SptUnifikasiError extends Error {
	constructor(message: string, readonly status: 400 | 404 | 409 = 400) { super(message); }
}
function amount(value: number): number {
	if (!Number.isSafeInteger(value) || value < 0) throw new SptUnifikasiError('Nilai rupiah BPPU harus bilangan bulat nol atau positif.');
	return value;
}
function add(a: number, b: number): number {
	const value = a + b;
	if (!Number.isSafeInteger(value)) throw new SptUnifikasiError('Total rupiah melampaui batas angka yang aman.');
	return value;
}
/** Article of a KAP-KJS that has no source row (prior payment only). KJS 600 is Pasal 15 even under the 411128 KAP. */
export function unifikasiArticleForKap(kapKjs: string): UnifikasiArticle | null {
	if (!/^\d{6}-\d{3}$/.test(kapKjs)) return null;
	if (kapKjs === '411128-600' || kapKjs === '411129-600') return 'Pasal 15';
	if (kapKjs.startsWith('411128-')) return 'Pasal 4 Ayat 2';
	if (kapKjs.startsWith('411122-')) return 'Pasal 22';
	if (kapKjs.startsWith('411124-')) return 'Pasal 23';
	if (kapKjs.startsWith('411127-')) return 'Pasal 26';
	return null;
}
/** Fixed zero-filled Induk rows observed in Coretax; always present regardless of sources/payments. */
export const UNIFIKASI_STANDARD_ROWS: ReadonlyArray<{ pasal: UnifikasiArticle; kapKjs: string }> = [
	{ pasal: 'Pasal 4 Ayat 2', kapKjs: '411128-100' }, { pasal: 'Pasal 4 Ayat 2', kapKjs: '411128-402' }, { pasal: 'Pasal 4 Ayat 2', kapKjs: '411128-403' },
	{ pasal: 'Pasal 15', kapKjs: '411128-600' }, { pasal: 'Pasal 15', kapKjs: '411129-600' },
	{ pasal: 'Pasal 22', kapKjs: '411122-100' }, { pasal: 'Pasal 22', kapKjs: '411122-900' }, { pasal: 'Pasal 22', kapKjs: '411122-910' },
	{ pasal: 'Pasal 23', kapKjs: '411124-100' },
	{ pasal: 'Pasal 26', kapKjs: '411127-110' }
];
/** BPPU-only simulator: liabilities and prior payments stay separated by KAP-KJS. */
export function aggregateSptUnifikasi(sources: SptUnifikasiSource[], payments: Record<string, number> = {}, paymentArticles: Record<string, UnifikasiArticle> = {}): SptUnifikasiSnapshot {
	const groups = new Map<string, SptUnifikasiTaxRow>(UNIFIKASI_STANDARD_ROWS.map(({ pasal, kapKjs }) => [kapKjs, { pasal, kapKjs, pemotongan: 0, dtp: 0, terutang: 0, pembayaranSebelumnya: 0, kurangLebihBayar: 0, harusDibayar: 0 }]));
	const seen = new Set<string>();
	let totalDpp = 0;
	for (const source of sources) {
		if (seen.has(source.id)) throw new SptUnifikasiError('BPPU sumber terduplikasi.');
		seen.add(source.id);
		if (!UNIFIKASI_ARTICLES.includes(source.pasal) || !/^\d{6}-\d{3}$/.test(source.kapKjs) || !source.nomor) throw new SptUnifikasiError('Pasal, KAP-KJS, atau nomor BPPU sumber tidak valid.');
		amount(source.dpp); amount(source.pajak); amount(source.dtp);
		if (source.dtp > source.pajak || !Number.isFinite(source.tarif) || source.tarif < 0) throw new SptUnifikasiError('Pajak/fasilitas BPPU sumber tidak valid.');
		totalDpp = add(totalDpp, source.dpp);
		let row = groups.get(source.kapKjs);
		if (!row) {
			row = { pasal: source.pasal, kapKjs: source.kapKjs, pemotongan: 0, dtp: 0, terutang: 0, pembayaranSebelumnya: 0, kurangLebihBayar: 0, harusDibayar: 0 };
			groups.set(source.kapKjs, row);
		}
		if (row.pasal !== source.pasal) throw new SptUnifikasiError('KAP-KJS sumber memiliki pasal yang tidak konsisten.');
		row.pemotongan = add(row.pemotongan, source.pajak);
		row.dtp = add(row.dtp, source.dtp);
	}
	for (const [kapKjs, value] of Object.entries(payments)) {
		amount(value);
		if (!value) continue;
		if (!groups.has(kapKjs)) {
			const article = paymentArticles[kapKjs] ?? unifikasiArticleForKap(kapKjs);
			if (!article) throw new SptUnifikasiError('KAP-KJS pembayaran sebelumnya tidak valid.');
			groups.set(kapKjs, { pasal: article, kapKjs, pemotongan: 0, dtp: 0, terutang: 0, pembayaranSebelumnya: 0, kurangLebihBayar: 0, harusDibayar: 0 });
		}
	}
	const rows = [...groups.values()].sort((a, b) => UNIFIKASI_ARTICLES.indexOf(a.pasal) - UNIFIKASI_ARTICLES.indexOf(b.pasal) || a.kapKjs.localeCompare(b.kapKjs));
	const result: SptUnifikasiSnapshot = { sources, rows, totalDpp, totalPemotongan: 0, totalDtp: 0, totalTerutang: 0, totalPembayaranSebelumnya: 0, kurangLebihBayar: 0, harusDibayar: 0 };
	for (const row of rows) {
		row.terutang = row.pemotongan - row.dtp;
		row.pembayaranSebelumnya = amount(payments[row.kapKjs] ?? 0);
		row.kurangLebihBayar = row.terutang - row.pembayaranSebelumnya;
		row.harusDibayar = Math.max(0, row.kurangLebihBayar);
		result.totalPemotongan = add(result.totalPemotongan, row.pemotongan);
		result.totalDtp = add(result.totalDtp, row.dtp);
		result.totalTerutang = add(result.totalTerutang, row.terutang);
		result.totalPembayaranSebelumnya = add(result.totalPembayaranSebelumnya, row.pembayaranSebelumnya);
		result.kurangLebihBayar = add(result.kurangLebihBayar, row.kurangLebihBayar);
		result.harusDibayar = add(result.harusDibayar, row.harusDibayar);
	}
	return result;
}
