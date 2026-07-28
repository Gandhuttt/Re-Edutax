import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { jenis_item_transaksi_faktur } from './jenis_item_transaksi_faktur';

export const kode_item_transaksi_faktur = sqliteTable(
	'kode_item_transaksi_faktur',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),

		jenisItemId: text('jenis_item_id')
			.notNull()
			.references(() => jenis_item_transaksi_faktur.id),
		kode: text('kode').notNull(),
		namaIndonesia: text('nama_indonesia').notNull(),
		namaInggris: text('nama_inggris'),
		aktif: integer('aktif', { mode: 'boolean' }).notNull().default(true)
	},
	(t) => [uniqueIndex('kode_item_transaksi_faktur_kode_unique').on(t.kode)]
);
