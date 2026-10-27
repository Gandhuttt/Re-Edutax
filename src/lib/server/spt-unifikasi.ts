import { db, type Statement } from '$lib/server/db';
import { spt_pph_unifikasi as t, wajib_pajak, tempat_kegiatan_usaha, bukti_potong_bpu } from '$lib/server/db/schema';
import { and, eq, desc, sql, getTableColumns, type SQL } from 'drizzle-orm';
import {
	aggregateSptUnifikasi, SPT_UNIFIKASI_YEARS, SptUnifikasiError, UNIFIKASI_ARTICLES,
	type SptUnifikasiDetail, type SptUnifikasiListRow, type SptUnifikasiSnapshot, type SptUnifikasiSource,
	type SptUnifikasiStatus, type UnifikasiArticle
} from '$lib/helpers/spt-unifikasi';
export { SptUnifikasiError } from '$lib/helpers/spt-unifikasi';

type Row = typeof t.$inferSelect;
const DTP_FACILITY_CODE = '4';

const guard = (condition: SQL): Statement => db.select({ g: sql<number>`CASE WHEN ${condition} THEN 1 ELSE abs(-9223372036854775808) END` }).from(sql`(SELECT 1) AS spt_guard`);
async function batch(statements: [Statement, ...Statement[]]) {
	try { await db.batch(statements); } catch (cause) {
		if (cause instanceof Error && /integer overflow|UNIQUE constraint/i.test(`${cause.message} ${String(cause.cause ?? '')}`)) throw new SptUnifikasiError('Data/status berubah atau SPT periode ini sudah ada. Muat ulang; tidak ada perubahan disimpan.', 409);
		throw cause;
	}
}
const owned = (owner: string, id: string) => and(eq(t.npwpPemotong, owner), eq(t.id, id));
async function load(owner: string, id: string): Promise<Row> {
	if (!owner) throw new SptUnifikasiError('Belum login.');
	const [row] = await db.select().from(t).where(owned(owner, id)).limit(1);
	if (!row) throw new SptUnifikasiError('SPT Unifikasi tidak ditemukan.', 404);
	return row;
}
const rowInvariant = (row: Row) => sql`EXISTS (SELECT 1 FROM ${t} WHERE ${t.id}=${row.id} AND ${t.npwpPemotong}=${row.npwpPemotong} AND ${t.revision}=${row.revision} AND ${t.status}=${row.status})`;
const latestInvariant = (row: Row) => sql`NOT EXISTS (SELECT 1 FROM ${t} WHERE ${t.npwpPemotong}=${row.npwpPemotong} AND ${t.chainId}=${row.chainId} AND ${t.pembetulanKe}>${row.pembetulanKe})`;
/** Every earlier revision of the chain is reported (immutable), so cumulative prior payments cannot move underneath us. */
const chainInvariant = (owner: string, chainId: string, pembetulanKe: number) => sql`(SELECT count(*) FROM ${t} WHERE ${t.npwpPemotong}=${owner} AND ${t.chainId}=${chainId} AND ${t.status}='dilaporkan' AND ${t.pembetulanKe}<${pembetulanKe})=${pembetulanKe}`;

/**
 * Database-side deterministic signature of every issued BPPU of the period, including the
 * reference rows (object/facility) that influence aggregation. Also guards races inside D1 batches.
 */
function sourceExpression(owner: string, month: number, year: number): SQL<string> {
	const c = getTableColumns(bukti_potong_bpu);
	const pairs = Object.entries(c).flatMap(([key, column]) => [sql.raw(`'${key}'`), sql`${column}`]);
	pairs.push(
		sql`'objek'`, sql`json((SELECT json_object('id',o.id,'jenis',o.jenis_bukti_potong,'kode',o.kode,'nama',o.nama,'pasal',o.pasal,'kap',o.kap) FROM kode_objek_pajak_pph o WHERE o.id=${c.kodeObjekPajakId}))`,
		sql`'fasilitas'`, sql`json((SELECT json_object('id',f.id,'kode',f.kode,'nama',f.nama) FROM fasilitas_pajak_ebupot f WHERE f.id=${c.fasilitasPajakId}))`
	);
	return sql<string>`json_object('sources', json((SELECT coalesce(json_group_array(json(v)), '[]') FROM (SELECT json_object(${sql.join(pairs, sql`,`)}) AS v FROM ${bukti_potong_bpu} WHERE ${c.npwpPemotong}=${owner} AND ${c.diterbitkan}=1 AND ${c.status} IN ('NORMAL','SUBMITTED') AND ${c.masaPajak}=${month} AND ${c.tahun}=${year} ORDER BY ${c.id}))))`;
}

