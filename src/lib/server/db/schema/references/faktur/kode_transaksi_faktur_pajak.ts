import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const kode_transaksi_faktur_pajak = sqliteTable(
	'kode_transaksi_faktur_pajak',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),

		kode: integer('kode').notNull(),
		nama: text('nama').notNull(),
		deskripsi: text('deskripsi'),
		aktif: integer('aktif', { mode: 'boolean' }).notNull().default(true)
	},
	(t) => [uniqueIndex('kode_transaksi_faktur_pajak_kode_unique').on(t.kode)]
);
