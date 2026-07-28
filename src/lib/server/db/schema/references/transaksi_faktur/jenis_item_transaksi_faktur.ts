import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const jenis_item_transaksi_faktur = sqliteTable(
	'jenis_item_transaksi_faktur',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),

		kode: text('kode').notNull(),
		nama: text('nama').notNull(),
		aktif: integer('aktif', { mode: 'boolean' }).notNull().default(true)
	},
	(t) => [uniqueIndex('jenis_item_transaksi_faktur_kode_unique').on(t.kode)]
);