function record(value: unknown, message = 'Sumber BPPU rusak.'): Record<string, unknown> {
	if (!value || typeof value !== 'object' || Array.isArray(value)) throw new SptUnifikasiError(message);
	return Object.fromEntries(Object.entries(value));
}
function text(row: Record<string, unknown>, key: string): string { const value = row[key]; return typeof value === 'string' ? value : ''; }
function num(row: Record<string, unknown>, key: string): number {
	const value = row[key];
	if (typeof value !== 'number') throw new SptUnifikasiError(`Nilai ${key} BPPU sumber tidak valid.`);
	return value;
}
const isArticle = (value: string): value is UnifikasiArticle => UNIFIKASI_ARTICLES.some(article => article === value);

function parseSources(signature: string, owner: string): SptUnifikasiSource[] {
	let parsed: unknown;
	try { parsed = JSON.parse(signature); } catch { throw new SptUnifikasiError('Sumber BPPU tidak dapat dibaca.'); }
	const list = record(parsed).sources;
	if (!Array.isArray(list)) throw new SptUnifikasiError('Sumber BPPU tidak valid.');
	return list.map((item): SptUnifikasiSource => {
		const row = record(item);
		const id = text(row, 'id');
		const nomor = text(row, 'nomorPemotongan');
		if (!id || !nomor) throw new SptUnifikasiError('BPPU terbit tanpa nomor pemotongan; periksa data BPPU.');
		if (row.kodeObjekPajakId == null || row.objek == null) throw new SptUnifikasiError(`BPPU ${nomor}: kode objek pajak belum dipilih atau referensinya tidak ditemukan.`);
		const objek = record(row.objek);
		if (text(objek, 'jenis') !== 'bpu') throw new SptUnifikasiError(`BPPU ${nomor}: kode objek pajak bukan referensi BPPU.`);
		const pasal = text(objek, 'pasal');
		if (!isArticle(pasal)) throw new SptUnifikasiError(`BPPU ${nomor}: pasal "${pasal}" tidak didukung SPT Unifikasi.`);
		const kapKjs = text(objek, 'kap');
		if (!/^\d{6}-\d{3}$/.test(kapKjs)) throw new SptUnifikasiError(`BPPU ${nomor}: KAP-KJS "${kapKjs}" tidak valid.`);
		let fasilitasKode = '', fasilitas = '';
		if (row.fasilitasPajakId != null) {
			if (row.fasilitas == null) throw new SptUnifikasiError(`BPPU ${nomor}: referensi fasilitas pajak tidak ditemukan.`);
			const facility = record(row.fasilitas);
			fasilitasKode = text(facility, 'kode'); fasilitas = text(facility, 'nama');
		}
		const pajak = num(row, 'pajakPenghasilan');
		return {
			id, nomor,
			tanggalDokumen: typeof row.tanggalDokumen === 'string' && row.tanggalDokumen ? row.tanggalDokumen : null,
			identitas: text(row, 'nomorIdentitasWp'), nama: text(row, 'namaPenerima'),
			kodeObjek: text(objek, 'kode'), namaObjek: text(objek, 'nama'), pasal, kapKjs,
			dpp: num(row, 'dasarPengenaanPajak'), tarif: num(row, 'tarif'), pajak,
			dtp: fasilitasKode === DTP_FACILITY_CODE ? pajak : 0,
			fasilitasKode, fasilitas, nitku: `${owner}000000`, status: text(row, 'status')
		};
	}).sort((a, b) => a.nomor.localeCompare(b.nomor) || a.id.localeCompare(b.id));
}
async function readSignature(owner: string, month: number, year: number): Promise<string> {
	const [result] = await db.select({ signature: sourceExpression(owner, month, year) }).from(sql`(SELECT 1) AS source_read`);
	return result.signature;
}

