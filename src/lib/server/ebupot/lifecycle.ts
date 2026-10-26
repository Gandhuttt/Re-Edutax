import { db, type Statement } from '$lib/server/db';
import { bukti_potong_bp21, bukti_potong_bp26, bukti_potong_bpa1, bukti_potong_bpa2, bukti_potong_mp, fasilitas_pajak_ebupot } from '$lib/server/db/schema';
import type { BpKind, BpLifecycleKind, BpStatus, MpKind } from '$lib/helpers/bp-parity';
import { error } from '@sveltejs/kit';
import { and, eq, inArray, sql, type SQL } from 'drizzle-orm';

// Shared owner-scoped lifecycle for BP21/BP26/BPA1/BPA2/MP (local simulation only -- no DJP
// issuance, no e-sign, numbers are clearly prefixed SIM-).
//
// Atomicity: D1 runs db.batch() as ONE implicit transaction, so any statement that
// throws rolls the whole batch back. There is no db.transaction() on D1 and no
// RAISE() outside triggers, so each batch starts (and ends) with a guard SELECT that
// evaluates `CASE WHEN <invariant> THEN 1 ELSE abs(-9223372036854775808) END`;
// abs() of the minimum int64 raises "integer overflow", aborting the batch when the
// invariant does not hold (stale status, cross-owner id, concurrent amendment ...).
// Every write statement additionally repeats its row guard in its WHERE clause.

export type BpAction = 'delete' | 'issue' | 'cancel' | 'amend';
export type BpMutationResult = { ids: string[]; createdIds?: string[] };

// D1 allows at most 100 bound parameters per statement; guards bind each id once
// plus a handful of scalars, so 50 ids per call stays safely inside the limit.
export const MAX_BP_BULK = 50;

export class BpLifecycleError extends Error {
	constructor(
		message: string,
		readonly status: 400 | 404 | 409 = 400
	) {
		super(message);
	}
}

const UNISSUED_LIVE: readonly BpStatus[] = ['NORMAL', 'SAVEDINVALID', 'SUBMITTED', 'AMENDMENT'];
const ISSUED_ACTIVE: readonly BpStatus[] = ['NORMAL', 'SUBMITTED', 'AMENDMENT'];

const tables = {
	bp21: { table: bukti_potong_bp21, name: 'bukti_potong_bp21', label: 'BP21', prefix: 'SIM-BP21' },
	bp26: { table: bukti_potong_bp26, name: 'bukti_potong_bp26', label: 'BP26', prefix: 'SIM-BP26' },
	bpa1: { table: bukti_potong_bpa1, name: 'bukti_potong_bpa1', label: 'BPA1', prefix: 'SIM-BPA1' },
	bpa2: { table: bukti_potong_bpa2, name: 'bukti_potong_bpa2', label: 'BPA2', prefix: 'SIM-BPA2' },
	mp: { table: bukti_potong_mp, name: 'bukti_potong_mp', label: 'MP', prefix: 'SIM-MP' }
} as const;

// All tables share every column this service touches (id, npwp_pemotong, status,
// diterbitkan, nomor_pemotongan, pembetulan_*), so one typed handle is used.
const tableOf = (kind: BpLifecycleKind) => tables[kind].table as unknown as typeof bukti_potong_bp21;

type LifecycleRow = {
	id: string;
	npwpPemotong: string;
	masaPajak: number;
	tahun: number;
	tahunAkhir?: number;
	masaPajakAkhir?: number;
	status: BpStatus;
	diterbitkan: boolean;
	pembetulanDariId: string | null;
	pembetulanKe: number;
};

const lit = (values: readonly string[]) => sql.raw(values.map((v) => `'${v}'`).join(', '));
const idList = (values: readonly string[]) => sql.join(values.map((v) => sql`${v}`), sql`, `);

// Abort the surrounding D1 batch (rolling back everything) when `invariant` is false.
const guard = (invariant: SQL): Statement =>
	db
		.select({ g: sql<number>`CASE WHEN ${invariant} THEN 1 ELSE abs(-9223372036854775808) END` })
		.from(sql`(SELECT 1) AS bp_guard`) as unknown as Statement;

