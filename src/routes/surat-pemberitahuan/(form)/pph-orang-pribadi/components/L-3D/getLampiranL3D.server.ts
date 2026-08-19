import { db } from '$lib/server/db';
import {
	spt_pph_orang_pribadi_lampiran_3d_entertainment,
	spt_pph_orang_pribadi_lampiran_3d_piutang,
	spt_pph_orang_pribadi_lampiran_3d_promosi
} from '$lib/server/db/schema';
import { asc, eq } from 'drizzle-orm';

export async function getLampiranL3D(sptId: string) {
	const [entertainment, promosi, piutang] = await Promise.all([
		db
			.select()
			.from(spt_pph_orang_pribadi_lampiran_3d_entertainment)
			.where(eq(spt_pph_orang_pribadi_lampiran_3d_entertainment.sptPphOrangPribadiId, sptId))
			.orderBy(asc(spt_pph_orang_pribadi_lampiran_3d_entertainment.nomorUrut)),
		db
			.select()
			.from(spt_pph_orang_pribadi_lampiran_3d_promosi)
			.where(eq(spt_pph_orang_pribadi_lampiran_3d_promosi.sptPphOrangPribadiId, sptId))
			.orderBy(asc(spt_pph_orang_pribadi_lampiran_3d_promosi.nomorUrut)),
		db
			.select()
			.from(spt_pph_orang_pribadi_lampiran_3d_piutang)
			.where(eq(spt_pph_orang_pribadi_lampiran_3d_piutang.sptPphOrangPribadiId, sptId))
			.orderBy(asc(spt_pph_orang_pribadi_lampiran_3d_piutang.nomorUrut))
	]);

	return { entertainment, promosi, piutang };
}
