import { db } from '$lib/server/db';
import {
	jenis_pajak_dipotong_dipungut_spt_pph_badan,
	jenis_penghasilan_kredit_pajak_luar_negeri_spt_pph_badan,
	mata_uang_spt_pph_badan,
	negara_spt_pph_badan,
	spt_pph_badan_lampiran_3_penghasilan_luar_negeri,
	spt_pph_badan_lampiran_3_pph_dipotong
} from '$lib/server/db/schema';
import { asc, eq } from 'drizzle-orm';

export async function getLampiranL3(sptPphBadanId: string, pengembalianPenguranganPphLuarNegeriTahunSebelumnya: number) {
	const [penghasilanLuarNegeri, pphDipotong] = await Promise.all([
		db
			.select({
				id: spt_pph_badan_lampiran_3_penghasilan_luar_negeri.id,
				namaPemberiPenghasilan: spt_pph_badan_lampiran_3_penghasilan_luar_negeri.namaPemberiPenghasilan,
				negaraKode: negara_spt_pph_badan.kode,
				tanggal: spt_pph_badan_lampiran_3_penghasilan_luar_negeri.tanggal,
				jenisPenghasilanKode: jenis_penghasilan_kredit_pajak_luar_negeri_spt_pph_badan.kode,
				penghasilanNeto: spt_pph_badan_lampiran_3_penghasilan_luar_negeri.penghasilanNeto,
				pphLuarNegeri: spt_pph_badan_lampiran_3_penghasilan_luar_negeri.pphLuarNegeri,
				mataUangKode: mata_uang_spt_pph_badan.kode,
				pphLuarNegeriMataUangAsing: spt_pph_badan_lampiran_3_penghasilan_luar_negeri.pphLuarNegeriMataUangAsing,
				kreditPajakYangDapatDikreditkan:
					spt_pph_badan_lampiran_3_penghasilan_luar_negeri.kreditPajakYangDapatDikreditkan,
				keterangan: spt_pph_badan_lampiran_3_penghasilan_luar_negeri.keterangan
			})
			.from(spt_pph_badan_lampiran_3_penghasilan_luar_negeri)
			.leftJoin(
				negara_spt_pph_badan,
				eq(spt_pph_badan_lampiran_3_penghasilan_luar_negeri.negaraId, negara_spt_pph_badan.id)
			)
			.leftJoin(
				jenis_penghasilan_kredit_pajak_luar_negeri_spt_pph_badan,
				eq(
					spt_pph_badan_lampiran_3_penghasilan_luar_negeri.jenisPenghasilanId,
					jenis_penghasilan_kredit_pajak_luar_negeri_spt_pph_badan.id
				)
			)
			.leftJoin(
				mata_uang_spt_pph_badan,
				eq(spt_pph_badan_lampiran_3_penghasilan_luar_negeri.mataUangId, mata_uang_spt_pph_badan.id)
			)
			.where(eq(spt_pph_badan_lampiran_3_penghasilan_luar_negeri.sptPphBadanId, sptPphBadanId))
			.orderBy(asc(spt_pph_badan_lampiran_3_penghasilan_luar_negeri.nomorUrut)),
		db
			.select({
				id: spt_pph_badan_lampiran_3_pph_dipotong.id,
				namaPemotongPemungut: spt_pph_badan_lampiran_3_pph_dipotong.namaPemotongPemungut,
				npwp: spt_pph_badan_lampiran_3_pph_dipotong.npwpPemotongPemungut,
				jenisPajakKode: jenis_pajak_dipotong_dipungut_spt_pph_badan.kode,
				dpp: spt_pph_badan_lampiran_3_pph_dipotong.dpp,
				pph: spt_pph_badan_lampiran_3_pph_dipotong.pph,
				nomorBukti: spt_pph_badan_lampiran_3_pph_dipotong.nomorBukti,
				tanggalBukti: spt_pph_badan_lampiran_3_pph_dipotong.tanggalBukti
			})
			.from(spt_pph_badan_lampiran_3_pph_dipotong)
			.leftJoin(
				jenis_pajak_dipotong_dipungut_spt_pph_badan,
				eq(spt_pph_badan_lampiran_3_pph_dipotong.jenisPajakId, jenis_pajak_dipotong_dipungut_spt_pph_badan.id)
			)
			.where(eq(spt_pph_badan_lampiran_3_pph_dipotong.sptPphBadanId, sptPphBadanId))
			.orderBy(asc(spt_pph_badan_lampiran_3_pph_dipotong.nomorUrut))
	]);

	return {
		penghasilanLuarNegeri: penghasilanLuarNegeri.map((row) => ({
			...row,
			negaraKode: row.negaraKode ?? '',
			jenisPenghasilanKode: row.jenisPenghasilanKode ?? '',
			mataUangKode: row.mataUangKode ?? ''
		})),
		pengembalianPenguranganPphLuarNegeriTahunSebelumnya,
		pphDipotong: pphDipotong.map((row) => ({ ...row, jenisPajakKode: row.jenisPajakKode ?? '' }))
	};
}
