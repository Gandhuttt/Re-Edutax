import { form, getRequestEvent } from '$app/server';
import { requiredString } from '$lib/helpers/valibot-schema';
import { db, type Statement } from '$lib/server/db';
import {
	spt_pph_orang_pribadi,
	spt_pph_orang_pribadi_lampiran_1_bukti_potong,
	spt_pph_orang_pribadi_lampiran_1_harta,
	spt_pph_orang_pribadi_lampiran_1_keluarga,
	spt_pph_orang_pribadi_lampiran_1_pekerjaan,
	spt_pph_orang_pribadi_lampiran_1_utang,
	spt_pph_orang_pribadi_lampiran_2_bukan_objek,
	spt_pph_orang_pribadi_lampiran_2_final,
	spt_pph_orang_pribadi_lampiran_2_luar_negeri,
	spt_pph_orang_pribadi_lampiran_3a4_lainnya,
	spt_pph_orang_pribadi_lampiran_3a_koreksi_fiskal,
	spt_pph_orang_pribadi_lampiran_3a_laba_rugi,
	spt_pph_orang_pribadi_lampiran_3a_neraca,
	spt_pph_orang_pribadi_lampiran_3b_bulanan,
	spt_pph_orang_pribadi_lampiran_3b_tku,
	spt_pph_orang_pribadi_lampiran_3c,
	spt_pph_orang_pribadi_lampiran_3c_baris,
	spt_pph_orang_pribadi_lampiran_3d_entertainment,
	spt_pph_orang_pribadi_lampiran_3d_piutang,
	spt_pph_orang_pribadi_lampiran_3d_promosi,
	spt_pph_orang_pribadi_lampiran_4,
	spt_pph_orang_pribadi_lampiran_5_kompensasi_kerugian,
	spt_pph_orang_pribadi_lampiran_5_pengurang_neto,
	spt_pph_orang_pribadi_lampiran_5_pengurang_pph,
	spt_pph_orang_pribadi_sumber_penghasilan
} from '$lib/server/db/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, desc, eq } from 'drizzle-orm';
import * as v from 'valibot';

const NewPembetulanSptPphOrangPribadiSchema = v.object({
	id: requiredString('SPT PPh Orang Pribadi')
});

export const newPembetulanSptPphOrangPribadi = form(
	NewPembetulanSptPphOrangPribadiSchema,
	async ({ id }) => {
		const event = getRequestEvent();
		const activeNpwp = event.locals.user?.username;

		if (!activeNpwp) {
			error(401, 'Belum login');
		}

		const [source] = await db
			.select({
				tahunPajak: spt_pph_orang_pribadi.tahunPajak,
				pembetulanKe: spt_pph_orang_pribadi.pembetulanKe,
				statusDraft: spt_pph_orang_pribadi.statusDraft
			})
			.from(spt_pph_orang_pribadi)
			.where(and(eq(spt_pph_orang_pribadi.id, id), eq(spt_pph_orang_pribadi.npwp, activeNpwp)))
			.limit(1);

		if (!source) {
			error(404, 'SPT PPh Orang Pribadi tidak ditemukan');
		}

		if (source.statusDraft !== 'dilaporkan') {
			error(400, 'Hanya SPT yang sudah dilaporkan yang dapat dibetulkan');
		}

		const [latest] = await db
			.select({ pembetulanKe: spt_pph_orang_pribadi.pembetulanKe })
			.from(spt_pph_orang_pribadi)
			.where(
				and(
					eq(spt_pph_orang_pribadi.npwp, activeNpwp),
					eq(spt_pph_orang_pribadi.tahunPajak, source.tahunPajak)
				)
			)
			.orderBy(desc(spt_pph_orang_pribadi.pembetulanKe))
			.limit(1);

		if (!latest || latest.pembetulanKe !== source.pembetulanKe) {
			error(400, 'Hanya SPT dengan pembetulan terakhir yang dapat dibetulkan');
		}

		const nextPembetulanKe = source.pembetulanKe + 1;

		const [existingNext] = await db
			.select({ id: spt_pph_orang_pribadi.id })
			.from(spt_pph_orang_pribadi)
			.where(
				and(
					eq(spt_pph_orang_pribadi.npwp, activeNpwp),
					eq(spt_pph_orang_pribadi.tahunPajak, source.tahunPajak),
					eq(spt_pph_orang_pribadi.pembetulanKe, nextPembetulanKe)
				)
			)
			.limit(1);

		if (existingNext) {
			redirect(303, `/surat-pemberitahuan/pph-orang-pribadi?id=${existingNext.id}`);
		}

		// D1 has no real multi-statement transaction over the Workers binding, only db.batch()
		// (which requires every statement to be built upfront, no reading generated ids back
		// mid-batch). newSptId and every copied row's id are precomputed here instead of relying
		// on the database to generate and return them, so the whole copy can run as one atomic batch.
		const [sourceRow] = await db
			.select()
			.from(spt_pph_orang_pribadi)
			.where(eq(spt_pph_orang_pribadi.id, id))
			.limit(1);

		if (!sourceRow) {
			error(404, 'SPT PPh Orang Pribadi tidak ditemukan');
		}

		const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = sourceRow;
		const newSptId = crypto.randomUUID();

		const statements: Statement[] = [
			db.insert(spt_pph_orang_pribadi).values({
				...rest,
				id: newSptId,
				pembetulanKe: nextPembetulanKe,
				statusSpt: 'pembetulan',
				statusDraft: 'konsep',
				tanggalPosting: null,
				tanggalDilaporkan: null
			}),
			...(await copyTable(spt_pph_orang_pribadi_sumber_penghasilan, id, newSptId)),
			...(await copyTable(spt_pph_orang_pribadi_lampiran_1_pekerjaan, id, newSptId)),
			...(await copyTable(spt_pph_orang_pribadi_lampiran_1_bukti_potong, id, newSptId)),
			...(await copyTable(spt_pph_orang_pribadi_lampiran_1_keluarga, id, newSptId)),
			...(await copyTable(spt_pph_orang_pribadi_lampiran_1_harta, id, newSptId)),
			...(await copyTable(spt_pph_orang_pribadi_lampiran_1_utang, id, newSptId)),
			...(await copyTable(spt_pph_orang_pribadi_lampiran_2_final, id, newSptId)),
			...(await copyTable(spt_pph_orang_pribadi_lampiran_2_bukan_objek, id, newSptId)),
			...(await copyTable(spt_pph_orang_pribadi_lampiran_2_luar_negeri, id, newSptId)),
			...(await copyLampiran3ALabaRugi(id, newSptId)),
			// L-3A A.2 needs no special handling: unlike the laba/rugi rows it has no
			// child junction table to re-parent, so the generic copier is enough.
			...(await copyTable(spt_pph_orang_pribadi_lampiran_3a_neraca, id, newSptId)),
			...(await copyTable(spt_pph_orang_pribadi_lampiran_3a4_lainnya, id, newSptId)),
			...(await copyTable(spt_pph_orang_pribadi_lampiran_3b_tku, id, newSptId)),
			...(await copyTable(spt_pph_orang_pribadi_lampiran_3b_bulanan, id, newSptId)),
			...(await copyTable(spt_pph_orang_pribadi_lampiran_3c, id, newSptId)),
			...(await copyTable(spt_pph_orang_pribadi_lampiran_3c_baris, id, newSptId)),
			...(await copyTable(spt_pph_orang_pribadi_lampiran_3d_entertainment, id, newSptId)),
			...(await copyTable(spt_pph_orang_pribadi_lampiran_3d_promosi, id, newSptId)),
			...(await copyTable(spt_pph_orang_pribadi_lampiran_3d_piutang, id, newSptId)),
			...(await copyTable(spt_pph_orang_pribadi_lampiran_4, id, newSptId)),
			...(await copyTable(spt_pph_orang_pribadi_lampiran_5_pengurang_neto, id, newSptId)),
			...(await copyTable(spt_pph_orang_pribadi_lampiran_5_pengurang_pph, id, newSptId)),
			...(await copyTable(spt_pph_orang_pribadi_lampiran_5_kompensasi_kerugian, id, newSptId))
		];

		await db.batch(statements as [Statement, ...Statement[]]);

		redirect(303, `/surat-pemberitahuan/pph-orang-pribadi?id=${newSptId}`);
	}
);

