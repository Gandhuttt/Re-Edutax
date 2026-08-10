import { form, getRequestEvent } from '$app/server';
import { requiredString } from '$lib/helpers/valibot-schema';
import { db, type Statement } from '$lib/server/db';
import {
	spt_pph_badan,
	spt_pph_badan_lampiran_1_laba_rugi,
	spt_pph_badan_lampiran_1_neraca,
	spt_pph_badan_lampiran_2_pihak,
	spt_pph_badan_lampiran_2_afiliasi,
	spt_pph_badan_lampiran_3_penghasilan_luar_negeri,
	spt_pph_badan_lampiran_3_pph_dipotong,
	spt_pph_badan_lampiran_4_pph_final,
	spt_pph_badan_lampiran_4_bukan_objek_pajak,
	spt_pph_badan_lampiran_5_tku,
	spt_pph_badan_lampiran_5_pp23_bulanan,
	spt_pph_badan_lampiran_5_pp23_dipotong_bulanan,
	spt_pph_badan_lampiran_6_komponen,
	spt_pph_badan_lampiran_7_kompensasi_kerugian,
	spt_pph_badan_lampiran_8_fasilitas_31e,
	spt_pph_badan_lampiran_9_harta,
	spt_pph_badan_lampiran_9_ringkasan_komersial,
	spt_pph_badan_lampiran_10a_transaksi,
	spt_pph_badan_lampiran_10b_pernyataan,
	spt_pph_badan_lampiran_10c_transaksi,
	spt_pph_badan_lampiran_10c_pernyataan,
	spt_pph_badan_lampiran_10d_dokumen,
	spt_pph_badan_lampiran_13b_a_kerjasama,
	spt_pph_badan_lampiran_13b_b_biaya,
	spt_pph_badan_lampiran_13b_c_litbang,
	spt_pph_badan_lampiran_13b_d_penghitungan
} from '$lib/server/db/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, desc, eq } from 'drizzle-orm';
import * as v from 'valibot';

const NewPembetulanSptPphBadanSchema = v.object({
	id: requiredString('SPT PPh Badan')
});

