import { getRequestEvent, query } from '$app/server';
import { db } from '$lib/server/db';
import {
	spt_ppn_lampiran_a2,
	spt_ppn_lampiran_b2,
	spt_ppn_lampiran_c,
	spt_ppn_penyerahan,
	spt_ppn_perolehan
} from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { asc, eq } from 'drizzle-orm';
import { getOrCreateCurrentSptPpn } from './server/getOrCreateCurrentSptPpn.server';
import { getOwnedSptPpn } from './server/getOwnedSptPpn.server';
import { getTaxpayerForSptPpn } from './server/getTaxpayerForSptPpn.server';

export const getSptPpn = query(async () => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;
	const requestedId = event.url.searchParams.get('id');

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	const taxpayer = await getTaxpayerForSptPpn(activeNpwp);
	const sptPpn = requestedId
		? await getOwnedSptPpn(requestedId, activeNpwp)
		: await getOrCreateCurrentSptPpn(activeNpwp, taxpayer.nama);

	// Bagian I and II live on their own child tables (see spt_ppn_penyerahan/
	// spt_ppn_perolehan), so they're joined back in here and flattened onto a
	// single object — the rekap I/II components and +page.svelte still expect
	// one flat sptItem shape, unaware the columns moved off spt_ppn itself.
	const [penyerahan] = await db
		.select()
		.from(spt_ppn_penyerahan)
		.where(eq(spt_ppn_penyerahan.sptPpnId, sptPpn.id))
		.limit(1);
	const [perolehan] = await db
		.select()
		.from(spt_ppn_perolehan)
		.where(eq(spt_ppn_perolehan.sptPpnId, sptPpn.id))
		.limit(1);

	// Lampiran A-2/B-2/C are read-only per-invoice snapshots written by
	// postSptPpn at "Posting SPT" time (see computePostedSptPpnLampiran).
	const lampiranA2 = await db
		.select()
		.from(spt_ppn_lampiran_a2)
		.where(eq(spt_ppn_lampiran_a2.sptPpnId, sptPpn.id))
		.orderBy(asc(spt_ppn_lampiran_a2.nomorUrut));
	const lampiranB2 = await db
		.select()
		.from(spt_ppn_lampiran_b2)
		.where(eq(spt_ppn_lampiran_b2.sptPpnId, sptPpn.id))
		.orderBy(asc(spt_ppn_lampiran_b2.nomorUrut));
	const lampiranC = await db
		.select()
		.from(spt_ppn_lampiran_c)
		.where(eq(spt_ppn_lampiran_c.sptPpnId, sptPpn.id))
		.orderBy(asc(spt_ppn_lampiran_c.nomorUrut));

	return {
		id: sptPpn.id,
		status: sptPpn.status,
		readonly: sptPpn.status !== 'konsep',
		taxpayer,
		spt: { ...penyerahan, ...perolehan, ...sptPpn },
		lampiranA2,
		lampiranB2,
		lampiranC
	};
});
