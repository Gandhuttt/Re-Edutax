import { getRequestEvent, query } from '$app/server';
import { db } from '$lib/server/db';
import {
	mata_uang_spt_pph_badan,
	sektor_usaha_spt_pph_badan,
	spt_pph_badan,
	spt_pph_badan_lampiran_1_laba_rugi,
	spt_pph_badan_lampiran_1_neraca
} from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { asc, and, eq } from 'drizzle-orm';

export const getSptPphBadan = query(async () => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;
	const id = event.url.searchParams.get('id');

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	if (!id) {
		error(400, 'SPT PPh Badan tidak dipilih');
	}

	const [spt] = await db
		.select({
			id: spt_pph_badan.id,
			npwp: spt_pph_badan.npwp,
			tahunPajak: spt_pph_badan.tahunPajak,
			pembetulanKe: spt_pph_badan.pembetulanKe,
			statusSpt: spt_pph_badan.statusSpt,
			statusDraft: spt_pph_badan.statusDraft,
			periodePembukuanMulai: spt_pph_badan.periodePembukuanMulai,
			periodePembukuanSelesai: spt_pph_badan.periodePembukuanSelesai,
			metodePembukuan: spt_pph_badan.metodePembukuan,
			mataUangKode: mata_uang_spt_pph_badan.kode,
			sektorUsahaKode: sektor_usaha_spt_pph_badan.kode,
			menerimaPenghasilanPp23: spt_pph_badan.menerimaPenghasilanPp23,
			hanyaPenghasilanPp23: spt_pph_badan.hanyaPenghasilanPp23,
			menerimaPenghasilanFinal: spt_pph_badan.menerimaPenghasilanFinal,
			menerimaPenghasilanBukanObjekPajak: spt_pph_badan.menerimaPenghasilanBukanObjekPajak,
			tarifPajak: spt_pph_badan.tarifPajak,
			pphKurangLebihBayar: spt_pph_badan.pphKurangLebihBayar
		})
		.from(spt_pph_badan)
		.innerJoin(mata_uang_spt_pph_badan, eq(spt_pph_badan.mataUangPembukuanId, mata_uang_spt_pph_badan.id))
		.leftJoin(sektor_usaha_spt_pph_badan, eq(spt_pph_badan.sektorUsahaId, sektor_usaha_spt_pph_badan.id))
		.where(and(eq(spt_pph_badan.id, id), eq(spt_pph_badan.npwp, activeNpwp)))
		.limit(1);

	if (!spt) {
		error(404, 'SPT PPh Badan tidak ditemukan');
	}

	const [labaRugi, neraca] = await Promise.all([
		db
			.select()
			.from(spt_pph_badan_lampiran_1_laba_rugi)
			.where(eq(spt_pph_badan_lampiran_1_laba_rugi.sptPphBadanId, id))
			.orderBy(asc(spt_pph_badan_lampiran_1_laba_rugi.nomorUrut)),
		db
			.select()
			.from(spt_pph_badan_lampiran_1_neraca)
			.where(eq(spt_pph_badan_lampiran_1_neraca.sptPphBadanId, id))
			.orderBy(asc(spt_pph_badan_lampiran_1_neraca.nomorUrut))
	]);

	return {
		readonly: spt.statusDraft !== 'konsep',
		spt,
		lampiran1: {
			labaRugi,
			neraca
		}
	};
});
