import { db } from '$lib/server/db';
import {
	bentuk_hubungan_istimewa_spt_pph_badan,
	jenis_transaksi_hubungan_istimewa_spt_pph_badan,
	metode_penentuan_harga_transfer_spt_pph_badan,
	negara_spt_pph_badan,
	spt_pph_badan_lampiran_10a_transaksi
} from '$lib/server/db/schema';
import { asc, eq } from 'drizzle-orm';

export async function getLampiranL10A(sptPphBadanId: string) {
	const rows = await db
		.select({
			id: spt_pph_badan_lampiran_10a_transaksi.id,
			nama: spt_pph_badan_lampiran_10a_transaksi.nama,
			npwpTin: spt_pph_badan_lampiran_10a_transaksi.npwpTin,
			negaraKode: negara_spt_pph_badan.kode,
			bentukHubunganKode: bentuk_hubungan_istimewa_spt_pph_badan.kode,
			kegiatanUsaha: spt_pph_badan_lampiran_10a_transaksi.kegiatanUsaha,
			jenisTransaksiKode: jenis_transaksi_hubungan_istimewa_spt_pph_badan.kode,
			nilaiTransaksi: spt_pph_badan_lampiran_10a_transaksi.nilaiTransaksi,
			metodePenentuanHargaTransferKode: metode_penentuan_harga_transfer_spt_pph_badan.kode,
			alasanPenggunaanMetode: spt_pph_badan_lampiran_10a_transaksi.alasanPenggunaanMetode
		})
		.from(spt_pph_badan_lampiran_10a_transaksi)
		.leftJoin(negara_spt_pph_badan, eq(spt_pph_badan_lampiran_10a_transaksi.negaraId, negara_spt_pph_badan.id))
		.leftJoin(
			bentuk_hubungan_istimewa_spt_pph_badan,
			eq(spt_pph_badan_lampiran_10a_transaksi.bentukHubunganId, bentuk_hubungan_istimewa_spt_pph_badan.id)
		)
		.leftJoin(
			jenis_transaksi_hubungan_istimewa_spt_pph_badan,
			eq(spt_pph_badan_lampiran_10a_transaksi.jenisTransaksiId, jenis_transaksi_hubungan_istimewa_spt_pph_badan.id)
		)
		.leftJoin(
			metode_penentuan_harga_transfer_spt_pph_badan,
			eq(
				spt_pph_badan_lampiran_10a_transaksi.metodePenentuanHargaTransferId,
				metode_penentuan_harga_transfer_spt_pph_badan.id
			)
		)
		.where(eq(spt_pph_badan_lampiran_10a_transaksi.sptPphBadanId, sptPphBadanId))
		.orderBy(asc(spt_pph_badan_lampiran_10a_transaksi.nomorUrut));

	return rows.map((row) => ({
		...row,
		negaraKode: row.negaraKode ?? '',
		bentukHubunganKode: row.bentukHubunganKode ?? '',
		jenisTransaksiKode: row.jenisTransaksiKode ?? '',
		metodePenentuanHargaTransferKode: row.metodePenentuanHargaTransferKode ?? ''
	}));
}
