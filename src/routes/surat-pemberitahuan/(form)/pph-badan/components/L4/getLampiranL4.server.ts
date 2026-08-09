import { db } from '$lib/server/db';
import {
	jenis_penghasilan_bukan_objek_pajak_spt_pph_badan,
	objek_pajak_spt_pph_badan,
	spt_pph_badan_lampiran_4_bukan_objek_pajak,
	spt_pph_badan_lampiran_4_pph_final
} from '$lib/server/db/schema';
import { asc, eq } from 'drizzle-orm';

export async function getLampiranL4(sptPphBadanId: string) {
	const [penghasilanFinal, bukanObjekPajak] = await Promise.all([
		db
			.select({
				id: spt_pph_badan_lampiran_4_pph_final.id,
				npwpPemotongPemungutPenyetor: spt_pph_badan_lampiran_4_pph_final.npwpPemotongPemungutPenyetor,
				namaPemotongPemungutPenyetor: spt_pph_badan_lampiran_4_pph_final.namaPemotongPemungutPenyetor,
				objekPajakKode: objek_pajak_spt_pph_badan.kode,
				dasarPengenaanPajak: spt_pph_badan_lampiran_4_pph_final.dasarPengenaanPajak,
				tarif: spt_pph_badan_lampiran_4_pph_final.tarif,
				pphFinalTerutang: spt_pph_badan_lampiran_4_pph_final.pphFinalTerutang,
				nomorBuktiPotong: spt_pph_badan_lampiran_4_pph_final.nomorBuktiPotong,
				tanggalBuktiPotong: spt_pph_badan_lampiran_4_pph_final.tanggalBuktiPotong,
				keterangan: spt_pph_badan_lampiran_4_pph_final.keterangan
			})
			.from(spt_pph_badan_lampiran_4_pph_final)
			.leftJoin(objek_pajak_spt_pph_badan, eq(spt_pph_badan_lampiran_4_pph_final.objekPajakId, objek_pajak_spt_pph_badan.id))
			.where(eq(spt_pph_badan_lampiran_4_pph_final.sptPphBadanId, sptPphBadanId))
			.orderBy(asc(spt_pph_badan_lampiran_4_pph_final.nomorUrut)),
		db
			.select({
				id: spt_pph_badan_lampiran_4_bukan_objek_pajak.id,
				jenisPenghasilanKode: jenis_penghasilan_bukan_objek_pajak_spt_pph_badan.kode,
				sumberPenghasilan: spt_pph_badan_lampiran_4_bukan_objek_pajak.sumberPenghasilan,
				penghasilanBruto: spt_pph_badan_lampiran_4_bukan_objek_pajak.penghasilanBruto,
				keterangan: spt_pph_badan_lampiran_4_bukan_objek_pajak.keterangan
			})
			.from(spt_pph_badan_lampiran_4_bukan_objek_pajak)
			.leftJoin(
				jenis_penghasilan_bukan_objek_pajak_spt_pph_badan,
				eq(
					spt_pph_badan_lampiran_4_bukan_objek_pajak.jenisPenghasilanId,
					jenis_penghasilan_bukan_objek_pajak_spt_pph_badan.id
				)
			)
			.where(eq(spt_pph_badan_lampiran_4_bukan_objek_pajak.sptPphBadanId, sptPphBadanId))
			.orderBy(asc(spt_pph_badan_lampiran_4_bukan_objek_pajak.nomorUrut))
	]);

	return {
		penghasilanFinal: penghasilanFinal.map((row) => ({ ...row, objekPajakKode: row.objekPajakKode ?? '' })),
		bukanObjekPajak: bukanObjekPajak.map((row) => ({ ...row, jenisPenghasilanKode: row.jenisPenghasilanKode ?? '' }))
	};
}
