import { db } from '$lib/server/db';
import {
	spt_pph_orang_pribadi_lampiran_1_bukti_potong,
	spt_pph_orang_pribadi_lampiran_1_harta,
	spt_pph_orang_pribadi_lampiran_1_keluarga,
	spt_pph_orang_pribadi_lampiran_1_pekerjaan,
	spt_pph_orang_pribadi_lampiran_1_utang
} from '$lib/server/db/schema';
import { asc, eq } from 'drizzle-orm';

export async function getLampiranL1(sptId: string) {
	const [harta, utang, keluarga, pekerjaan, buktiPotong] = await Promise.all([
		db
			.select()
			.from(spt_pph_orang_pribadi_lampiran_1_harta)
			.where(eq(spt_pph_orang_pribadi_lampiran_1_harta.sptPphOrangPribadiId, sptId))
			.orderBy(asc(spt_pph_orang_pribadi_lampiran_1_harta.nomorUrut)),
		db
			.select()
			.from(spt_pph_orang_pribadi_lampiran_1_utang)
			.where(eq(spt_pph_orang_pribadi_lampiran_1_utang.sptPphOrangPribadiId, sptId))
			.orderBy(asc(spt_pph_orang_pribadi_lampiran_1_utang.nomorUrut)),
		db
			.select()
			.from(spt_pph_orang_pribadi_lampiran_1_keluarga)
			.where(eq(spt_pph_orang_pribadi_lampiran_1_keluarga.sptPphOrangPribadiId, sptId))
			.orderBy(asc(spt_pph_orang_pribadi_lampiran_1_keluarga.nomorUrut)),
		db
			.select()
			.from(spt_pph_orang_pribadi_lampiran_1_pekerjaan)
			.where(eq(spt_pph_orang_pribadi_lampiran_1_pekerjaan.sptPphOrangPribadiId, sptId))
			.orderBy(asc(spt_pph_orang_pribadi_lampiran_1_pekerjaan.nomorUrut)),
		db
			.select()
			.from(spt_pph_orang_pribadi_lampiran_1_bukti_potong)
			.where(eq(spt_pph_orang_pribadi_lampiran_1_bukti_potong.sptPphOrangPribadiId, sptId))
			.orderBy(asc(spt_pph_orang_pribadi_lampiran_1_bukti_potong.nomorUrut))
	]);

	// The six harta sub-tables share one table, so they are split back out here.
	const hartaPerSubTabel = {
		a1: harta.filter((row) => row.subTabel === 'a1'),
		a2: harta.filter((row) => row.subTabel === 'a2'),
		a3: harta.filter((row) => row.subTabel === 'a3'),
		a4: harta.filter((row) => row.subTabel === 'a4'),
		a5: harta.filter((row) => row.subTabel === 'a5'),
		a6: harta.filter((row) => row.subTabel === 'a6')
	};

	return { harta: hartaPerSubTabel, utang, keluarga, pekerjaan, buktiPotong };
}