function addSafe(a: number, b: number): number {
	const value = a + b;
	if (!Number.isSafeInteger(value)) throw new SptUnifikasiError('Total pembayaran melampaui batas angka yang aman.');
	return value;
}
/** Cumulative actual payments of reported earlier revisions of a chain, per KAP-KJS (never prior liability). */
async function priorPayments(owner: string, chainId: string, below: number) {
	const rows = await db.select().from(t).where(and(eq(t.npwpPemotong, owner), eq(t.chainId, chainId), eq(t.status, 'dilaporkan'))).orderBy(t.pembetulanKe);
	const earlier = rows.filter(row => row.pembetulanKe < below);
	if (earlier.length !== below) throw new SptUnifikasiError('Rantai pembetulan SPT tidak konsisten.', 409);
	const payments: Record<string, number> = {};
	const articles: Record<string, UnifikasiArticle> = {};
	for (const row of earlier) {
		for (const snapshotRow of row.snapshot.rows) articles[snapshotRow.kapKjs] = snapshotRow.pasal;
		for (const [kap, value] of Object.entries(row.pembayaran)) payments[kap] = addSafe(payments[kap] ?? 0, value);
	}
	return { payments, articles };
}
async function build(owner: string, month: number, year: number, chainId: string, pembetulanKe: number) {
	const signature = await readSignature(owner, month, year);
	const prior = await priorPayments(owner, chainId, pembetulanKe);
	const snapshot = aggregateSptUnifikasi(parseSources(signature, owner), prior.payments, prior.articles);
	return { signature, snapshot };
}
function payable(snapshot: SptUnifikasiSnapshot): Record<string, number> {
	return Object.fromEntries(snapshot.rows.filter(row => row.harusDibayar > 0).map(row => [row.kapKjs, row.harusDibayar]));
}
const paidTotal = (payments: Record<string, number>) => Object.values(payments).reduce(addSafe, 0);
function validPeriod(masaPajak: number, tahun: number) {
	if (!Number.isInteger(masaPajak) || masaPajak < 1 || masaPajak > 12 || !SPT_UNIFIKASI_YEARS.some(year => year === tahun)) throw new SptUnifikasiError('Masa/tahun SPT Unifikasi harus 1–12 dan 2025/2026.');
}
function concept(row: Row) { if (row.status !== 'konsep') throw new SptUnifikasiError('SPT Unifikasi yang sudah disampaikan tidak dapat diubah.', 409); }

export async function getSptUnifikasi(owner: string, id: string): Promise<SptUnifikasiDetail> {
	const row = await load(owner, id);
	// Snapshots (including reported ones) are always read from storage; live rows only drive the change flag.
	let sourcesChanged = false;
	if (row.status !== 'dilaporkan') sourcesChanged = (await readSignature(owner, row.masaPajak, row.tahun)) !== row.sourceSignature;
	const [latest] = await db.select({ pembetulanKe: t.pembetulanKe }).from(t).where(and(eq(t.npwpPemotong, owner), eq(t.chainId, row.chainId))).orderBy(desc(t.pembetulanKe)).limit(1);
	const [profile] = await db.select({ telepon: wajib_pajak.nomor_telepon, alamat: tempat_kegiatan_usaha.alamat }).from(wajib_pajak)
		.leftJoin(tempat_kegiatan_usaha, and(eq(tempat_kegiatan_usaha.wajib_pajak, wajib_pajak.id), eq(tempat_kegiatan_usaha.nitku, `${owner}000000`)))
		.where(eq(wajib_pajak.npwp, owner)).limit(1);
	return {
		id: row.id, npwpPemotong: row.npwpPemotong, namaPemotong: row.namaPemotong,
		alamatPemotong: profile?.alamat || null, teleponPemotong: profile?.telepon || null,
		masaPajak: row.masaPajak, tahun: row.tahun, chainId: row.chainId, pembetulanKe: row.pembetulanKe,
		status: row.status, revision: row.revision, createdAt: row.createdAt,
		tanggalDiperbarui: row.tanggalDiperbarui, tanggalDilaporkan: row.tanggalDilaporkan,
		pernyataan: row.pernyataan, snapshot: row.snapshot, sourcesChanged,
		isLatest: !latest || latest.pembetulanKe <= row.pembetulanKe, pembayaran: paidTotal(row.pembayaran)
	};
}

