import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { kode_item_transaksi_faktur } from '../../references/transaksi_faktur/kode_item_transaksi_faktur';
import { satuan_ukur_transaksi_faktur } from '../../references/transaksi_faktur/satuan_ukur_transaksi_faktur';
import { faktur_pajak } from '../faktur/faktur_pajak';

export const transaksi_faktur_pajak = sqliteTable('transaksi_faktur_pajak', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),

	fakturPajakId: text('faktur_pajak_id')
		.notNull()
		.references(() => faktur_pajak.id, { onDelete: 'cascade' }),
	nama: text('nama').notNull(),
	kodeItemId: text('kode_item_id')
		.notNull()
		.references(() => kode_item_transaksi_faktur.id),
	satuanUkurId: text('satuan_ukur_id')
		.notNull()
		.references(() => satuan_ukur_transaksi_faktur.id),

	kuantitas: integer('kuantitas').notNull().default(0),
	hargaSatuan: integer('harga_satuan').notNull().default(0),
	hargaPotongan: integer('harga_potongan').notNull().default(0),
	dppNilaiLain: integer('dpp_nilai_lain').notNull().default(0),
	tarifPpn: integer('tarif_ppn').notNull().default(12),
	tarifPpnBm: integer('tarif_ppnbm').notNull().default(0)
});
