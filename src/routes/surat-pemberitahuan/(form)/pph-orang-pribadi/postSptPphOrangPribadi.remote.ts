import { form, getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { spt_pph_orang_pribadi_lampiran_1_bukti_potong } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { asc, eq } from 'drizzle-orm';
import * as v from 'valibot';
import { computePostedSptPphOrangPribadiLampiranL1E } from './server/computePostedSptPphOrangPribadiLampiranL1E.server';
import { getOwnedSptPphOrangPribadi } from './server/getOwnedSptPphOrangPribadi.server';

const SptPphOrangPribadiIdSchema = v.object({ id: v.string() });

// "Posting SPT" -- bulk-pulls every eligible eBupot bukti potong this
// taxpayer received (as recipient) for this SPT's tax year straight into
// L-1 Bagian E, same mechanism as PPN's Posting (postSptPpn.remote.ts)
// pulling Faktur Pajak into Lampiran A-2/B-2/C, and mirrored on the Badan
// side (pph-badan/postSptPphBadan.remote.ts).
//
// Unlike PPN's lampiran (pure posting-computed snapshots, no manual-entry
// UI), L-1 Bagian E has always supported manual Tambah/Ubah/Hapus too --
// so posting here only replaces the rows IT previously wrote
// (sumberBuktiPotongId set), leaving manually-typed rows untouched.
// Re-runnable while statusDraft='konsep'.
export const postSptPphOrangPribadi = form(SptPphOrangPribadiIdSchema, async ({ id }) => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	const spt = await getOwnedSptPphOrangPribadi(id, activeNpwp);

	if (spt.statusDraft !== 'konsep') {
		error(400, 'SPT yang sudah dilaporkan tidak dapat diposting ulang');
	}

	const existing = await db
		.select()
		.from(spt_pph_orang_pribadi_lampiran_1_bukti_potong)
		.where(eq(spt_pph_orang_pribadi_lampiran_1_bukti_potong.sptPphOrangPribadiId, id));

	const manual = existing.filter((row) => !row.sumberBuktiPotongId);
	const posted = await computePostedSptPphOrangPribadiLampiranL1E({
		npwp: activeNpwp,
		tahunPajak: spt.tahunPajak
	});

	// D1 has no real multi-statement transaction over the Workers binding,
	// only db.batch() (every statement must be built upfront).
	const statements = [
		db
			.delete(spt_pph_orang_pribadi_lampiran_1_bukti_potong)
			.where(eq(spt_pph_orang_pribadi_lampiran_1_bukti_potong.sptPphOrangPribadiId, id)),
		...manual.map((row, index) =>
			db.insert(spt_pph_orang_pribadi_lampiran_1_bukti_potong).values({
				sptPphOrangPribadiId: id,
				nomorUrut: index + 1,
				namaPemotong: row.namaPemotong,
				npwpPemotong: row.npwpPemotong,
				nomorBukti: row.nomorBukti,
				tanggalBukti: row.tanggalBukti,
				jenisPajak: row.jenisPajak,
				penghasilanBruto: row.penghasilanBruto,
				pphDipotong: row.pphDipotong,
				sumberBuktiPotongJenis: null,
				sumberBuktiPotongId: null
			})
		),
		...posted.map((row, index) =>
			db.insert(spt_pph_orang_pribadi_lampiran_1_bukti_potong).values({
				sptPphOrangPribadiId: id,
				nomorUrut: manual.length + index + 1,
				...row
			})
		)
	];

	await db.batch(statements as [(typeof statements)[number], ...(typeof statements)[number][]]);

	const l1BuktiPotong = await db
		.select()
		.from(spt_pph_orang_pribadi_lampiran_1_bukti_potong)
		.where(eq(spt_pph_orang_pribadi_lampiran_1_bukti_potong.sptPphOrangPribadiId, id))
		.orderBy(asc(spt_pph_orang_pribadi_lampiran_1_bukti_potong.nomorUrut));

	return { imported: posted.length, l1BuktiPotong };
});
