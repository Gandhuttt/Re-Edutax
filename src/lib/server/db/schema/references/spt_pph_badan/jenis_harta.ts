import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const jenis_harta_spt_pph_badan = sqliteTable(
	'jenis_harta_spt_pph_badan',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		kode: text('kode').notNull(),
		nama: text('nama').notNull(),
		kelompok: text('kelompok', {
			enum: ['harta_berwujud', 'bangunan', 'harta_tidak_berwujud']
		}).notNull(),
		aktif: integer('aktif', { mode: 'boolean' }).notNull().default(true)
	},
	(t) => [uniqueIndex('jenis_harta_spt_pph_badan_kode_unique').on(t.kode)]
);
