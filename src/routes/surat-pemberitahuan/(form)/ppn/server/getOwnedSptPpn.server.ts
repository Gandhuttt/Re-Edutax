import { db } from '$lib/server/db';
import { spt_ppn } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';

export async function getOwnedSptPpn(id: string, activeNpwp: string) {
	const [sptPpn] = await db
		.select()
		.from(spt_ppn)
		.where(and(eq(spt_ppn.id, id), eq(spt_ppn.npwp, activeNpwp)))
		.limit(1);

	if (!sptPpn) {
		error(404, 'SPT PPN tidak ditemukan');
	}

	return sptPpn;
}
