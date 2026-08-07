import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const sektor_usaha_spt_pph_badan = sqliteTable(
	'sektor_usaha_spt_pph_badan',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		kode: text('kode').notNull(),
		nama: text('nama').notNull(),
		lampiran1Kode: text('lampiran_1_kode'),
		aktif: integer('aktif', { mode: 'boolean' }).notNull().default(true)
	},
	(t) => [uniqueIndex('sektor_usaha_spt_pph_badan_kode_unique').on(t.kode)]
);
