import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { spt_ppn } from './spt_ppn';

// Lampiran C, Pemungutan PPN oleh Pemungut PPN (kode transaksi 2/3) behind
// I.A.6 (as seller) and II.D (as buyer). One row per faktur_pajak, carrying
// both counterparties since either side of the transaction may be the one
// filing this SPT. Snapshotted at "Posting SPT" time by
// computePostedSptPpnLampiran.server.ts -- never edited by hand.
export const spt_ppn_lampiran_c = sqliteTable('spt_ppn_lampiran_c', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	sptPpnId: text('spt_ppn_id')
		.notNull()
		.references(() => spt_ppn.id, { onDelete: 'cascade' }),
	nomorUrut: integer('nomor_urut').notNull(),

	fakturPajakId: text('faktur_pajak_id').notNull(),
	npwpPenjual: text('npwp_penjual').notNull(),
	namaPenjual: text('nama_penjual'),
	npwpPembeli: text('npwp_pembeli').notNull(),
	namaPembeli: text('nama_pembeli'),
	nomorFaktur: text('nomor_faktur').notNull(),
	tanggalFaktur: text('tanggal_faktur').notNull(),
	// 2 = Instansi Pemerintah, 3 = Selain Instansi Pemerintah. Label derived at
	// render time from kode_transaksi_faktur_pajak, not duplicated here.
	kodeTransaksi: integer('kode_transaksi').notNull(),

	hargaJual: integer('harga_jual').notNull().default(0),
	dppNilaiLain: integer('dpp_nilai_lain').notNull().default(0),
	ppn: integer('ppn').notNull().default(0),
	ppnbm: integer('ppnbm').notNull().default(0)
});
