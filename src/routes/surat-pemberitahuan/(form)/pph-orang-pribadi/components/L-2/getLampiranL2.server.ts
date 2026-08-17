import { db } from '$lib/server/db';
import {
	spt_pph_orang_pribadi_lampiran_2_bukan_objek,
	spt_pph_orang_pribadi_lampiran_2_final,
	spt_pph_orang_pribadi_lampiran_2_luar_negeri
} from '$lib/server/db/schema';
import { asc, eq } from 'drizzle-orm';

export async function getLampiranL2(sptId: string) {
	const [final, bukanObjek, luarNegeri] = await Promise.all([
		db
			.select()
			.from(spt_pph_orang_pribadi_lampiran_2_final)
			.where(eq(spt_pph_orang_pribadi_lampiran_2_final.sptPphOrangPribadiId, sptId))
			.orderBy(asc(spt_pph_orang_pribadi_lampiran_2_final.nomorUrut)),
		db
			.select()
			.from(spt_pph_orang_pribadi_lampiran_2_bukan_objek)
			.where(eq(spt_pph_orang_pribadi_lampiran_2_bukan_objek.sptPphOrangPribadiId, sptId))
			.orderBy(asc(spt_pph_orang_pribadi_lampiran_2_bukan_objek.nomorUrut)),
		db
			.select()
			.from(spt_pph_orang_pribadi_lampiran_2_luar_negeri)
			.where(eq(spt_pph_orang_pribadi_lampiran_2_luar_negeri.sptPphOrangPribadiId, sptId))
			.orderBy(asc(spt_pph_orang_pribadi_lampiran_2_luar_negeri.nomorUrut))
	]);

	return { final, bukanObjek, luarNegeri };
}
