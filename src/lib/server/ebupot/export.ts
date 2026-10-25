import { db } from '$lib/server/db';
import {
	bukti_potong_bp21,
	bukti_potong_bp26,
	fasilitas_pajak_ebupot,
	jenis_dokumen_ebupot,
	kode_objek_pajak_pph,
	negara_spt_pph_badan
} from '$lib/server/db/schema';
import { and, desc, eq, inArray, ne } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';

export type BpExportKind = 'bp21' | 'bp26';
export type BpExportFormat = 'csv' | 'xlsx' | 'print';

export const SIM_LABEL = 'SIMULASI PENDIDIKAN—BUKAN DOKUMEN RESMI DJP';
// D1 allows at most 100 bound parameters per statement (ids + owner + status).
export const MAX_EXPORT_IDS = 50;
export const MAX_EXPORT_ROWS = 5000;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class ExportError extends Error {
	constructor(
		public status: number,
		message: string
	) {
		super(message);
	}
}

// Parses ?ids=a,b,c. Returns null when absent (= all owned rows). Any malformed
// token rejects the whole request rather than silently dropping entries.
export const parseExportIds = (raw: string | null): string[] | null => {
	if (raw === null) return null;
	const parts = raw.split(',').map((s) => s.trim());
	if (parts.length === 0 || parts.some((p) => !UUID.test(p))) {
		throw new ExportError(400, 'Parameter ids harus berupa daftar UUID dipisah koma');
	}
	const unique = [...new Set(parts.map((p) => p.toLowerCase()))];
	if (unique.length > MAX_EXPORT_IDS) {
		throw new ExportError(400, `Maksimal ${MAX_EXPORT_IDS} ID per ekspor`);
	}
	return unique;
};

export type ExportRow = {
	id: string;
	jenis: BpExportKind;
	status: string;
	diterbitkan: boolean;
	nomorPemotongan: string | null;
	tahun: number;
	masaPajak: number;
	pembetulanKe: number;
	pembetulanDariNomor: string | null;
	pembetulanDariId: string | null;
	npwpPemotong: string;
	nitkuPemotong: string | null;
	nitkuPenerima: string | null;
	nomorIdentitasWp: string;
	nama: string;
	statusPtkp: string | null;
	alamat: string | null;
	negara: string | null;
	tanggalLahir: string | null;
	tempatLahir: string | null;
	nomorPaspor: string | null;
	nomorKitasKitap: string | null;
	receiptNumber: string | null;
	kodeObjek: string | null;
	namaObjek: string | null;
	fasilitasKode: string | null;
	fasilitasNama: string | null;
	pendapatanBrutoSebelumnya: number | null;
	bruto: number;
	dpp: number;
	tarif: number;
	pajak: number;
	jenisDokumen: string | null;
	nomorDokumen: string;
	tanggalDokumen: string | null;
	tanggalPemotongan: string | null;
};

const checkComplete = (rows: { id: string }[], ids: string[] | null) => {
	if (ids) {
		const found = new Set(rows.map((r) => r.id.toLowerCase()));
		if (ids.some((id) => !found.has(id))) {
			throw new ExportError(
				404,
				'Satu atau lebih ID tidak ditemukan, bukan milik akun ini, atau sudah dihapus. Tidak ada data diekspor.'
			);
		}
	}
	if (rows.length === 0) {
		throw new ExportError(404, 'Tidak ada bukti potong aktif untuk diekspor');
	}
	if (rows.length > MAX_EXPORT_ROWS) {
		throw new ExportError(
			413,
			`Jumlah baris melebihi ${MAX_EXPORT_ROWS}. Pilih ID tertentu atau kurangi data.`
		);
	}
};

