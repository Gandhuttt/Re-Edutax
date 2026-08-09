import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const metode_penyusutan_spt_pph_badan = sqliteTable(
	'metode_penyusutan_spt_pph_badan',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		kode: text('kode').notNull(),
		nama: text('nama').notNull(),
		jenis: text('jenis', { enum: ['komersial', 'fiskal'] }).notNull(),
		nomorUrut: integer('nomor_urut').notNull().default(0),
		aktif: integer('aktif', { mode: 'boolean' }).notNull().default(true)
	},
	(t) => [uniqueIndex('metode_penyusutan_spt_pph_badan_kode_unique').on(t.kode)]
);
