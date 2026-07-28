import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const opini_auditor_spt_pph_badan = sqliteTable(
	'opini_auditor_spt_pph_badan',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		kode: text('kode').notNull(),
		nama: text('nama').notNull(),
		aktif: integer('aktif', { mode: 'boolean' }).notNull().default(true)
	},
	(t) => [uniqueIndex('opini_auditor_spt_pph_badan_kode_unique').on(t.kode)]
);
