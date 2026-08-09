import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const bentuk_hubungan_istimewa_spt_pph_badan = sqliteTable(
	'bentuk_hubungan_istimewa_spt_pph_badan',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		kode: text('kode').notNull(),
		nama: text('nama').notNull(),
		nomorUrut: integer('nomor_urut').notNull().default(0),
		aktif: integer('aktif', { mode: 'boolean' }).notNull().default(true)
	},
	(t) => [uniqueIndex('bentuk_hubungan_istimewa_spt_pph_badan_kode_unique').on(t.kode)]
);
