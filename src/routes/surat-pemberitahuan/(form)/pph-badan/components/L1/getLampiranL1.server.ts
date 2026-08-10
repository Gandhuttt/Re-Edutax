import { db } from '$lib/server/db';
import {
	kode_koreksi_fiskal_spt_pph_badan,
	spt_pph_badan_lampiran_1_laba_rugi,
	spt_pph_badan_lampiran_1_laba_rugi_koreksi_fiskal,
	spt_pph_badan_lampiran_1_neraca
} from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function getLampiranL1(sptPphBadanId: string) {
	const [nilai, kodeKoreksiFiskal, neraca] = await Promise.all([
		db
			.select({
				id: spt_pph_badan_lampiran_1_laba_rugi.id,
				akunId: spt_pph_badan_lampiran_1_laba_rugi.akunId,
				nilaiKomersial: spt_pph_badan_lampiran_1_laba_rugi.nilaiKomersial,
				nonObjekPajak: spt_pph_badan_lampiran_1_laba_rugi.nonObjekPajak,
				dikenakanPphFinal: spt_pph_badan_lampiran_1_laba_rugi.dikenakanPphFinal,
				penyesuaianFiskalPositif: spt_pph_badan_lampiran_1_laba_rugi.penyesuaianFiskalPositif,
				penyesuaianFiskalNegatif: spt_pph_badan_lampiran_1_laba_rugi.penyesuaianFiskalNegatif
			})
			.from(spt_pph_badan_lampiran_1_laba_rugi)
			.where(eq(spt_pph_badan_lampiran_1_laba_rugi.sptPphBadanId, sptPphBadanId)),
		db
			.select({
				labaRugiId: spt_pph_badan_lampiran_1_laba_rugi_koreksi_fiskal.labaRugiId,
				kode: kode_koreksi_fiskal_spt_pph_badan.kode
			})
			.from(spt_pph_badan_lampiran_1_laba_rugi_koreksi_fiskal)
			.innerJoin(
				spt_pph_badan_lampiran_1_laba_rugi,
				eq(spt_pph_badan_lampiran_1_laba_rugi_koreksi_fiskal.labaRugiId, spt_pph_badan_lampiran_1_laba_rugi.id)
			)
			.innerJoin(
				kode_koreksi_fiskal_spt_pph_badan,
				eq(spt_pph_badan_lampiran_1_laba_rugi_koreksi_fiskal.kodeKoreksiFiskalId, kode_koreksi_fiskal_spt_pph_badan.id)
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

	const kodeByLabaRugiId = new Map<string, string[]>();
	for (const row of kodeKoreksiFiskal) {
		const existing = kodeByLabaRugiId.get(row.labaRugiId) ?? [];
		existing.push(row.kode);
		kodeByLabaRugiId.set(row.labaRugiId, existing);
	}

	return {
		nilai: nilai.map((row) => ({
			...row,
			kodePenyesuaianFiskal: kodeByLabaRugiId.get(row.id) ?? []
		})),
		neraca
	};
}