// Read-only: owner-scoped, excludes DELETED, explicit ids must ALL match.
export const loadExportRows = async (
	owner: string,
	jenis: BpExportKind,
	ids: string[] | null
): Promise<ExportRow[]> => {
	if (jenis === 'bp21') {
		const t = bukti_potong_bp21;
		const sumber = alias(bukti_potong_bp21, 'sumber');
		const rows = await db
			.select({
				id: t.id,
				status: t.status,
				diterbitkan: t.diterbitkan,
				nomorPemotongan: t.nomorPemotongan,
				tahun: t.tahun,
				masaPajak: t.masaPajak,
				pembetulanKe: t.pembetulanKe,
				pembetulanDariId: t.pembetulanDariId,
				pembetulanDariNomor: sumber.nomorPemotongan,
				npwpPemotong: t.npwpPemotong,
				nitkuPemotong: t.nitkuPemotong,
				nitkuPenerima: t.nitkuPenerima,
				nomorIdentitasWp: t.nomorIdentitasWp,
				nama: t.namaPenerima,
				statusPtkp: t.statusPtkp,
				kodeObjek: kode_objek_pajak_pph.kode,
				namaObjek: kode_objek_pajak_pph.nama,
				fasilitasKode: fasilitas_pajak_ebupot.kode,
				fasilitasNama: fasilitas_pajak_ebupot.nama,
				pendapatanBrutoSebelumnya: t.pendapatanBrutoSebelumnya,
				bruto: t.penghasilanBruto,
				dpp: t.dpp,
				tarif: t.tarif,
				pajak: t.pajakPenghasilan,
				jenisDokumen: jenis_dokumen_ebupot.nama,
				nomorDokumen: t.nomorDokumen,
				tanggalDokumen: t.tanggalDokumen,
				tanggalPemotongan: t.tanggalPemotongan
			})
			.from(t)
			.leftJoin(sumber, eq(t.pembetulanDariId, sumber.id))
			.leftJoin(kode_objek_pajak_pph, eq(t.kodeObjekPajakId, kode_objek_pajak_pph.id))
			.leftJoin(fasilitas_pajak_ebupot, eq(t.fasilitasPajakId, fasilitas_pajak_ebupot.id))
			.leftJoin(jenis_dokumen_ebupot, eq(t.jenisDokumenId, jenis_dokumen_ebupot.id))
			.where(
				and(
					eq(t.npwpPemotong, owner),
					ne(t.status, 'DELETED'),
					ids ? inArray(t.id, ids) : undefined
				)
			)
			.orderBy(desc(t.tahun), desc(t.masaPajak), t.namaPenerima, t.id)
			.limit(MAX_EXPORT_ROWS + 1);
		checkComplete(rows, ids);
		return rows.map((r) => ({
			...r,
			jenis,
			alamat: null,
			negara: null,
			tanggalLahir: null,
			tempatLahir: null,
			nomorPaspor: null,
			nomorKitasKitap: null,
			receiptNumber: null
		}));
	}

	const t = bukti_potong_bp26;
	const sumber = alias(bukti_potong_bp26, 'sumber');
	const rows = await db
		.select({
			id: t.id,
			status: t.status,
			diterbitkan: t.diterbitkan,
			nomorPemotongan: t.nomorPemotongan,
			tahun: t.tahun,
			masaPajak: t.masaPajak,
			pembetulanKe: t.pembetulanKe,
			pembetulanDariId: t.pembetulanDariId,
			pembetulanDariNomor: sumber.nomorPemotongan,
			npwpPemotong: t.npwpPemotong,
			nitkuPemotong: t.nitkuPemotong,
			nomorIdentitasWp: t.nomorIdentitasWp,
			nama: t.nama,
			alamat: t.alamat,
			negara: negara_spt_pph_badan.nama,
			tanggalLahir: t.tanggalLahir,
			tempatLahir: t.tempatLahir,
			nomorPaspor: t.nomorPaspor,
			nomorKitasKitap: t.nomorKitasKitap,
			receiptNumber: t.receiptNumber,
			kodeObjek: kode_objek_pajak_pph.kode,
			namaObjek: kode_objek_pajak_pph.nama,
			fasilitasKode: fasilitas_pajak_ebupot.kode,
			fasilitasNama: fasilitas_pajak_ebupot.nama,
			bruto: t.penghasilanBruto,
			dpp: t.dpp,
			tarif: t.tarif,
			pajak: t.pajakPenghasilan,
			jenisDokumen: jenis_dokumen_ebupot.nama,
			nomorDokumen: t.nomorDokumen,
			tanggalDokumen: t.tanggalDokumen,
			tanggalPemotongan: t.tanggalPemotongan
		})
		.from(t)
		.leftJoin(sumber, eq(t.pembetulanDariId, sumber.id))
		.leftJoin(negara_spt_pph_badan, eq(t.negaraAsalId, negara_spt_pph_badan.id))
		.leftJoin(kode_objek_pajak_pph, eq(t.kodeObjekPajakId, kode_objek_pajak_pph.id))
		.leftJoin(fasilitas_pajak_ebupot, eq(t.fasilitasPajakId, fasilitas_pajak_ebupot.id))
		.leftJoin(jenis_dokumen_ebupot, eq(t.jenisDokumenId, jenis_dokumen_ebupot.id))
		.where(
			and(
				eq(t.npwpPemotong, owner),
				ne(t.status, 'DELETED'),
				ids ? inArray(t.id, ids) : undefined
			)
		)
		.orderBy(desc(t.tahun), desc(t.masaPajak), t.nama, t.id)
		.limit(MAX_EXPORT_ROWS + 1);
	checkComplete(rows, ids);
	return rows.map((r) => ({
		...r,
		jenis,
		nitkuPenerima: null,
		statusPtkp: null,
		pendapatanBrutoSebelumnya: null
	}));
};

