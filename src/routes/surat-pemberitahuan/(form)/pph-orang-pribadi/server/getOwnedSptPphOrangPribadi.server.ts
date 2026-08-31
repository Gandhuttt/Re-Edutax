import { db } from '$lib/server/db';
import { spt_pph_orang_pribadi } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';

export async function getOwnedSptPphOrangPribadi(id: string, activeNpwp: string) {
	const [spt] = await db
		.select()
		.from(spt_pph_orang_pribadi)
		.where(and(eq(spt_pph_orang_pribadi.id, id), eq(spt_pph_orang_pribadi.npwp, activeNpwp)))
		.limit(1);

	if (!spt) {
		error(404, 'SPT PPh Orang Pribadi tidak ditemukan');
	}

	return spt;
}
