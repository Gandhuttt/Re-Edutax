import { form, getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import {
	jenis_pajak_dipotong_dipungut_spt_pph_badan,
	spt_pph_badan_lampiran_3_pph_dipotong
} from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { asc, eq } from 'drizzle-orm';
import * as v from 'valibot';
import { computePostedSptPphBadanLampiranL3B } from './server/computePostedSptPphBadanLampiranL3B.server';
import { getOwnedSptPphBadan } from './server/getOwnedSptPphBadan.server';

const SptPphBadanIdSchema = v.object({ id: v.string() });

// "Posting SPT" / "Prefill SPT" -- bulk-pulls every eligible eBupot BPU
// bukti potong this taxpayer received (as recipient) for this SPT's tax
// year straight into Lampiran III.B, same mechanism as PPN's Posting
// (postSptPpn.remote.ts) pulling Faktur Pajak into Lampiran A-2/B-2/C.
//
// Unlike PPN's lampiran (which are pure posting-computed snapshots with no
// manual-entry UI at all), Lampiran III.B has always supported manual
// Tambah/Edit/Hapus too -- so posting here only replaces the rows IT
// previously wrote (sumberBuktiPotongId set), leaving any manually-typed
// rows (sumberBuktiPotongId null) untouched. Re-runnable while
// statusDraft='konsep': each call recomputes fresh from the taxpayer's
// current eBupot state and overwrites only its own prior rows.
export const postSptPphBadan = form(SptPphBadanIdSchema, async ({ id }) => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	const spt = await getOwnedSptPphBadan(id, activeNpwp);

	if (spt.statusDraft !== 'konsep') {
		error(400, 'SPT yang sudah dilaporkan tidak dapat diposting ulang');
	}

	const existing = await db
		.select()
		.from(spt_pph_badan_lampiran_3_pph_dipotong)
		.where(eq(spt_pph_badan_lampiran_3_pph_dipotong.sptPphBadanId, id));

	const manual = existing.filter((row) => !row.sumberBuktiPotongId);
	const posted = await computePostedSptPphBadanLampiranL3B({ npwp: activeNpwp, tahunPajak: spt.tahunPajak });

	// D1 has no real multi-statement transaction over the Workers binding,
	// only db.batch() (every statement must be built upfront).
	const statements = [
		db
			.delete(spt_pph_badan_lampiran_3_pph_dipotong)
			.where(eq(spt_pph_badan_lampiran_3_pph_dipotong.sptPphBadanId, id)),
		...manual.map((row, index) =>
			db.insert(spt_pph_badan_lampiran_3_pph_dipotong).values({
				sptPphBadanId: id,
				nomorUrut: index + 1,
				namaPemotongPemungut: row.namaPemotongPemungut,
				npwpPemotongPemungut: row.npwpPemotongPemungut,
				jenisPajakId: row.jenisPajakId,
				dpp: row.dpp,
				pph: row.pph,
				nomorBukti: row.nomorBukti,
				tanggalBukti: row.tanggalBukti,
				sumberBuktiPotongJenis: null,
				sumberBuktiPotongId: null
			})
		),
		...posted.map((row, index) =>
			db.insert(spt_pph_badan_lampiran_3_pph_dipotong).values({
				sptPphBadanId: id,
				nomorUrut: manual.length + index + 1,
				...row
			})
		)
	];

	await db.batch(statements as [(typeof statements)[number], ...(typeof statements)[number][]]);

	const pphDipotong = await db
		.select({
			id: spt_pph_badan_lampiran_3_pph_dipotong.id,
			namaPemotongPemungut: spt_pph_badan_lampiran_3_pph_dipotong.namaPemotongPemungut,
			npwp: spt_pph_badan_lampiran_3_pph_dipotong.npwpPemotongPemungut,
			jenisPajakKode: jenis_pajak_dipotong_dipungut_spt_pph_badan.kode,
			dpp: spt_pph_badan_lampiran_3_pph_dipotong.dpp,
			pph: spt_pph_badan_lampiran_3_pph_dipotong.pph,
			nomorBukti: spt_pph_badan_lampiran_3_pph_dipotong.nomorBukti,
			tanggalBukti: spt_pph_badan_lampiran_3_pph_dipotong.tanggalBukti,
			sumberBuktiPotongJenis: spt_pph_badan_lampiran_3_pph_dipotong.sumberBuktiPotongJenis,
			sumberBuktiPotongId: spt_pph_badan_lampiran_3_pph_dipotong.sumberBuktiPotongId
		})
		.from(spt_pph_badan_lampiran_3_pph_dipotong)
		.leftJoin(
			jenis_pajak_dipotong_dipungut_spt_pph_badan,
			eq(spt_pph_badan_lampiran_3_pph_dipotong.jenisPajakId, jenis_pajak_dipotong_dipungut_spt_pph_badan.id)
		)
		.where(eq(spt_pph_badan_lampiran_3_pph_dipotong.sptPphBadanId, id))
		.orderBy(asc(spt_pph_badan_lampiran_3_pph_dipotong.nomorUrut));

	return {
		imported: posted.length,
		pphDipotong: pphDipotong.map((row) => ({ ...row, jenisPajakKode: row.jenisPajakKode ?? '' }))
	};
});
