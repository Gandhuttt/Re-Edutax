import { db, type Statement } from '$lib/server/db';
import { spt_pph_2126 as t, spt_pph_2126_kompensasi as ledger, wajib_pajak, tempat_kegiatan_usaha, kode_objek_pajak_pph, fasilitas_pajak_ebupot, negara_spt_pph_badan, bukti_potong_mp, bukti_potong_bpa1, bukti_potong_bpa2, bukti_potong_bp21, bukti_potong_bp26 } from '$lib/server/db/schema';
import { and, eq, desc, inArray, sql, getTableColumns, type SQL } from 'drizzle-orm';
import type { SQLiteTable } from 'drizzle-orm/sqlite-core';
import { aggregateSpt2126, emptySpt2126Input, isActiveSpt2126Source, lastPeriodSpt2126Gross, rupiah, SPT2126_YEARS, Spt2126Error, validateSpt2126Input, type Spt2126Input, type Spt2126Source, type Spt2126SourceMeta, type Spt2126Detail, type Spt2126Status, type Spt2126Compensation } from '$lib/helpers/spt-pph-2126';
export { Spt2126Error } from '$lib/helpers/spt-pph-2126';
type Row = typeof t.$inferSelect;
const guard = (condition: SQL): Statement => db.select({ g: sql<number>`CASE WHEN ${condition} THEN 1 ELSE abs(-9223372036854775808) END` }).from(sql`(SELECT 1) AS spt_guard`);
async function batch(statements: [Statement, ...Statement[]]) {
	try { await db.batch(statements); } catch (cause) {
		if (cause instanceof Error && /integer overflow|UNIQUE constraint/i.test(`${cause.message} ${String(cause.cause ?? '')}`)) throw new Spt2126Error('Data/status berubah atau kompensasi sudah digunakan. Muat ulang; tidak ada perubahan disimpan.', 409);
		throw cause;
	}
}
const owned = (owner: string, id: string) => and(eq(t.npwpPemotong, owner), eq(t.id, id));
async function load(owner: string, id: string): Promise<Row> {
	if (!owner) throw new Spt2126Error('Belum login.');
	const [row] = await db.select().from(t).where(owned(owner, id)).limit(1);
	if (!row) throw new Spt2126Error('SPT tidak ditemukan.', 404);
	return row;
}
const rowInvariant = (row: Row) => sql`EXISTS (SELECT 1 FROM ${t} WHERE ${t.id}=${row.id} AND ${t.npwpPemotong}=${row.npwpPemotong} AND ${t.revision}=${row.revision} AND ${t.status}=${row.status})`;
const latestInvariant = (row: Row) => sql`NOT EXISTS (SELECT 1 FROM ${t} WHERE ${t.npwpPemotong}=${row.npwpPemotong} AND ${t.chainId}=${row.chainId} AND ${t.pembetulanKe}>${row.pembetulanKe})`;
function editable(row: Row) { if (row.status !== 'konsep') throw new Spt2126Error('SPT yang sudah disampaikan tidak dapat diubah.', 409); }
const sourceTables = { MP: bukti_potong_mp, BPA1: bukti_potong_bpa1, BPA2: bukti_potong_bpa2, BP21: bukti_potong_bp21, BP26: bukti_potong_bp26 };
/** Database-side, deterministic full-row signature: also guards replacement/issuance races inside D1 batches. */
function sourceExpression(owner: string, month: number, year: number): SQL<string> {
	const parts = Object.entries(sourceTables).map(([kind, table]) => {
		const annual = kind === 'BPA1' || kind === 'BPA2';
		const c = getTableColumns(table as SQLiteTable);
		const pairs = Object.entries(c).flatMap(([key, column]) => [sql.raw(`'${key}'`), sql`${column}`]);
		const facility = kind === 'BPA2' ? sql`'9'` : sql`(SELECT kode FROM fasilitas_pajak_ebupot WHERE id=${c.fasilitasPajakId})`;
		pairs.push(sql`'facilityCode'`, facility, sql`'objectCode'`, sql`(SELECT kode FROM kode_objek_pajak_pph WHERE id=${c.kodeObjekPajakId})`);
		const period = annual ? sql`${c.tahunAkhir}=${year} AND ${c.masaPajakAkhir}=${month}` : kind === 'MP' ? sql`${c.tahun}=${year} AND ${c.masaPajak}<=${month}` : sql`${c.tahun}=${year} AND ${c.masaPajak}=${month}`;
		return sql`${sql.raw(`'${kind}'`)}, json((SELECT coalesce(json_group_array(json(v)), '[]') FROM (SELECT json_object(${sql.join(pairs, sql`,`)}) AS v FROM ${table} WHERE ${c.npwpPemotong}=${owner} AND ${c.diterbitkan}=1 AND ${c.status} IN ('NORMAL','SUBMITTED','AMENDMENT') AND ${period} ORDER BY ${c.id})))`;
	});
	return sql<string>`json_object(${sql.join(parts, sql`,`)})`;
}
function record(value: unknown): Record<string, unknown> { if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Spt2126Error('Sumber bukti potong rusak.'); return Object.fromEntries(Object.entries(value)); }
function n(row: Record<string, unknown>, key: string): number { const value = row[key]; if (typeof value !== 'number') throw new Spt2126Error(`Sumber ${key} tidak valid.`); return rupiah(value, true); }
function s(row: Record<string, unknown>, key: string): string { const value = row[key]; return value == null ? '' : String(value); }
/** Display names from real reference tables, keyed by the ids already present in the source rows. Read outside the signature expression so signatures stay stable. */
async function referenceNames(groups: Map<string, Record<string, unknown>[]>) {
	const ids = (key: string) => [...new Set([...groups.values()].flat().map(source => source[key]).filter((value): value is string => typeof value === 'string' && value !== ''))];
	const objectIds = ids('kodeObjekPajakId'), facilityIds = ids('fasilitasPajakId'), countryIds = ids('negaraAsalId');
	const [objects, facilities, countries, bpa2Facility] = await Promise.all([
		objectIds.length ? db.select({ id: kode_objek_pajak_pph.id, nama: kode_objek_pajak_pph.nama }).from(kode_objek_pajak_pph).where(inArray(kode_objek_pajak_pph.id, objectIds)) : [],
		facilityIds.length ? db.select({ id: fasilitas_pajak_ebupot.id, nama: fasilitas_pajak_ebupot.nama }).from(fasilitas_pajak_ebupot).where(inArray(fasilitas_pajak_ebupot.id, facilityIds)) : [],
		countryIds.length ? db.select({ id: negara_spt_pph_badan.id, nama: negara_spt_pph_badan.nama }).from(negara_spt_pph_badan).where(inArray(negara_spt_pph_badan.id, countryIds)) : [],
		(groups.get('BPA2')?.length ?? 0) ? db.select({ nama: fasilitas_pajak_ebupot.nama }).from(fasilitas_pajak_ebupot).where(eq(fasilitas_pajak_ebupot.kode, '9')).limit(1) : []
	]);
	const names = (rows: { id: string; nama: string }[]) => new Map(rows.map(item => [item.id, item.nama]));
	return { objek: names(objects), facility: names(facilities), negara: names(countries), facilityByCode: new Map(bpa2Facility.map(item => ['9', item.nama])) };
}
async function sourceData(row: Row) {
	const expression = sourceExpression(row.npwpPemotong, row.masaPajak, row.tahun);
	const [result] = await db.select({ signature: expression }).from(sql`(SELECT 1) AS source_read`);
	const signature = result.signature;
	const parsed = record(JSON.parse(signature));
	const groups = new Map<string, Record<string, unknown>[]>();
	for (const kind of Object.keys(sourceTables)) {
		const value = parsed[kind];
		if (!Array.isArray(value)) throw new Spt2126Error('Sumber bukti tidak valid.');
		groups.set(kind, value.map(record).filter(source => isActiveSpt2126Source(s(source,'status'), source.diterbitkan === 1)));
	}
	const references = await referenceNames(groups);
	const sources: Spt2126Source[] = [];
	const annualKeys = new Set<string>();
	for (const kind of ['MP', 'BPA1', 'BPA2', 'BP21', 'BP26'] as const) for (const raw of groups.get(kind) ?? []) {
		const annual = kind === 'BPA1' || kind === 'BPA2';
		const month = n(raw, annual ? 'masaPajakAkhir' : 'masaPajak');
		if (!annual && month !== row.masaPajak) continue;
		let bruto = n(raw, 'penghasilanBruto');
		const annualGross = annual ? bruto : null;
		const annualTax = annual ? n(raw, 'pphPasal21TerutangPadaIni') : null;
		const pajak = n(raw, annual ? 'pphKurangLebihDipotongDesember' : kind === 'MP' ? 'pajakPenghasilanDipotong' : 'pajakPenghasilan');
		if (annual) {
			const identity = s(raw, 'nomorIdentitasWp');
			const genericName = identity === '9990000000999000' ? s(raw, 'nama').trim().toLocaleUpperCase('id-ID') : '';
			if (!identity || (identity === '9990000000999000' && !genericName)) throw new Spt2126Error('Identitas/nama penerima BPA tidak cukup untuk pencocokan MP.');
			const key = `${identity}|${genericName}|${s(raw, 'objectCode')}`;
			if (annualKeys.has(key)) throw new Spt2126Error('Lebih dari satu BPA aktif untuk penerima/objek yang sama; perbaiki sumber agar tidak ambigu.');
			annualKeys.add(key);
			if (n(raw, 'tahunAwal') !== row.tahun) throw new Spt2126Error('BPA lintas tahun tidak didukung simulator; gunakan periode dalam satu tahun pajak.');
			// Explicit simulator rule: last-period gross = annual gross minus effective prior monthly slips, same owner/recipient/object.
			const priorMonthlyGross: number[] = [];
			for (const mp of groups.get('MP') ?? []) {
				if (s(mp, 'nomorIdentitasWp') === identity &&
					(identity !== '9990000000999000' || s(mp, 'nama').trim().toLocaleUpperCase('id-ID') === genericName) &&
					s(mp, 'objectCode') === s(raw, 'objectCode') &&
					n(mp, 'masaPajak') >= n(raw, 'masaPajakAwal') &&
					n(mp, 'masaPajak') < month) {
					priorMonthlyGross.push(n(mp, 'penghasilanBruto'));
				}
			}
			bruto = lastPeriodSpt2126Gross(bruto, priorMonthlyGross);
		}
		const isDtp = ['4', '11'].includes(s(raw, 'facilityCode'));
		const metaKey = (key: string) => raw[key] == null ? null : String(raw[key]);
		const rawTarif = raw.tarif;
		const tarif = kind !== 'BPA1' && kind !== 'BPA2' && typeof rawTarif === 'number' && Number.isFinite(rawTarif) ? rawTarif : null;
		const facilityId = kind === 'BPA2' ? references.facilityByCode.get('9') : references.facility.get(s(raw, 'fasilitasPajakId'));
		const period = annual ? `${String(n(raw, 'masaPajakAwal')).padStart(2, '0')}-${n(raw, 'tahunAwal')} s.d. ${String(n(raw, 'masaPajakAkhir')).padStart(2, '0')}-${n(raw, 'tahunAkhir')}` : null;
		const meta: Spt2126SourceMeta = {
			tanggalPemotongan: metaKey('tanggalPemotongan'),
			tarif,
			namaObjek: references.objek.get(s(raw, 'kodeObjekPajakId')) ?? null,
			fasilitas: facilityId ?? null,
			fasilitasKode: metaKey('facilityCode'),
			negara: references.negara.get(s(raw, 'negaraAsalId')) ?? null,
			nitku: metaKey('nitkuPemotong'),
			periodePenghasilan: period
		};
		sources.push({ id: s(raw, 'id'), jenis: kind, nama: s(raw, kind === 'BP21' ? 'namaPenerima' : 'nama'), identitas: s(raw, 'nomorIdentitasWp'), kodeObjek: s(raw, 'objectCode'), masaPajak: month, tahun: row.tahun, bruto, pajak, dtp: isDtp ? pajak : 0, brutoTahunan: annualGross, pajakTahunan: annualTax, dtpTahunan: annual ? (isDtp ? annualTax : 0) : null, nomor: s(raw, 'nomorPemotongan'), status: s(raw, 'status'), meta });
	}
	return { sources, signature, expression };
}
async function previousPayments(row: Row) {
	const [value] = await db.select({ p21: sql<number>`coalesce(sum(${t.pembayaran21}),0)`, p26: sql<number>`coalesce(sum(${t.pembayaran26}),0)` }).from(t).where(and(eq(t.npwpPemotong, row.npwpPemotong), eq(t.chainId, row.chainId), sql`${t.pembetulanKe}<${row.pembetulanKe}`));
	return { p21: value.p21, p26: value.p26 };
}
/** Latest reported revision supplies credit; consumption is attributed to a chain, not a replaceable revision. */
function creditExpression(owner: string, chain: string, article: 21 | 26): SQL<number> {
	const column = article === 21 ? sql.raw('kredit21') : sql.raw('kredit26');
	return sql<number>`min(coalesce((SELECT ${column} FROM spt_pph_2126 WHERE npwp_pemotong=${owner} AND chain_id=${chain} AND status='dilaporkan' ORDER BY pembetulan_ke DESC LIMIT 1),0),coalesce((SELECT ${column} FROM spt_pph_2126 WHERE npwp_pemotong=${owner} AND chain_id=${chain} AND status='menunggu_pembayaran' ORDER BY pembetulan_ke DESC LIMIT 1),9223372036854775807))`;
}
function consumedExpression(owner: string, chain: string, article: 21 | 26, excludeConsumer?: string): SQL<number> {
	return sql<number>`(SELECT coalesce(sum(jumlah),0) FROM spt_pph_2126_kompensasi WHERE npwp_pemotong=${owner} AND source_chain_id=${chain} AND pasal=${article}${excludeConsumer ? sql` AND consumer_chain_id<>${excludeConsumer}` : sql``})`;
}
async function available(row: Row): Promise<Spt2126Compensation[]> {
	const reported = await db.select().from(t).where(and(eq(t.npwpPemotong, row.npwpPemotong), eq(t.status, 'dilaporkan'), sql`(${t.tahun}*12+${t.masaPajak})<${row.tahun * 12 + row.masaPajak}`)).orderBy(desc(t.pembetulanKe));
	const seen = new Set<string>(); const result: Spt2126Compensation[] = [];
	for (const source of reported) {
		if (seen.has(source.chainId)) continue; seen.add(source.chainId);
		for (const article of [21,26] as const) {
			const [value] = await db.select({ amount: sql<number>`${creditExpression(row.npwpPemotong, source.chainId, article)}-${consumedExpression(row.npwpPemotong, source.chainId, article, row.chainId)}` }).from(sql`(SELECT 1) AS comp_read`);
			if (value.amount > 0) result.push({ id: source.chainId, masaPajak: source.masaPajak, tahun: source.tahun, pasal: article, tersedia: value.amount });
		}
	}
	return result;
}
export async function getSpt2126(owner: string, id: string): Promise<Spt2126Detail> {
	const row = await load(owner,id); const paid = await previousPayments(row);
	// Submitted snapshots remain readable even if live sources subsequently become invalid.
	let sourcesChanged = false; let preview = row.snapshot;
	if (row.status === 'konsep') {
		const live = await sourceData(row);
		sourcesChanged = row.sourceSignature !== null && row.sourceSignature !== live.signature;
		preview = aggregateSpt2126(live.sources,row.input,paid.p21,paid.p26);
	} else if (row.status === 'menunggu_pembayaran') {
		const [live] = await db.select({signature: sourceExpression(owner,row.masaPajak,row.tahun)}).from(sql`(SELECT 1) AS waiting_source`);
		sourcesChanged = row.sourceSignature !== live.signature;
	}
	if (!preview) throw new Spt2126Error('Snapshot SPT tidak tersedia.',409);
	const [profile] = await db.select({ telepon: wajib_pajak.nomor_telepon, alamat: tempat_kegiatan_usaha.alamat }).from(wajib_pajak)
		.leftJoin(tempat_kegiatan_usaha, and(eq(tempat_kegiatan_usaha.wajib_pajak, wajib_pajak.id), eq(tempat_kegiatan_usaha.nitku, `${owner}000000`)))
		.where(eq(wajib_pajak.npwp, owner)).limit(1);
	return { ...row, alamatPemotong: profile?.alamat || null, teleponPemotong: profile?.telepon || null, posted: row.snapshot !== null, sourcesChanged, preview, kompensasiTersedia: await available(row), kurangLebihBayar: Math.max(0,preview.pasal21.harusDibayar)+Math.max(0,preview.pasal26.harusDibayar) };
}
export async function listSpt2126(owner: string, status?: Spt2126Status) {
	const rows = await db.select().from(t).where(and(eq(t.npwpPemotong,owner),status ? eq(t.status,status) : undefined)).orderBy(desc(t.createdAt));
	return rows.map(row => ({
		id: row.id,
		masaPajak: row.masaPajak,
		tahun: row.tahun,
		pembetulanKe: row.pembetulanKe,
		status: row.status,
		createdAt: row.createdAt,
		tanggalPosting: row.tanggalPosting,
		tanggalDilaporkan: row.tanggalDilaporkan,
		kurangLebihBayar21: row.snapshot?.pasal21.harusDibayar ?? 0,
		kurangLebihBayar26: row.snapshot?.pasal26.harusDibayar ?? 0,
		kurangLebihBayar: row.snapshot ? Math.max(0,row.snapshot.pasal21.harusDibayar)+Math.max(0,row.snapshot.pasal26.harusDibayar) : 0
	}));
}
export async function createSpt2126(owner: string, masaPajak: number, tahun: number): Promise<string> {
	if (!Number.isInteger(masaPajak) || masaPajak<1 || masaPajak>12 || !SPT2126_YEARS.some(y=>y===tahun)) throw new Spt2126Error('Masa/tahun NONMIGRASI harus 1–12 dan 2025/2026.');
	const [identity] = await db.select().from(wajib_pajak).where(eq(wajib_pajak.npwp,owner)).limit(1);
	if (!identity) throw new Spt2126Error('Identitas wajib pajak tidak ditemukan.',404);
	const id=crypto.randomUUID();
	await batch([guard(sql`NOT EXISTS (SELECT 1 FROM ${t} WHERE ${t.npwpPemotong}=${owner} AND ${t.tahun}=${tahun} AND ${t.masaPajak}=${masaPajak})`),db.insert(t).values({id,npwpPemotong:owner,namaPemotong:identity.nama,masaPajak,tahun,chainId:id,input:emptySpt2126Input(),createdAt:new Date()})]);
	return id;
}
export async function amendSpt2126(owner: string,id: string): Promise<string> {
	const row=await load(owner,id); if(row.status!=='dilaporkan') throw new Spt2126Error('Pembetulan hanya dari SPT dilaporkan terakhir.',409);
	const next=crypto.randomUUID();
	await batch([guard(sql`${rowInvariant(row)} AND ${latestInvariant(row)}`),db.insert(t).values({id:next,npwpPemotong:owner,namaPemotong:row.namaPemotong,masaPajak:row.masaPajak,tahun:row.tahun,chainId:row.chainId,pembetulanKe:row.pembetulanKe+1,input:{...row.input,pernyataan:false},createdAt:new Date()})]);
	return next;
}
export async function saveSpt2126(owner: string, id: string, input: Spt2126Input) {
	const row = await load(owner, id);
	editable(row);
	const clean = validateSpt2126Input(input);
	await batch([
		guard(sql`${rowInvariant(row)} AND ${latestInvariant(row)}`),
		db.update(t).set({
			input: clean, snapshot: null, sourceSignature: null,
			tanggalPosting: null, revision: row.revision + 1
		}).where(owned(owner, id))
	]);
}