const runBatch = async (statements: Statement[]) => {
	try {
		await db.batch(statements as [Statement, ...Statement[]]);
	} catch (cause) {
		if (cause instanceof Error && /integer overflow/i.test(`${cause.message} ${String(cause.cause ?? '')}`)) {
			throw new BpLifecycleError(
				'Status data berubah atau tidak lagi memenuhi syarat. Tidak ada perubahan yang disimpan; muat ulang daftar.',
				409
			);
		}
		throw cause;
	}
};

const normalizeIds = (ids: string[]) => {
	if (!Array.isArray(ids) || ids.length === 0) throw new BpLifecycleError('Pilih minimal satu bukti potong.');
	const unique = [...new Set(ids.map((id) => String(id).trim()))];
	if (unique.some((id) => !id || id.length > 64)) throw new BpLifecycleError('ID bukti potong tidak valid.');
	if (unique.length > MAX_BP_BULK) {
		throw new BpLifecycleError(`Maksimal ${MAX_BP_BULK} bukti potong per aksi.`);
	}
	return unique;
};

const loadRows = async (kind: BpLifecycleKind, owner: string, ids: string[]) => {
	const t = tableOf(kind);
	const rows = (await db
		.select()
		.from(t)
		.where(and(eq(t.npwpPemotong, owner), inArray(t.id, ids)))) as (LifecycleRow & Record<string, unknown>)[];
	if (rows.length !== ids.length) {
		throw new BpLifecycleError(`${tables[kind].label} tidak ditemukan atau bukan milik akun ini.`, 404);
	}
	return rows;
};

// BPA1/BPA2 span Masa Pajak Awal..Akhir; their number is keyed by the period end.
const generateNumber = (kind: BpLifecycleKind, row: LifecycleRow) =>
	`${tables[kind].prefix}-${row.tahunAkhir ?? row.tahun}${String(row.masaPajakAkhir ?? row.masaPajak).padStart(2, '0')}-${crypto
		.randomUUID()
		.replaceAll('-', '')
		.slice(0, 10)
		.toUpperCase()}`;

/** Create an empty unissued draft with default Tanpa Fasilitas (kode 9, looked up). */
export async function createBpDraft(owner: string, kind: BpKind | MpKind): Promise<string> {
	const [facility] = await db
		.select({ id: fasilitas_pajak_ebupot.id })
		.from(fasilitas_pajak_ebupot)
		.where(and(eq(fasilitas_pajak_ebupot.kode, '9'), eq(fasilitas_pajak_ebupot.aktif, true)))
		.limit(1);
	// Asia/Jakarta current period, independent of server timezone.
	const jakarta = new Date(Date.now() + 7 * 60 * 60 * 1000);
	if (kind === 'mp' && jakarta.getUTCMonth() === 11) jakarta.setUTCMonth(10);
	const id = crypto.randomUUID();
	await db.insert(tableOf(kind)).values({
		id,
		npwpPemotong: owner,
		masaPajak: jakarta.getUTCMonth() + 1,
		tahun: jakarta.getUTCFullYear(),
		fasilitasPajakId: facility?.id ?? null
	});
	return id;
}

const stateError = (kind: BpLifecycleKind, message: string) =>
	new BpLifecycleError(`${tables[kind].label}: ${message}`, 409);

/**
 * All-or-none lifecycle mutation of owner-scoped rows. Every id must exist, belong to
 * `owner` and be in the state the action requires, otherwise nothing is written.
 */
