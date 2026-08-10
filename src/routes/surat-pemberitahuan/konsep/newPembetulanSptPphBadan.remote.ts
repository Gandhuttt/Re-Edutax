import { form, getRequestEvent } from '$app/server';
import { requiredString } from '$lib/helpers/valibot-schema';
import { db } from '$lib/server/db';
import type { Transaction } from '$lib/server/db';
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

	const newId = await db.transaction(async (tx) => {
		const [sourceRow] = await tx.select().from(spt_pph_badan).where(eq(spt_pph_badan.id, id)).limit(1);

		if (!sourceRow) {
			error(404, 'SPT PPh Badan tidak ditemukan');
		}

		const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = sourceRow;

		const [created] = await tx
			.insert(spt_pph_badan)
			.values({
				...rest,
				pembetulanKe: nextPembetulanKe,
				statusSpt: 'pembetulan',
				statusDraft: 'konsep',
				tanggalPosting: null,
				tanggalDilaporkan: null
			})
			.returning({ id: spt_pph_badan.id });

		const newSptId = created.id;

		await copyTable(tx, spt_pph_badan_lampiran_1_laba_rugi, id, newSptId);
		await copyTable(tx, spt_pph_badan_lampiran_1_neraca, id, newSptId);
		await copyTable(tx, spt_pph_badan_lampiran_2_pihak, id, newSptId);
		await copyTable(tx, spt_pph_badan_lampiran_2_afiliasi, id, newSptId);
		await copyTable(tx, spt_pph_badan_lampiran_3_penghasilan_luar_negeri, id, newSptId);
		await copyTable(tx, spt_pph_badan_lampiran_3_pph_dipotong, id, newSptId);
		await copyTable(tx, spt_pph_badan_lampiran_4_pph_final, id, newSptId);
		await copyTable(tx, spt_pph_badan_lampiran_4_bukan_objek_pajak, id, newSptId);
		await copyLampiran5Tku(tx, id, newSptId);
		await copyTable(tx, spt_pph_badan_lampiran_5_pp23_dipotong_bulanan, id, newSptId);
		await copyTable(tx, spt_pph_badan_lampiran_6_komponen, id, newSptId);
		await copyTable(tx, spt_pph_badan_lampiran_7_kompensasi_kerugian, id, newSptId);
		await copyTable(tx, spt_pph_badan_lampiran_8_fasilitas_31e, id, newSptId);
		await copyTable(tx, spt_pph_badan_lampiran_9_harta, id, newSptId);
		await copyTable(tx, spt_pph_badan_lampiran_9_ringkasan_komersial, id, newSptId);
		await copyTable(tx, spt_pph_badan_lampiran_10a_transaksi, id, newSptId);
		await copyTable(tx, spt_pph_badan_lampiran_10b_pernyataan, id, newSptId);
		await copyTable(tx, spt_pph_badan_lampiran_10c_transaksi, id, newSptId);
		await copyTable(tx, spt_pph_badan_lampiran_10c_pernyataan, id, newSptId);
		await copyTable(tx, spt_pph_badan_lampiran_10d_dokumen, id, newSptId);
		await copyTable(tx, spt_pph_badan_lampiran_13b_a_kerjasama, id, newSptId);
		await copyTable(tx, spt_pph_badan_lampiran_13b_b_biaya, id, newSptId);
		await copyTable(tx, spt_pph_badan_lampiran_13b_c_litbang, id, newSptId);
		await copyTable(tx, spt_pph_badan_lampiran_13b_d_penghitungan, id, newSptId);

		return newSptId;
	});

	redirect(303, `/surat-pemberitahuan/pph-badan?id=${newId}`);
});

async function copyTable(tx: Transaction, table: any, sourceSptId: string, newSptId: string) {
	const rows: any[] = await tx.select().from(table).where(eq(table.sptPphBadanId, sourceSptId));
	if (!rows.length) return;

	await tx.insert(table).values(rows.map(({ id, ...rest }) => ({ ...rest, sptPphBadanId: newSptId })));
}

async function copyLampiran5Tku(tx: Transaction, sourceSptId: string, newSptId: string) {
	const tkuRows = await tx
		.select()
		.from(spt_pph_badan_lampiran_5_tku)
		.where(eq(spt_pph_badan_lampiran_5_tku.sptPphBadanId, sourceSptId));

	for (const tkuRow of tkuRows) {
		const { id: oldTkuId, ...rest } = tkuRow;

		const [newTku] = await tx
			.insert(spt_pph_badan_lampiran_5_tku)
			.values({ ...rest, sptPphBadanId: newSptId })
			.returning({ id: spt_pph_badan_lampiran_5_tku.id });

		const bulananRows = await tx
			.select()
			.from(spt_pph_badan_lampiran_5_pp23_bulanan)
			.where(eq(spt_pph_badan_lampiran_5_pp23_bulanan.tkuId, oldTkuId));

		if (bulananRows.length) {
			await tx
				.insert(spt_pph_badan_lampiran_5_pp23_bulanan)
				.values(bulananRows.map(({ id, ...bulananRest }) => ({ ...bulananRest, tkuId: newTku.id })));
		}
	}
}