export async function postSpt2126(owner: string, id: string) {
	const row = await load(owner, id);
	editable(row);
	validateSpt2126Input(row.input);
	const live = await sourceData(row);
	const paid = await previousPayments(row);
	const snapshot = aggregateSpt2126(live.sources, row.input, paid.p21, paid.p26);
	await batch([
		guard(sql`${rowInvariant(row)} AND ${latestInvariant(row)} AND ${live.expression}=${live.signature}`),
		db.update(t).set({
			snapshot, sourceSignature: live.signature,
			tanggalPosting: new Date(), revision: row.revision + 1
		}).where(owned(owner, id))
	]);
}
async function compensationGuards(row:Row):Promise<Statement[]> {
	const choices=await available(row); const statements:Statement[]=[];
	for(const article of [21,26] as const){
		const amount=article===21?row.input.kompensasi21:row.input.kompensasi26; const source=article===21?row.input.kompensasi21SumberId:row.input.kompensasi26SumberId;
		if(!amount) continue;
		if(!source || !choices.some(c=>c.id===source && c.pasal===article && c.tersedia>=amount)) throw new Spt2126Error('Kompensasi melebihi saldo dari masa sebelumnya.',409);
		statements.push(guard(sql`${creditExpression(row.npwpPemotong,source,article)}-${consumedExpression(row.npwpPemotong,source,article,row.chainId)}>=${amount}`));
	}
	return statements;
}
function creditGuards(row:Row,credit21:number,credit26:number):Statement[]{
	return [guard(sql`${consumedExpression(row.npwpPemotong,row.chainId,21)}<=${credit21} AND ${consumedExpression(row.npwpPemotong,row.chainId,26)}<=${credit26}`)];
}
async function reservationStatements(row: Row, input: Spt2126Input, retainExisting = false): Promise<Statement[]> {
	const reservations: { source: string; article: number; amount: number }[] = [];
	if (retainExisting) {
		const existing = await db.select().from(ledger).where(and(eq(ledger.npwpPemotong,row.npwpPemotong),eq(ledger.consumerChainId,row.chainId)));
		for (const entry of existing) reservations.push({source:entry.sourceChainId,article:entry.pasal,amount:entry.jumlah});
	}
	for (const article of [21,26] as const) {
		const amount=article===21?input.kompensasi21:input.kompensasi26;
		const source=article===21?input.kompensasi21SumberId:input.kompensasi26SumberId;
		if (!amount || !source) continue;
		const existing=reservations.find(entry=>entry.article===article && entry.source===source);
		if(existing) existing.amount=Math.max(existing.amount,amount); else reservations.push({source,article,amount});
	}
	return [
		db.delete(ledger).where(and(eq(ledger.npwpPemotong,row.npwpPemotong),eq(ledger.consumerChainId,row.chainId))),
		...reservations.map(entry=>db.insert(ledger).values({id:crypto.randomUUID(),npwpPemotong:row.npwpPemotong,sourceChainId:entry.source,consumerChainId:row.chainId,pasal:entry.article,jumlah:entry.amount}))
	];
}
export async function submitSpt2126(owner: string, id: string) {
	const row = await load(owner, id);
	editable(row);
	if (!row.input.pernyataan) throw new Spt2126Error('Setujui pernyataan simulator sebelum penyampaian.');
	if (!row.snapshot || !row.sourceSignature) throw new Spt2126Error('Posting sumber terlebih dahulu.', 409);
	const live = await sourceData(row);
	if (live.signature !== row.sourceSignature) {
		throw new Spt2126Error('Sumber berubah; posting ulang sebelum menyampaikan.', 409);
	}
	const compGuards = await compensationGuards(row);
	const snap = row.snapshot;
	const waiting = snap.pasal21.harusDibayar > 0 || snap.pasal26.harusDibayar > 0;
	const credit21 = Math.max(0, -snap.pasal21.harusDibayar);
	const credit26 = Math.max(0, -snap.pasal26.harusDibayar);
	const statements: [Statement, ...Statement[]] = [
		guard(sql`${rowInvariant(row)} AND ${latestInvariant(row)} AND ${live.expression}=${row.sourceSignature}`),
		...compGuards,
		...creditGuards(row, credit21, credit26),
		...await reservationStatements(row, row.input, waiting)
	];
	statements.push(db.update(t).set({
		status: waiting ? 'menunggu_pembayaran' : 'dilaporkan',
		tanggalDilaporkan: waiting ? null : new Date(),
		kredit21: credit21, kredit26: credit26, revision: row.revision + 1
	}).where(owned(owner, id)));
	await batch(statements);
}