export const newPembetulanSptPphBadan = form(NewPembetulanSptPphBadanSchema, async ({ id }) => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	const [source] = await db
		.select({
			tahunPajak: spt_pph_badan.tahunPajak,
			pembetulanKe: spt_pph_badan.pembetulanKe,
			statusDraft: spt_pph_badan.statusDraft
		})
		.from(spt_pph_badan)
		.where(and(eq(spt_pph_badan.id, id), eq(spt_pph_badan.npwp, activeNpwp)))
		.limit(1);

	if (!source) {
		error(404, 'SPT PPh Badan tidak ditemukan');
	}

	if (source.statusDraft !== 'dilaporkan') {
		error(400, 'Hanya SPT yang sudah dilaporkan yang dapat dibetulkan');
	}

	const [latest] = await db
		.select({ pembetulanKe: spt_pph_badan.pembetulanKe })
		.from(spt_pph_badan)
		.where(and(eq(spt_pph_badan.npwp, activeNpwp), eq(spt_pph_badan.tahunPajak, source.tahunPajak)))
		.orderBy(desc(spt_pph_badan.pembetulanKe))
		.limit(1);

	if (!latest || latest.pembetulanKe !== source.pembetulanKe) {
		error(400, 'Hanya SPT dengan pembetulan terakhir yang dapat dibetulkan');
	}

	const nextPembetulanKe = source.pembetulanKe + 1;

	const [existingNext] = await db
		.select({ id: spt_pph_badan.id })
		.from(spt_pph_badan)
		.where(
			and(
				eq(spt_pph_badan.npwp, activeNpwp),
				eq(spt_pph_badan.tahunPajak, source.tahunPajak),
				eq(spt_pph_badan.pembetulanKe, nextPembetulanKe)
			)
		)
		.limit(1);

	if (existingNext) {
		redirect(303, `/surat-pemberitahuan/pph-badan?id=${existingNext.id}`);
	}

	// D1 has no real multi-statement transaction over the Workers binding, only db.batch()
	// (which requires every statement to be built upfront, no reading generated ids back
	// mid-batch). newSptId and every copied row's id are precomputed here instead of relying
	// on the database to generate and return them, so the whole copy can run as one atomic batch.
	const [sourceRow] = await db.select().from(spt_pph_badan).where(eq(spt_pph_badan.id, id)).limit(1);

	if (!sourceRow) {
		error(404, 'SPT PPh Badan tidak ditemukan');
	}

	const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = sourceRow;
	const newSptId = crypto.randomUUID();

	const statements: Statement[] = [
		db.insert(spt_pph_badan).values({
			...rest,
			id: newSptId,
			pembetulanKe: nextPembetulanKe,
			statusSpt: 'pembetulan',
			statusDraft: 'konsep',
			tanggalPosting: null,
			tanggalDilaporkan: null
		}),
		...(await copyTable(spt_pph_badan_lampiran_1_laba_rugi, id, newSptId)),
		...(await copyTable(spt_pph_badan_lampiran_1_neraca, id, newSptId)),
		...(await copyTable(spt_pph_badan_lampiran_2_pihak, id, newSptId)),
		...(await copyTable(spt_pph_badan_lampiran_2_afiliasi, id, newSptId)),
		...(await copyTable(spt_pph_badan_lampiran_3_penghasilan_luar_negeri, id, newSptId)),
		...(await copyTable(spt_pph_badan_lampiran_3_pph_dipotong, id, newSptId)),
		...(await copyTable(spt_pph_badan_lampiran_4_pph_final, id, newSptId)),
		...(await copyTable(spt_pph_badan_lampiran_4_bukan_objek_pajak, id, newSptId)),
		...(await copyLampiran5Tku(id, newSptId)),
		...(await copyTable(spt_pph_badan_lampiran_5_pp23_dipotong_bulanan, id, newSptId)),
		...(await copyTable(spt_pph_badan_lampiran_6_komponen, id, newSptId)),
		...(await copyTable(spt_pph_badan_lampiran_7_kompensasi_kerugian, id, newSptId)),
		...(await copyTable(spt_pph_badan_lampiran_8_fasilitas_31e, id, newSptId)),
		...(await copyTable(spt_pph_badan_lampiran_9_harta, id, newSptId)),
		...(await copyTable(spt_pph_badan_lampiran_9_ringkasan_komersial, id, newSptId)),
		...(await copyTable(spt_pph_badan_lampiran_10a_transaksi, id, newSptId)),
		...(await copyTable(spt_pph_badan_lampiran_10b_pernyataan, id, newSptId)),
		...(await copyTable(spt_pph_badan_lampiran_10c_transaksi, id, newSptId)),
		...(await copyTable(spt_pph_badan_lampiran_10c_pernyataan, id, newSptId)),
		...(await copyTable(spt_pph_badan_lampiran_10d_dokumen, id, newSptId)),
		...(await copyTable(spt_pph_badan_lampiran_13b_a_kerjasama, id, newSptId)),
		...(await copyTable(spt_pph_badan_lampiran_13b_b_biaya, id, newSptId)),
		...(await copyTable(spt_pph_badan_lampiran_13b_c_litbang, id, newSptId)),
		...(await copyTable(spt_pph_badan_lampiran_13b_d_penghitungan, id, newSptId))
	];

	await db.batch(statements as [Statement, ...Statement[]]);

	redirect(303, `/surat-pemberitahuan/pph-badan?id=${newSptId}`);
});

async function copyTable(table: any, sourceSptId: string, newSptId: string): Promise<Statement[]> {
	const rows: any[] = await db.select().from(table).where(eq(table.sptPphBadanId, sourceSptId));
	if (!rows.length) return [];

	return [
		db
			.insert(table)
			.values(rows.map(({ id, ...restRow }) => ({ ...restRow, id: crypto.randomUUID(), sptPphBadanId: newSptId })))
	];
}

async function copyLampiran5Tku(sourceSptId: string, newSptId: string): Promise<Statement[]> {
	const tkuRows = await db
		.select()
		.from(spt_pph_badan_lampiran_5_tku)
		.where(eq(spt_pph_badan_lampiran_5_tku.sptPphBadanId, sourceSptId));

	const statements: Statement[] = [];

	for (const tkuRow of tkuRows) {
		const { id: oldTkuId, ...rest } = tkuRow;
		const newTkuId = crypto.randomUUID();

		statements.push(
			db.insert(spt_pph_badan_lampiran_5_tku).values({ ...rest, id: newTkuId, sptPphBadanId: newSptId })
		);

		const bulananRows = await db
			.select()
			.from(spt_pph_badan_lampiran_5_pp23_bulanan)
			.where(eq(spt_pph_badan_lampiran_5_pp23_bulanan.tkuId, oldTkuId));

		if (bulananRows.length) {
			statements.push(
				db
					.insert(spt_pph_badan_lampiran_5_pp23_bulanan)
					.values(
						bulananRows.map(({ id, ...bulananRest }) => ({ ...bulananRest, id: crypto.randomUUID(), tkuId: newTkuId }))
					)
			);
		}
	}

	return statements;
}