export async function listSptUnifikasi(owner: string, status?: SptUnifikasiStatus): Promise<SptUnifikasiListRow[]> {
	if (!owner) throw new SptUnifikasiError('Belum login.');
	const rows = await db.select().from(t).where(eq(t.npwpPemotong, owner)).orderBy(desc(t.createdAt));
	const latest = new Map<string, number>();
	for (const row of rows) latest.set(row.chainId, Math.max(latest.get(row.chainId) ?? 0, row.pembetulanKe));
	return rows.filter(row => !status || row.status === status).map(row => ({
		id: row.id, masaPajak: row.masaPajak, tahun: row.tahun, pembetulanKe: row.pembetulanKe, status: row.status,
		createdAt: row.createdAt, tanggalDiperbarui: row.tanggalDiperbarui, tanggalDilaporkan: row.tanggalDilaporkan,
		isLatest: latest.get(row.chainId) === row.pembetulanKe,
		kurangLebihBayar: row.snapshot.kurangLebihBayar, harusDibayar: row.snapshot.harusDibayar
	}));
}

export async function createSptUnifikasi(owner: string, masaPajak: number, tahun: number): Promise<string> {
	if (!owner) throw new SptUnifikasiError('Belum login.');
	validPeriod(masaPajak, tahun);
	const [identity] = await db.select().from(wajib_pajak).where(eq(wajib_pajak.npwp, owner)).limit(1);
	if (!identity) throw new SptUnifikasiError('Identitas wajib pajak tidak ditemukan.', 404);
	const [existing] = await db.select({ id: t.id }).from(t).where(and(eq(t.npwpPemotong, owner), eq(t.tahun, tahun), eq(t.masaPajak, masaPajak), eq(t.pembetulanKe, 0))).limit(1);
	if (existing) throw new SptUnifikasiError('SPT Unifikasi normal untuk masa pajak ini sudah ada.', 409);
	const id = crypto.randomUUID();
	const built = await build(owner, masaPajak, tahun, id, 0);
	const now = new Date();
	await batch([
		guard(sql`NOT EXISTS (SELECT 1 FROM ${t} WHERE ${t.npwpPemotong}=${owner} AND ${t.tahun}=${tahun} AND ${t.masaPajak}=${masaPajak} AND ${t.pembetulanKe}=0) AND ${sourceExpression(owner, masaPajak, tahun)}=${built.signature}`),
		db.insert(t).values({ id, npwpPemotong: owner, namaPemotong: identity.nama, masaPajak, tahun, chainId: id, snapshot: built.snapshot, sourceSignature: built.signature, pembayaran: {}, createdAt: now, tanggalDiperbarui: now })
	]);
	return id;
}

export async function refreshSptUnifikasi(owner: string, id: string) {
	const row = await load(owner, id);
	concept(row);
	const built = await build(owner, row.masaPajak, row.tahun, row.chainId, row.pembetulanKe);
	await batch([
		guard(sql`${rowInvariant(row)} AND ${latestInvariant(row)} AND ${chainInvariant(owner, row.chainId, row.pembetulanKe)} AND ${sourceExpression(owner, row.masaPajak, row.tahun)}=${built.signature}`),
		db.update(t).set({ snapshot: built.snapshot, sourceSignature: built.signature, pernyataan: false, tanggalDiperbarui: new Date(), revision: row.revision + 1 }).where(owned(owner, id))
	]);
}

