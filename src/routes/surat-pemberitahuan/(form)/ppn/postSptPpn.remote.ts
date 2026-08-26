import { form, getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import {
	spt_ppn,
	spt_ppn_lampiran_a2,
	spt_ppn_lampiran_b2,
	spt_ppn_lampiran_c,
	spt_ppn_penyerahan,
	spt_ppn_perolehan
} from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';
import { computePostedSptPpnFields } from './server/computePostedSptPpnFields.server';
import { computePostedSptPpnLampiran } from './server/computePostedSptPpnLampiran.server';
import { getOwnedSptPpn } from './server/getOwnedSptPpn.server';

const SptPpnIdSchema = v.object({
	id: v.string()
});

// Posting recomputes sections I, II and III.A-G from the taxpayer's uploaded
// faktur_pajak and writes them straight to the induk row (along with
// tanggalPosting), since those columns are read-only display values, not
// user edits — there is nothing to hold back until "Simpan Konsep"/"Simpan
// Lapor". Only the genuinely editable fields (III.H, IV, IX, X) are left for
// saveSptPpn to persist.
export const postSptPpn = form(SptPpnIdSchema, async ({ id }) => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	const sptPpn = await getOwnedSptPpn(id, activeNpwp);

	if (sptPpn.status !== 'konsep') {
		error(400, 'SPT yang sudah dilaporkan tidak dapat diposting ulang');
	}

	const { penyerahan, perolehan, ...induk } = await computePostedSptPpnFields({
		npwp: activeNpwp,
		periodeBulan: sptPpn.masaPajak,
		periodeTahun: sptPpn.tahun
	});
	const { a2, b2, c } = await computePostedSptPpnLampiran({
		npwp: activeNpwp,
		periodeBulan: sptPpn.masaPajak,
		periodeTahun: sptPpn.tahun
	});

	// D1 has no real multi-statement transaction over the Workers binding, only
	// db.batch() (every statement must be built upfront, no reading results
	// back mid-batch).
	const statements = [
		db
			.update(spt_ppn)
			.set({ ...induk, tanggalPosting: new Date() })
			.where(eq(spt_ppn.id, id)),
		// Older SPTs created before the induk normalization migration have no
		// matching penyerahan/perolehan row yet — upsert instead of a plain
		// UPDATE so posting one of those self-heals it instead of silently
		// affecting 0 rows.
		db
			.insert(spt_ppn_penyerahan)
			.values({ sptPpnId: id, ...penyerahan })
			.onConflictDoUpdate({ target: spt_ppn_penyerahan.sptPpnId, set: penyerahan }),
		db
			.insert(spt_ppn_perolehan)
			.values({ sptPpnId: id, ...perolehan })
			.onConflictDoUpdate({ target: spt_ppn_perolehan.sptPpnId, set: perolehan }),
		db.delete(spt_ppn_lampiran_a2).where(eq(spt_ppn_lampiran_a2.sptPpnId, id)),
		db.delete(spt_ppn_lampiran_b2).where(eq(spt_ppn_lampiran_b2.sptPpnId, id)),
		db.delete(spt_ppn_lampiran_c).where(eq(spt_ppn_lampiran_c.sptPpnId, id)),
		...a2.map((row, index) =>
			db.insert(spt_ppn_lampiran_a2).values({ sptPpnId: id, nomorUrut: index + 1, ...row })
		),
		...b2.map((row, index) =>
			db.insert(spt_ppn_lampiran_b2).values({ sptPpnId: id, nomorUrut: index + 1, ...row })
		),
		...c.map((row, index) =>
			db.insert(spt_ppn_lampiran_c).values({ sptPpnId: id, nomorUrut: index + 1, ...row })
		)
	];
	await db.batch(statements as [(typeof statements)[number], ...(typeof statements)[number][]]);

	return { fields: { ...penyerahan, ...perolehan, ...induk }, lampiran: { a2, b2, c } };
});
