import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const jenis_transaksi_hubungan_istimewa_spt_pph_badan = sqliteTable(
	'jenis_transaksi_hubungan_istimewa_spt_pph_badan',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		kode: text('kode').notNull(),
		nama: text('nama').notNull(),
		nomorUrut: integer('nomor_urut').notNull().default(0),
		aktif: integer('aktif', { mode: 'boolean' }).notNull().default(true)
	},
	(t) => [uniqueIndex('jenis_transaksi_hubungan_istimewa_spt_pph_badan_kode_unique').on(t.kode)]
);
