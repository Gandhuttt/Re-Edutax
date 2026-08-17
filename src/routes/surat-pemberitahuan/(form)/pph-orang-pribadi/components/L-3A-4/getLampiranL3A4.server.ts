import { db } from '$lib/server/db';
import { spt_pph_orang_pribadi_lampiran_3a4_lainnya } from '$lib/server/db/schema';
import { asc, eq } from 'drizzle-orm';

export async function getLampiranL3A4(sptId: string) {
	const lainnya = await db
		.select()
		.from(spt_pph_orang_pribadi_lampiran_3a4_lainnya)
		.where(eq(spt_pph_orang_pribadi_lampiran_3a4_lainnya.sptPphOrangPribadiId, sptId))
		.orderBy(asc(spt_pph_orang_pribadi_lampiran_3a4_lainnya.nomorUrut));

	return { lainnya };
}
