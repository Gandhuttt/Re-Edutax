import { db } from '$lib/server/db';
import { spt_pph_badan } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';

export async function getOwnedSptPphBadan(id: string, activeNpwp: string) {
	const [spt] = await db
		.select()
		.from(spt_pph_badan)
		.where(and(eq(spt_pph_badan.id, id), eq(spt_pph_badan.npwp, activeNpwp)))
		.limit(1);

	if (!spt) {
		error(404, 'SPT PPh Badan tidak ditemukan');
	}

	return spt;
}
