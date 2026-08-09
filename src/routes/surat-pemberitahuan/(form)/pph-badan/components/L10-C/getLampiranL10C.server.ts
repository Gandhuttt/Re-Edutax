import { db } from '$lib/server/db';
import {
	jenis_transaksi_hubungan_istimewa_spt_pph_badan,
	negara_spt_pph_badan,
	spt_pph_badan_lampiran_10c_pernyataan,
	spt_pph_badan_lampiran_10c_transaksi
} from '$lib/server/db/schema';
import { asc, eq } from 'drizzle-orm';

export async function getLampiranL10C(sptPphBadanId: string) {
	const [rows, [pernyataan]] = await Promise.all([
		db
			.select({
				id: spt_pph_badan_lampiran_10c_transaksi.id,
				namaMitraTransaksi: spt_pph_badan_lampiran_10c_transaksi.namaMitraTransaksi,
				jenisTransaksiKode: jenis_transaksi_hubungan_istimewa_spt_pph_badan.kode,
				negaraKode: negara_spt_pph_badan.kode,
				nilaiTransaksi: spt_pph_badan_lampiran_10c_transaksi.nilaiTransaksi
			})
			.from(spt_pph_badan_lampiran_10c_transaksi)
			.leftJoin(
				jenis_transaksi_hubungan_istimewa_spt_pph_badan,
				eq(spt_pph_badan_lampiran_10c_transaksi.jenisTransaksiId, jenis_transaksi_hubungan_istimewa_spt_pph_badan.id)
			)
			.leftJoin(negara_spt_pph_badan, eq(spt_pph_badan_lampiran_10c_transaksi.negaraId, negara_spt_pph_badan.id))
			.where(eq(spt_pph_badan_lampiran_10c_transaksi.sptPphBadanId, sptPphBadanId))
			.orderBy(asc(spt_pph_badan_lampiran_10c_transaksi.nomorUrut)),
		db
			.select({ ditentukanPrinsip: spt_pph_badan_lampiran_10c_pernyataan.ditentukanPrinsip })
			.from(spt_pph_badan_lampiran_10c_pernyataan)
			.where(eq(spt_pph_badan_lampiran_10c_pernyataan.sptPphBadanId, sptPphBadanId))
	]);

	return {
		rows: rows.map((row) => ({
			...row,
			jenisTransaksiKode: row.jenisTransaksiKode ?? '',
			negaraKode: row.negaraKode ?? ''
		})),
		ditentukanPrinsip: pernyataan?.ditentukanPrinsip ?? null
	};
}