export async function mutateBp(
	owner: string,
	kind: BpLifecycleKind,
	action: BpAction,
	ids: string[]
): Promise<BpMutationResult> {
	if (!owner) throw new BpLifecycleError('Belum login', 400);
	const unique = normalizeIds(ids);
	const n = unique.length;
	const T = sql.raw(tables[kind].name);
	const t = tableOf(kind);
	const rows = await loadRows(kind, owner, unique);
	const inIds = idList(unique);
	const ownerGuard = sql`npwp_pemotong = ${owner}`;
	const statements: Statement[] = [];
	const createdIds: string[] = [];

	const countWhere = (where: SQL) => sql`(SELECT count(*) FROM ${T} WHERE id IN (${inIds}) AND ${where})`;

	if (action === 'delete') {
		for (const row of rows) {
			if (row.diterbitkan || !UNISSUED_LIVE.includes(row.status)) {
				throw stateError(kind, 'hanya konsep yang belum terbit dan aktif yang dapat dihapus.');
			}
		}
		statements.push(
			guard(sql`${countWhere(sql`${ownerGuard} AND diterbitkan = 0 AND status IN (${lit(UNISSUED_LIVE)})`)} = ${n}`)
		);
		for (const row of rows) {
			statements.push(
				db
					.update(t)
					.set({ status: 'DELETED' })
					.where(
						and(
							eq(t.id, row.id),
							eq(t.npwpPemotong, owner),
							eq(t.diterbitkan, false),
							eq(t.status, row.status)
						)
					) as unknown as Statement
			);
		}
		statements.push(guard(sql`${countWhere(sql`${ownerGuard} AND diterbitkan = 0 AND status = 'DELETED'`)} = ${n}`));
	} else if (action === 'issue') {
		const sources = new Set<string>();
		for (const row of rows) {
			if (row.diterbitkan || row.status !== 'SUBMITTED') {
				throw stateError(kind, 'hanya konsep berstatus Disimpan (SUBMITTED) yang dapat diterbitkan.');
			}
			if (row.pembetulanDariId) {
				if (sources.has(row.pembetulanDariId)) {
					throw stateError(kind, 'dua pembetulan untuk bukti potong asal yang sama tidak dapat diterbitkan bersamaan.');
				}
				sources.add(row.pembetulanDariId);
			}
		}
		if (sources.size > 0) {
			const sourceRows = await loadRows(kind, owner, [...sources]);
			for (const source of sourceRows) {
				if (!source.diterbitkan || !ISSUED_ACTIVE.includes(source.status)) {
					throw stateError(kind, 'bukti potong asal pembetulan sudah tidak aktif; pembetulan tidak dapat diterbitkan.');
				}
			}
		}
		const numbers = new Map(rows.map((row) => [row.id, generateNumber(kind, row)]));
		const sourceList = [...sources];
		statements.push(
			guard(
				sql`${countWhere(
					sql`${ownerGuard} AND diterbitkan = 0 AND status = 'SUBMITTED' AND (pembetulan_dari_id IS NULL OR EXISTS (SELECT 1 FROM ${T} s WHERE s.id = ${T}.pembetulan_dari_id AND s.npwp_pemotong = ${owner} AND s.diterbitkan = 1 AND s.status IN (${lit(ISSUED_ACTIVE)})))`
				)} = ${n}`
			),
			guard(sql`NOT EXISTS (SELECT 1 FROM ${T} WHERE nomor_pemotongan IN (${idList([...numbers.values()])}))`)
		);
		if (sourceList.length > 0) {
			statements.push(
				guard(
					sql`(SELECT count(*) FROM ${T} WHERE id IN (${idList(sourceList)}) AND ${ownerGuard} AND diterbitkan = 1 AND status IN (${lit(ISSUED_ACTIVE)})) = ${sourceList.length}`
				)
			);
		}
		for (const row of rows) {
			statements.push(
				db
					.update(t)
					.set({ diterbitkan: true, nomorPemotongan: numbers.get(row.id) })
					.where(
						and(
							eq(t.id, row.id),
							eq(t.npwpPemotong, owner),
							eq(t.diterbitkan, false),
							eq(t.status, 'SUBMITTED')
						)
					) as unknown as Statement
			);
		}
		for (const sourceId of sourceList) {
			statements.push(
				db
					.update(t)
					.set({ status: 'AMENDED' })
					.where(
						and(
							eq(t.id, sourceId),
							eq(t.npwpPemotong, owner),
							eq(t.diterbitkan, true),
							inArray(t.status, [...ISSUED_ACTIVE])
						)
					) as unknown as Statement
			);
		}
		statements.push(guard(sql`${countWhere(sql`${ownerGuard} AND diterbitkan = 1 AND status = 'SUBMITTED'`)} = ${n}`));
		if (sourceList.length > 0) {
			statements.push(
				guard(
					sql`(SELECT count(*) FROM ${T} WHERE id IN (${idList(sourceList)}) AND ${ownerGuard} AND status = 'AMENDED') = ${sourceList.length}`
				)
			);
		}
	} else if (action === 'cancel') {
		for (const row of rows) {
			if (!row.diterbitkan || !ISSUED_ACTIVE.includes(row.status)) {
				throw stateError(kind, 'hanya bukti potong yang sudah terbit dan masih aktif yang dapat dibatalkan.');
			}
		}
		statements.push(
			guard(sql`${countWhere(sql`${ownerGuard} AND diterbitkan = 1 AND status IN (${lit(ISSUED_ACTIVE)})`)} = ${n}`)
		);
		for (const row of rows) {
			statements.push(
				db
					.update(t)
					.set({ status: 'CANCELLED' })
					.where(
						and(
							eq(t.id, row.id),
							eq(t.npwpPemotong, owner),
							eq(t.diterbitkan, true),
							inArray(t.status, [...ISSUED_ACTIVE])
						)
					) as unknown as Statement
			);
		}
		statements.push(guard(sql`${countWhere(sql`${ownerGuard} AND diterbitkan = 1 AND status = 'CANCELLED'`)} = ${n}`));
	} else if (action === 'amend') {
		for (const row of rows) {
			if (!row.diterbitkan || !ISSUED_ACTIVE.includes(row.status)) {
				throw stateError(kind, 'hanya bukti potong yang sudah terbit dan masih aktif yang dapat dibetulkan.');
			}
		}
		const open = await db
			.select({ source: t.pembetulanDariId })
			.from(t)
			.where(
				and(
					eq(t.npwpPemotong, owner),
					inArray(t.pembetulanDariId, unique),
					eq(t.diterbitkan, false),
					inArray(t.status, [...UNISSUED_LIVE])
				)
			);
		if (open.length > 0) {
			throw stateError(kind, 'sudah ada pembetulan yang belum terbit untuk bukti potong ini.');
		}
		const openChild = sql`EXISTS (SELECT 1 FROM ${T} c WHERE c.pembetulan_dari_id = ${T}.id AND c.diterbitkan = 0 AND c.status IN (${lit(UNISSUED_LIVE)}))`;
		statements.push(
			guard(
				sql`${countWhere(sql`${ownerGuard} AND diterbitkan = 1 AND status IN (${lit(ISSUED_ACTIVE)}) AND NOT ${openChild}`)} = ${n}`
			)
		);
		for (const row of rows) {
			const createdId = crypto.randomUUID();
			createdIds.push(createdId);
			statements.push(
				db.insert(t).values({
					...(row as unknown as typeof t.$inferInsert),
					id: createdId,
					status: 'AMENDMENT',
					diterbitkan: false,
					nomorPemotongan: null,
					pembetulanDariId: row.id,
					pembetulanKe: row.pembetulanKe + 1
				}) as unknown as Statement
			);
		}
		// Exactly one open amendment per source, and the sources themselves are untouched.
		statements.push(
			guard(
				sql`(SELECT count(*) FROM ${T} WHERE pembetulan_dari_id IN (${inIds}) AND diterbitkan = 0 AND status IN (${lit(UNISSUED_LIVE)})) = ${n}`
			),
			guard(sql`${countWhere(sql`${ownerGuard} AND diterbitkan = 1 AND status IN (${lit(ISSUED_ACTIVE)})`)} = ${n}`)
		);
	} else {
		throw new BpLifecycleError('Aksi tidak dikenal.');
	}

	await runBatch(statements);
	return action === 'amend' ? { ids: unique, createdIds } : { ids: unique };
}

/** mutateBp for remote functions: expected lifecycle failures become HTTP errors with their message. */
export async function mutateBpOrHttpError(
	owner: string | null | undefined,
	kind: BpLifecycleKind,
	action: BpAction,
	ids: string[]
): Promise<BpMutationResult> {
	if (!owner) error(401, 'Belum login');
	try {
		return await mutateBp(owner, kind, action, ids);
	} catch (cause) {
		if (cause instanceof BpLifecycleError) error(cause.status, cause.message);
		throw cause;
	}
}
