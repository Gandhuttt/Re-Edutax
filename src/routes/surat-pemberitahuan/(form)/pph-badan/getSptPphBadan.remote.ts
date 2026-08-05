import { getRequestEvent, query } from '$app/server';
import { db } from '$lib/server/db';
import {
	mata_uang_spt_pph_badan,
	negara_spt_pph_badan,
	opini_auditor_spt_pph_badan,
	sektor_usaha_spt_pph_badan,
	spt_pph_badan,
	spt_pph_badan_lampiran_1_laba_rugi,
	spt_pph_badan_lampiran_1_neraca,
	spt_pph_badan_lampiran_2_afiliasi,
	spt_pph_badan_lampiran_2_pihak
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
			diaudit: spt_pph_badan.diaudit,
			opiniAuditorKode: opini_auditor_spt_pph_badan.kode,
			npwpKantorAkuntanPublik: spt_pph_badan.npwpKantorAkuntanPublik,
			namaKantorAkuntanPublik: spt_pph_badan.namaKantorAkuntanPublik,
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
		.leftJoin(
			opini_auditor_spt_pph_badan,
			eq(spt_pph_badan.opiniAuditorId, opini_auditor_spt_pph_badan.id)
		)
		.where(and(eq(spt_pph_badan.id, id), eq(spt_pph_badan.npwp, activeNpwp)))
		.limit(1);

	if (!spt) {
		error(404, 'SPT PPh Badan tidak ditemukan');
	}

	const [labaRugi, neraca, pemegangSaham, penyertaanModal] = await Promise.all([
		db
			.select()
			.from(spt_pph_badan_lampiran_1_laba_rugi)
			.where(eq(spt_pph_badan_lampiran_1_laba_rugi.sptPphBadanId, id))
			.orderBy(asc(spt_pph_badan_lampiran_1_laba_rugi.nomorUrut)),
		db
			.select()
			.from(spt_pph_badan_lampiran_1_neraca)
			.where(eq(spt_pph_badan_lampiran_1_neraca.sptPphBadanId, id))
			.orderBy(asc(spt_pph_badan_lampiran_1_neraca.nomorUrut)),
		db
			.select({
				id: spt_pph_badan_lampiran_2_pihak.id,
				nama: spt_pph_badan_lampiran_2_pihak.nama,
				alamat: spt_pph_badan_lampiran_2_pihak.alamat,
				negaraKode: negara_spt_pph_badan.kode,
				npwp: spt_pph_badan_lampiran_2_pihak.npwpNikTin,
				jabatan: spt_pph_badan_lampiran_2_pihak.jabatan,
				nilaiModal: spt_pph_badan_lampiran_2_pihak.modalSahamNominal,
				persentase: spt_pph_badan_lampiran_2_pihak.modalSahamPersentase,
				dividen: spt_pph_badan_lampiran_2_pihak.dividenDiterima
			})
			.from(spt_pph_badan_lampiran_2_pihak)
			.leftJoin(
				negara_spt_pph_badan,
				eq(spt_pph_badan_lampiran_2_pihak.negaraId, negara_spt_pph_badan.id)
			)
			.where(
				and(
					eq(spt_pph_badan_lampiran_2_pihak.sptPphBadanId, id),
					eq(spt_pph_badan_lampiran_2_pihak.jenis, 'pemegang_saham')
				)
			)
			.orderBy(asc(spt_pph_badan_lampiran_2_pihak.nomorUrut)),
		db
			.select({
				id: spt_pph_badan_lampiran_2_afiliasi.id,
				nama: spt_pph_badan_lampiran_2_afiliasi.namaPihakAfiliasi,
				negaraKode: negara_spt_pph_badan.kode,
				npwp: spt_pph_badan_lampiran_2_afiliasi.npwpTin,
				modalNilai: spt_pph_badan_lampiran_2_afiliasi.penyertaanModalNilai,
				modalPersen: spt_pph_badan_lampiran_2_afiliasi.penyertaanModalPersentase,
				utangNilai: spt_pph_badan_lampiran_2_afiliasi.utangNilai,
				utangTahun: spt_pph_badan_lampiran_2_afiliasi.utangTahun,
				utangBunga: spt_pph_badan_lampiran_2_afiliasi.utangBungaPersentase,
				piutangNilai: spt_pph_badan_lampiran_2_afiliasi.piutangNilai,
				piutangTahun: spt_pph_badan_lampiran_2_afiliasi.piutangTahun,
				piutangBunga: spt_pph_badan_lampiran_2_afiliasi.piutangBungaPersentase
			})
			.from(spt_pph_badan_lampiran_2_afiliasi)
			.leftJoin(
				negara_spt_pph_badan,
				eq(spt_pph_badan_lampiran_2_afiliasi.negaraId, negara_spt_pph_badan.id)
			)
			.where(eq(spt_pph_badan_lampiran_2_afiliasi.sptPphBadanId, id))
			.orderBy(asc(spt_pph_badan_lampiran_2_afiliasi.nomorUrut))
	]);

	return {
		readonly: spt.statusDraft !== 'konsep',
		spt,
		lampiran1: {
			labaRugi,
			neraca
		},
		lampiran2: {
			pemegangSaham,
			penyertaanModal
		}
	};
});
