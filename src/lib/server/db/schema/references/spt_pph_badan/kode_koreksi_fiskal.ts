import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const kode_koreksi_fiskal_spt_pph_badan = sqliteTable(
	'kode_koreksi_fiskal_spt_pph_badan',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		kode: text('kode').notNull(),
		nama: text('nama').notNull(),
		jenis: text('jenis', { enum: ['positif', 'negatif'] }).notNull(),
		aktif: integer('aktif', { mode: 'boolean' }).notNull().default(true)
	},
	(t) => [uniqueIndex('kode_koreksi_fiskal_spt_pph_badan_kode_unique').on(t.kode)]
);
