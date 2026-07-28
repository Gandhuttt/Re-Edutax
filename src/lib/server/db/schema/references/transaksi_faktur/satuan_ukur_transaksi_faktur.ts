import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { jenis_item_transaksi_faktur } from './jenis_item_transaksi_faktur';

export const satuan_ukur_transaksi_faktur = sqliteTable(
	'satuan_ukur_transaksi_faktur',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),

		jenisItemId: text('jenis_item_id').references(() => jenis_item_transaksi_faktur.id),
		kode: text('kode').notNull(),
		nama: text('nama').notNull(),
		aktif: integer('aktif', { mode: 'boolean' }).notNull().default(true)
	},
	(t) => [uniqueIndex('satuan_ukur_transaksi_faktur_kode_unique').on(t.kode)]
);