// D1 caps the number of bound SQL parameters per statement well below desktop SQLite's
// 999, so a single `.values([...])` covering every copied row can overflow it once a
// table has enough rows × columns. Insert in fixed-size chunks instead.
const CHUNK_SIZE = 10;

function chunk<T>(arr: T[], size: number): T[][] {
	const out: T[][] = [];
	for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
	return out;
}

async function copyTable(table: any, sourceSptId: string, newSptId: string): Promise<Statement[]> {
	const rows: any[] = await db
		.select()
		.from(table)
		.where(eq(table.sptPphOrangPribadiId, sourceSptId));
	if (!rows.length) return [];

	const prepared = rows.map(({ id, ...restRow }) => ({
		...restRow,
		id: crypto.randomUUID(),
		sptPphOrangPribadiId: newSptId
	}));
	return chunk(prepared, CHUNK_SIZE).map((batch) => db.insert(table).values(batch));
}

// L-3A's KODE PENYESUAIAN FISKAL rows hang off a laba rugi row rather than off the
// SPT, so they cannot go through copyTable: each one has to be repointed at the new
// laba rugi id minted here, and inserted after its parent.
async function copyLampiran3ALabaRugi(
	sourceSptId: string,
	newSptId: string
): Promise<Statement[]> {
	const labaRugiRows = await db
		.select()
		.from(spt_pph_orang_pribadi_lampiran_3a_laba_rugi)
		.where(eq(spt_pph_orang_pribadi_lampiran_3a_laba_rugi.sptPphOrangPribadiId, sourceSptId));

	const statements: Statement[] = [];

	for (const labaRugiRow of labaRugiRows) {
		const { id: oldLabaRugiId, ...rest } = labaRugiRow;
		const newLabaRugiId = crypto.randomUUID();

		statements.push(
			db
				.insert(spt_pph_orang_pribadi_lampiran_3a_laba_rugi)
				.values({ ...rest, id: newLabaRugiId, sptPphOrangPribadiId: newSptId })
		);

		const koreksiRows = await db
			.select()
			.from(spt_pph_orang_pribadi_lampiran_3a_koreksi_fiskal)
			.where(eq(spt_pph_orang_pribadi_lampiran_3a_koreksi_fiskal.labaRugiId, oldLabaRugiId));

		if (koreksiRows.length) {
			const preparedKoreksi = koreksiRows.map(({ id, ...koreksiRest }) => ({
				...koreksiRest,
				id: crypto.randomUUID(),
				labaRugiId: newLabaRugiId
			}));
			for (const batch of chunk(preparedKoreksi, CHUNK_SIZE)) {
				statements.push(db.insert(spt_pph_orang_pribadi_lampiran_3a_koreksi_fiskal).values(batch));
			}
		}
	}

	return statements;
}
