import { form, getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { spt_ppn, spt_ppn_penyerahan, spt_ppn_perolehan } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';
import { computePostedSptPpnFields } from './server/computePostedSptPpnFields.server';
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

	await db
		.update(spt_ppn)
		.set({ ...induk, tanggalPosting: new Date() })
		.where(eq(spt_ppn.id, id));
	await db
		.update(spt_ppn_penyerahan)
		.set(penyerahan)
		.where(eq(spt_ppn_penyerahan.sptPpnId, id));
	await db
		.update(spt_ppn_perolehan)
		.set(perolehan)
		.where(eq(spt_ppn_perolehan.sptPpnId, id));

	return { fields: { ...penyerahan, ...perolehan, ...induk } };
});