type Cell = string | number | null;
type Column = { header: string; get: (r: ExportRow) => Cell; kinds?: BpExportKind[] };

const asal = (r: ExportRow) => (r.pembetulanKe > 0 || r.pembetulanDariId ? 'Pembetulan' : 'Normal');

const COLUMNS: Column[] = [
	{ header: 'Jenis', get: (r) => r.jenis.toUpperCase() },
	{ header: 'Status', get: (r) => r.status },
	{ header: 'Diterbitkan (Simulasi)', get: (r) => (r.diterbitkan ? 'Ya' : 'Belum') },
	{ header: 'Nomor Bukti Potong (Simulasi)', get: (r) => r.nomorPemotongan },
	{ header: 'Tahun', get: (r) => r.tahun },
	{ header: 'Masa Pajak', get: (r) => r.masaPajak },
	{ header: 'Asal', get: asal },
	{ header: 'Pembetulan Ke', get: (r) => r.pembetulanKe },
	{ header: 'Pembetulan Dari Nomor', get: (r) => r.pembetulanDariNomor },
	{ header: 'NPWP Pemotong', get: (r) => r.npwpPemotong },
	{ header: 'NITKU Pemotong', get: (r) => r.nitkuPemotong },
	{ header: 'Nomor Identitas Penerima', get: (r) => r.nomorIdentitasWp },
	{ header: 'Nama Penerima', get: (r) => r.nama },
	{ header: 'NITKU Penerima', get: (r) => r.nitkuPenerima, kinds: ['bp21'] },
	{ header: 'Status PTKP', get: (r) => r.statusPtkp, kinds: ['bp21'] },
	{ header: 'Alamat', get: (r) => r.alamat, kinds: ['bp26'] },
	{ header: 'Negara Asal', get: (r) => r.negara, kinds: ['bp26'] },
	{ header: 'Tanggal Lahir', get: (r) => r.tanggalLahir, kinds: ['bp26'] },
	{ header: 'Tempat Lahir', get: (r) => r.tempatLahir, kinds: ['bp26'] },
	{ header: 'Nomor Paspor', get: (r) => r.nomorPaspor, kinds: ['bp26'] },
	{ header: 'Nomor KITAS/KITAP', get: (r) => r.nomorKitasKitap, kinds: ['bp26'] },
	{ header: 'Nomor Receipt SKD (Simulasi)', get: (r) => r.receiptNumber, kinds: ['bp26'] },
	{ header: 'Kode Objek Pajak', get: (r) => r.kodeObjek },
	{ header: 'Nama Objek Pajak', get: (r) => r.namaObjek },
	{ header: 'Kode Fasilitas', get: (r) => r.fasilitasKode },
	{ header: 'Fasilitas Pajak', get: (r) => r.fasilitasNama },
	{
		header: 'Pendapatan Bruto Sebelumnya',
		get: (r) => r.pendapatanBrutoSebelumnya,
		kinds: ['bp21']
	},
	{ header: 'Penghasilan Bruto', get: (r) => r.bruto },
	{ header: 'DPP (%)', get: (r) => r.dpp },
	{ header: 'Tarif (%)', get: (r) => r.tarif },
	{ header: 'PPh Dipotong', get: (r) => r.pajak },
	{ header: 'Jenis Dokumen', get: (r) => r.jenisDokumen },
	{ header: 'Nomor Dokumen', get: (r) => r.nomorDokumen },
	{ header: 'Tanggal Dokumen', get: (r) => r.tanggalDokumen },
	{ header: 'Tanggal Pemotongan', get: (r) => r.tanggalPemotongan },
	{ header: 'Keterangan', get: () => SIM_LABEL }
];

const columnsFor = (jenis: BpExportKind) =>
	COLUMNS.filter((c) => !c.kinds || c.kinds.includes(jenis));

// Neutralises spreadsheet formula injection: if the first character that is not
// whitespace/control/invisible is = + - @, prefix an apostrophe.
// eslint-disable-next-line no-control-regex
const LEADING_INVISIBLE = /^[\u0000-\u0020\u007f-\u00a0\u00ad\u061c\u180e\u200b-\u200f\u2028-\u202e\u2060-\u206f\ufeff]*/;
export const safeText = (value: string): string => {
	const rest = value.slice(LEADING_INVISIBLE.exec(value)?.[0].length ?? 0);
	return rest !== '' && '=+-@'.includes(rest[0]) ? `'${value}` : value;
};