export async function paySpt2126(owner: string, id: string) {
	const row = await load(owner, id);
	if (row.status !== 'menunggu_pembayaran' || !row.snapshot || !row.sourceSignature) {
		throw new Spt2126Error('SPT tidak menunggu pembayaran.', 409);
	}
	// Complete the submitted snapshot, never silently recalculate tax at payment.
	const live = await sourceData(row);
	if (live.signature !== row.sourceSignature) {
		throw new Spt2126Error('Sumber berubah setelah penyampaian. Kembali ke Konsep, posting ulang, lalu sampaikan kembali.', 409);
	}
	const pay21 = Math.max(0, row.snapshot.pasal21.harusDibayar);
	const pay26 = Math.max(0, row.snapshot.pasal26.harusDibayar);
	await batch([
		guard(sql`${rowInvariant(row)} AND ${latestInvariant(row)} AND ${live.expression}=${row.sourceSignature}`),
		...creditGuards(row, row.kredit21, row.kredit26),
		...await reservationStatements(row, row.input),
		db.update(t).set({
			pembayaran21: pay21, pembayaran26: pay26,
			status: 'dilaporkan', tanggalDilaporkan: new Date(), revision: row.revision + 1
		}).where(owned(owner, id))
	]);
}

export async function deleteSpt2126(owner: string, id: string) {
	const row = await load(owner, id);
	editable(row);
	await batch([
		guard(sql`${rowInvariant(row)} AND ${latestInvariant(row)}`),
		db.delete(t).where(owned(owner, id))
	]);
}

export async function reopenSpt2126(owner: string, id: string) {
	const row = await load(owner, id);
	if (row.status !== 'menunggu_pembayaran') {
		throw new Spt2126Error('Hanya SPT lokal menunggu pembayaran yang dapat dikembalikan ke konsep.', 409);
	}
	const [previous] = await db.select().from(t).where(and(
		eq(t.npwpPemotong, owner), eq(t.chainId, row.chainId), eq(t.status, 'dilaporkan')
	)).orderBy(desc(t.pembetulanKe)).limit(1);
	await batch([
		guard(sql`${rowInvariant(row)} AND ${latestInvariant(row)}`),
		...await reservationStatements(row, previous?.input ?? emptySpt2126Input()),
		db.update(t).set({
			status: 'konsep', snapshot: null, sourceSignature: null, tanggalPosting: null,
			kredit21: 0, kredit26: 0, input: { ...row.input, pernyataan: false },
			revision: row.revision + 1
		}).where(owned(owner, id))
	]);
}
