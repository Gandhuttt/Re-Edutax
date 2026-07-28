import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { spt_pph_badan } from './spt_pph_badan';

export const spt_pph_badan_lampiran_6_komponen = sqliteTable(
	'spt_pph_badan_lampiran_6_komponen',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		sptPphBadanId: text('spt_pph_badan_id')
			.notNull()
			.references(() => spt_pph_badan.id, { onDelete: 'cascade' }),
		kode: text('kode').notNull(),
		nama: text('nama').notNull(),
		nilai: integer('nilai').notNull().default(0),
		keterangan: text('keterangan').notNull().default('')
	},
	(t) => [uniqueIndex('spt_pph_badan_lampiran_6_komponen_unique').on(t.sptPphBadanId, t.kode)]
);
