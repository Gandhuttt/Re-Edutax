import { db } from '$lib/server/db';
import {
	negara_spt_pph_badan,
	spt_pph_badan_lampiran_2_afiliasi,
	spt_pph_badan_lampiran_2_pihak
} from '$lib/server/db/schema';
import { and, asc, eq } from 'drizzle-orm';

export async function getLampiranL2(sptPphBadanId: string) {
	const [pemegangSaham, penyertaanModal] = await Promise.all([
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
			.leftJoin(negara_spt_pph_badan, eq(spt_pph_badan_lampiran_2_pihak.negaraId, negara_spt_pph_badan.id))
			.where(
				and(
					eq(spt_pph_badan_lampiran_2_pihak.sptPphBadanId, sptPphBadanId),
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
			.leftJoin(negara_spt_pph_badan, eq(spt_pph_badan_lampiran_2_afiliasi.negaraId, negara_spt_pph_badan.id))
			.where(eq(spt_pph_badan_lampiran_2_afiliasi.sptPphBadanId, sptPphBadanId))
			.orderBy(asc(spt_pph_badan_lampiran_2_afiliasi.nomorUrut))
	]);

	return { pemegangSaham, penyertaanModal };
}