export async function submitSptUnifikasi(owner: string, id: string, pernyataan: boolean, revision: number) {
	const row = await load(owner, id);
	concept(row);
	if (pernyataan !== true) throw new SptUnifikasiError('Setujui pernyataan simulator sebelum penyampaian.');
	if (!Number.isInteger(revision) || revision !== row.revision) throw new SptUnifikasiError('Snapshot SPT berubah. Muat ulang dan verifikasi kembali sebelum menyampaikan.', 409);
	if ((await readSignature(owner, row.masaPajak, row.tahun)) !== row.sourceSignature) throw new SptUnifikasiError('BPPU sumber berubah. Perbarui snapshot dan verifikasi ulang sebelum menyampaikan.', 409);
	const waiting = row.snapshot.harusDibayar > 0;
	const now = new Date();
	await batch([
		guard(sql`${rowInvariant(row)} AND ${latestInvariant(row)} AND ${chainInvariant(owner, row.chainId, row.pembetulanKe)} AND ${sourceExpression(owner, row.masaPajak, row.tahun)}=${row.sourceSignature}`),
		db.update(t).set(waiting
			? { status: 'menunggu_pembayaran', pernyataan: true, revision: row.revision + 1 }
			: { status: 'dilaporkan', pernyataan: true, pembayaran: {}, tanggalDilaporkan: now, revision: row.revision + 1 }
		).where(owned(owner, id))
	]);
}

export async function paySptUnifikasi(owner: string, id: string) {
	const row = await load(owner, id);
	if (row.status !== 'menunggu_pembayaran') throw new SptUnifikasiError('SPT Unifikasi tidak menunggu pembayaran.', 409);
	// Pays exactly the verified snapshot, per KAP-KJS; never recalculates tax.
	if ((await readSignature(owner, row.masaPajak, row.tahun)) !== row.sourceSignature) throw new SptUnifikasiError('BPPU sumber berubah setelah penyampaian. Kembalikan ke konsep, perbarui snapshot, lalu sampaikan ulang.', 409);
	await batch([
		guard(sql`${rowInvariant(row)} AND ${latestInvariant(row)} AND ${chainInvariant(owner, row.chainId, row.pembetulanKe)} AND ${sourceExpression(owner, row.masaPajak, row.tahun)}=${row.sourceSignature}`),
		db.update(t).set({ status: 'dilaporkan', pembayaran: payable(row.snapshot), tanggalDilaporkan: new Date(), revision: row.revision + 1 }).where(owned(owner, id))
	]);
}

export async function reopenSptUnifikasi(owner: string, id: string) {
	const row = await load(owner, id);
	if (row.status !== 'menunggu_pembayaran') throw new SptUnifikasiError('Hanya SPT Unifikasi menunggu pembayaran yang dapat dikembalikan ke konsep.', 409);
	await batch([
		guard(sql`${rowInvariant(row)} AND ${latestInvariant(row)}`),
		db.update(t).set({ status: 'konsep', pernyataan: false, tanggalDiperbarui: new Date(), revision: row.revision + 1 }).where(owned(owner, id))
	]);
}

export async function amendSptUnifikasi(owner: string, id: string): Promise<string> {
	const row = await load(owner, id);
	if (row.status !== 'dilaporkan') throw new SptUnifikasiError('Pembetulan hanya dari SPT Unifikasi dilaporkan terakhir.', 409);
	const next = crypto.randomUUID();
	const pembetulanKe = row.pembetulanKe + 1;
	const built = await build(owner, row.masaPajak, row.tahun, row.chainId, pembetulanKe);
	const now = new Date();
	await batch([
		guard(sql`${rowInvariant(row)} AND ${latestInvariant(row)} AND ${chainInvariant(owner, row.chainId, pembetulanKe)} AND ${sourceExpression(owner, row.masaPajak, row.tahun)}=${built.signature}`),
		db.insert(t).values({ id: next, npwpPemotong: owner, namaPemotong: row.namaPemotong, masaPajak: row.masaPajak, tahun: row.tahun, chainId: row.chainId, pembetulanKe, snapshot: built.snapshot, sourceSignature: built.signature, pembayaran: {}, createdAt: now, tanggalDiperbarui: now })
	]);
	return next;
}

export async function deleteSptUnifikasi(owner: string, id: string) {
	const row = await load(owner, id);
	concept(row);
	await batch([
		guard(sql`${rowInvariant(row)} AND ${latestInvariant(row)}`),
		db.delete(t).where(owned(owner, id))
	]);
}
