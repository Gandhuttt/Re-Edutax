import { db } from '$lib/server/db';
import {
	spt_pph_badan_lampiran_5_pp23_bulanan,
	spt_pph_badan_lampiran_5_pp23_dipotong_bulanan,
	spt_pph_badan_lampiran_5_tku
} from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function getLampiranL5(sptPphBadanId: string) {
	const [tku, bulanan, dipotongBulanan] = await Promise.all([
		db
			.select({
				id: spt_pph_badan_lampiran_5_tku.id,
				nitku: spt_pph_badan_lampiran_5_tku.nitku,
				nama: spt_pph_badan_lampiran_5_tku.nama,
				alamat: spt_pph_badan_lampiran_5_tku.alamat,
				kelurahan: spt_pph_badan_lampiran_5_tku.kelurahan,
				kecamatan: spt_pph_badan_lampiran_5_tku.kecamatan,
				kabupaten: spt_pph_badan_lampiran_5_tku.kabupaten,
				provinsi: spt_pph_badan_lampiran_5_tku.provinsi
			})
			.from(spt_pph_badan_lampiran_5_tku)
			.where(eq(spt_pph_badan_lampiran_5_tku.sptPphBadanId, sptPphBadanId)),
		db
			.select({
				tkuId: spt_pph_badan_lampiran_5_pp23_bulanan.tkuId,
				bulan: spt_pph_badan_lampiran_5_pp23_bulanan.bulan,
				jumlahPeredaranBruto: spt_pph_badan_lampiran_5_pp23_bulanan.jumlahPeredaranBruto
			})
			.from(spt_pph_badan_lampiran_5_pp23_bulanan)
			.innerJoin(
				spt_pph_badan_lampiran_5_tku,
				eq(spt_pph_badan_lampiran_5_pp23_bulanan.tkuId, spt_pph_badan_lampiran_5_tku.id)
			)
			.where(eq(spt_pph_badan_lampiran_5_tku.sptPphBadanId, sptPphBadanId)),
		db
			.select({
				bulan: spt_pph_badan_lampiran_5_pp23_dipotong_bulanan.bulan,
				nilai: spt_pph_badan_lampiran_5_pp23_dipotong_bulanan.nilai
			})
			.from(spt_pph_badan_lampiran_5_pp23_dipotong_bulanan)
			.where(eq(spt_pph_badan_lampiran_5_pp23_dipotong_bulanan.sptPphBadanId, sptPphBadanId))
	]);

	return { tku, bulanan, dipotongBulanan };
}
