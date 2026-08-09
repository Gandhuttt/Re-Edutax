import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { spt_pph_badan } from './spt_pph_badan';

export const spt_pph_badan_lampiran_13b_b_biaya = sqliteTable(
	'spt_pph_badan_lampiran_13b_b_biaya',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		sptPphBadanId: text('spt_pph_badan_id')
			.notNull()
			.references(() => spt_pph_badan.id, { onDelete: 'cascade' }),
		kode: text('kode').notNull(),
		nama: text('nama').notNull(),
		nilai: integer('nilai').notNull().default(0)
	},
	(t) => [uniqueIndex('spt_pph_badan_lampiran_13b_b_biaya_unique').on(t.sptPphBadanId, t.kode)]
);