const csvCell = (c: Cell): string => {
	if (c === null) return '';
	if (typeof c === 'number') return Number.isFinite(c) ? String(c) : '';
	return `"${safeText(c).replace(/"/g, '""')}"`;
};

export const buildCsv = (rows: ExportRow[], jenis: BpExportKind): string => {
	const cols = columnsFor(jenis);
	const lines = [cols.map((c) => csvCell(c.header)).join(',')];
	for (const r of rows) lines.push(cols.map((c) => csvCell(c.get(r))).join(','));
	return '\uFEFF' + lines.join('\r\n') + '\r\n';
};

export const buildXlsx = async (rows: ExportRow[], jenis: BpExportKind): Promise<Uint8Array<ArrayBuffer>> => {
	// Dynamic on purpose: keeps the large xlsx bundle out of CSV/print requests (server-only module).
	const XLSX = await import('xlsx');
	const cols = columnsFor(jenis);
	const title = `${jenis.toUpperCase()} SIMULASI`;
	const aoa: (string | number | null)[][] = [
		[SIM_LABEL],
		[],
		cols.map((c) => c.header),
		...rows.map((r) =>
			cols.map((c) => {
				const v = c.get(r);
				return typeof v === 'string' ? safeText(v) : v;
			})
		)
	];
	const ws = XLSX.utils.aoa_to_sheet(aoa);
	ws['!cols'] = cols.map((c) => ({ wch: Math.max(12, Math.min(40, c.header.length + 2)) }));
	const wb = XLSX.utils.book_new();
	wb.Props = { Title: `${title} - bukan dokumen resmi DJP` };
	XLSX.utils.book_append_sheet(wb, ws, title);
	return new Uint8Array(XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer);
};

export const escapeHtml = (value: string): string =>
	value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');

const NUM = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 });

const displayCell = (header: string, v: Cell): string => {
	if (v === null || v === '') return '-';
	if (typeof v === 'number') {
		return /^(Penghasilan|PPh|Pendapatan)/.test(header) ? `Rp ${NUM.format(v)}` : NUM.format(v);
	}
	return v;
};

export const buildPrintHtml = (rows: ExportRow[], jenis: BpExportKind, nonce: string): string => {
	const cols = columnsFor(jenis).filter((c) => c.header !== 'Keterangan');
	const title = `Cetak ${jenis.toUpperCase()} (Simulasi)`;
	const slips = rows
		.map((r) => {
			const body = cols
				.map(
					(c) =>
						`<tr><th>${escapeHtml(c.header)}</th><td>${escapeHtml(displayCell(c.header, c.get(r)))}</td></tr>`
				)
				.join('');
			return `<section class="slip"><div class="sim">${escapeHtml(SIM_LABEL)}</div><h1>Bukti Pemotongan ${escapeHtml(jenis.toUpperCase())}</h1><table>${body}</table><div class="sim">${escapeHtml(SIM_LABEL)}</div></section>`;
		})
		.join('');
	return `<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>${escapeHtml(title)}</title><style>
@page{size:A4;margin:12mm}
body{font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:#111;margin:0;background:#eee}
.bar{position:sticky;top:0;background:#fff;padding:8px 12px;border-bottom:1px solid #ccc;display:flex;gap:12px;align-items:center}
.bar button{font-size:12pt;padding:6px 14px;cursor:pointer}
.slip{background:#fff;width:186mm;min-height:270mm;margin:12px auto;padding:6mm;box-sizing:border-box;page-break-after:always;break-after:page}
.slip:last-of-type{page-break-after:auto;break-after:auto}
.sim{border:2px solid #b00020;color:#b00020;font-weight:bold;text-align:center;padding:4px;margin:6px 0}
h1{font-size:15pt;text-align:center;margin:8px 0}
table{width:100%;border-collapse:collapse}
th,td{border:1px solid #888;padding:3px 6px;text-align:left;vertical-align:top;font-size:10pt;overflow-wrap:anywhere}
th{width:42%;background:#f3f3f3}
@media print{body{background:#fff}.bar{display:none}.slip{margin:0;padding:0;width:auto;min-height:0}}
</style></head><body><div class="bar"><button type="button" id="cetak">Cetak / Simpan PDF</button><span>${rows.length} bukti potong. ${escapeHtml(SIM_LABEL)}. Pilih &quot;Simpan sebagai PDF&quot; pada dialog cetak peramban.</span></div>${slips}<script nonce="${nonce}">document.getElementById('cetak').addEventListener('click',function(){window.print();});</script></body></html>`;
};

export const newNonce = (): string => {
	const bytes = crypto.getRandomValues(new Uint8Array(16));
	let s = '';
	for (const b of bytes) s += String.fromCharCode(b);
	return btoa(s);
};
