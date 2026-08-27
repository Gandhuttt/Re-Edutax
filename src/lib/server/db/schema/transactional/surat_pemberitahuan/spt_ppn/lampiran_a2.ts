import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { spt_ppn } from './spt_ppn';

// Lampiran A-2, domestic output invoices (kode transaksi 1/9/10) behind I.A.4.
// One row per faktur_pajak, snapshotted at "Posting SPT" time by
// computePostedSptPpnLampiran.server.ts -- never edited by hand, matching how
// real Coretax auto-populates A-2 from e-Faktur with no manual upload UI.
export const spt_ppn_lampiran_a2 = sqliteTable('spt_ppn_lampiran_a2', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	sptPpnId: text('spt_ppn_id')
		.notNull()
		.references(() => spt_ppn.id, { onDelete: 'cascade' }),
	nomorUrut: integer('nomor_urut').notNull(),

	fakturPajakId: text('faktur_pajak_id').notNull(),
	namaLawanTransaksi: text('nama_lawan_transaksi'),
	npwpLawanTransaksi: text('npwp_lawan_transaksi').notNull(),
	nomorFaktur: text('nomor_faktur').notNull(),
	tanggalFaktur: text('tanggal_faktur').notNull(),
	kodeTransaksi: integer('kode_transaksi').notNull(),

	hargaJual: integer('harga_jual').notNull().default(0),
	dppNilaiLain: integer('dpp_nilai_lain').notNull().default(0),
	ppn: integer('ppn').notNull().default(0),
	ppnbm: integer('ppnbm').notNull().default(0)
});
