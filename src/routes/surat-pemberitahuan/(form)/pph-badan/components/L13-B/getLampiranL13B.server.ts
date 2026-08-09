import { db } from '$lib/server/db';
import {
	spt_pph_badan_lampiran_13b_a_kerjasama,
	spt_pph_badan_lampiran_13b_b_biaya,
	spt_pph_badan_lampiran_13b_c_litbang,
	spt_pph_badan_lampiran_13b_d_penghitungan
} from '$lib/server/db/schema';
import { asc, eq } from 'drizzle-orm';
import { L13B_BIAYA_NAMA, L13B_BIAYA_URUTAN } from './biayaKode';

export async function getLampiranL13B(sptPphBadanId: string) {
	const [a, komponenB, c, [d]] = await Promise.all([
		db
			.select({
				id: spt_pph_badan_lampiran_13b_a_kerjasama.id,
				perjanjianNomor: spt_pph_badan_lampiran_13b_a_kerjasama.perjanjianNomor,
				perjanjianTanggal: spt_pph_badan_lampiran_13b_a_kerjasama.perjanjianTanggal,
				mitraKegiatan: spt_pph_badan_lampiran_13b_a_kerjasama.mitraKegiatan,
				keterangan: spt_pph_badan_lampiran_13b_a_kerjasama.keterangan
			})
			.from(spt_pph_badan_lampiran_13b_a_kerjasama)
			.where(eq(spt_pph_badan_lampiran_13b_a_kerjasama.sptPphBadanId, sptPphBadanId))
			.orderBy(asc(spt_pph_badan_lampiran_13b_a_kerjasama.nomorUrut)),
		db
			.select({ kode: spt_pph_badan_lampiran_13b_b_biaya.kode, nilai: spt_pph_badan_lampiran_13b_b_biaya.nilai })
			.from(spt_pph_badan_lampiran_13b_b_biaya)
			.where(eq(spt_pph_badan_lampiran_13b_b_biaya.sptPphBadanId, sptPphBadanId)),
		db
			.select({
				id: spt_pph_badan_lampiran_13b_c_litbang.id,
				nomorProposal: spt_pph_badan_lampiran_13b_c_litbang.nomorProposal,
				jangkaWaktuDariTahun: spt_pph_badan_lampiran_13b_c_litbang.jangkaWaktuDariTahun,
				jangkaWaktuSampaiTahun: spt_pph_badan_lampiran_13b_c_litbang.jangkaWaktuSampaiTahun,
				jumlahBiaya: spt_pph_badan_lampiran_13b_c_litbang.jumlahBiaya,
				tahunPerolehanHki: spt_pph_badan_lampiran_13b_c_litbang.tahunPerolehanHki,
				persentaseFasilitasPajak: spt_pph_badan_lampiran_13b_c_litbang.persentaseFasilitasPajak
			})
			.from(spt_pph_badan_lampiran_13b_c_litbang)
			.where(eq(spt_pph_badan_lampiran_13b_c_litbang.sptPphBadanId, sptPphBadanId))
			.orderBy(asc(spt_pph_badan_lampiran_13b_c_litbang.nomorUrut)),
		db
			.select({
				termanfaatkanTahunSebelumnya: spt_pph_badan_lampiran_13b_d_penghitungan.termanfaatkanTahunSebelumnya
			})
			.from(spt_pph_badan_lampiran_13b_d_penghitungan)
			.where(eq(spt_pph_badan_lampiran_13b_d_penghitungan.sptPphBadanId, sptPphBadanId))
	]);

	const nilaiByKode = new Map(komponenB.map((row) => [row.kode, row.nilai]));

	return {
		a,
		b: L13B_BIAYA_URUTAN.map((kode) => ({
			kode,
			nama: L13B_BIAYA_NAMA[kode],
			nilai: nilaiByKode.get(kode) ?? 0
		})),
		c: c.map((row) => ({
			...row,
			jangkaWaktuDariTahun: row.jangkaWaktuDariTahun ?? 0,
			jangkaWaktuSampaiTahun: row.jangkaWaktuSampaiTahun ?? 0,
			tahunPerolehanHki: row.tahunPerolehanHki ?? 0
		})),
		d: {
			termanfaatkanTahunSebelumnya: d?.termanfaatkanTahunSebelumnya ?? 0
		}
	};
}
