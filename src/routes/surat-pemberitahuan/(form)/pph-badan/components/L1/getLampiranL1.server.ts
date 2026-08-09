import { db } from '$lib/server/db';
import {
	kode_koreksi_fiskal_spt_pph_badan,
	spt_pph_badan_lampiran_1_laba_rugi,
	spt_pph_badan_lampiran_1_neraca
} from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function getLampiranL1(sptPphBadanId: string) {
	const [nilai, neraca] = await Promise.all([
		db
			.select({
				id: spt_pph_badan_lampiran_1_laba_rugi.id,
				akunId: spt_pph_badan_lampiran_1_laba_rugi.akunId,
				nilaiKomersial: spt_pph_badan_lampiran_1_laba_rugi.nilaiKomersial,
				nonObjekPajak: spt_pph_badan_lampiran_1_laba_rugi.nonObjekPajak,
				dikenakanPphFinal: spt_pph_badan_lampiran_1_laba_rugi.dikenakanPphFinal,
				penyesuaianFiskalPositif: spt_pph_badan_lampiran_1_laba_rugi.penyesuaianFiskalPositif,
				penyesuaianFiskalNegatif: spt_pph_badan_lampiran_1_laba_rugi.penyesuaianFiskalNegatif,
				kodePenyesuaianFiskal: kode_koreksi_fiskal_spt_pph_badan.kode
			})
			.from(spt_pph_badan_lampiran_1_laba_rugi)
			.leftJoin(
				kode_koreksi_fiskal_spt_pph_badan,
				eq(spt_pph_badan_lampiran_1_laba_rugi.kodePenyesuaianFiskalId, kode_koreksi_fiskal_spt_pph_badan.id)
			)
			.where(eq(spt_pph_badan_lampiran_1_laba_rugi.sptPphBadanId, sptPphBadanId)),
		db
			.select({
				id: spt_pph_badan_lampiran_1_neraca.id,
				akunId: spt_pph_badan_lampiran_1_neraca.akunId,
				nilai: spt_pph_badan_lampiran_1_neraca.nilai
			})
			.from(spt_pph_badan_lampiran_1_neraca)
			.where(eq(spt_pph_badan_lampiran_1_neraca.sptPphBadanId, sptPphBadanId))
	]);

	return {
		nilai: nilai.map((row) => ({ ...row, kodePenyesuaianFiskal: row.kodePenyesuaianFiskal ?? '' })),
		neraca
	};
}
