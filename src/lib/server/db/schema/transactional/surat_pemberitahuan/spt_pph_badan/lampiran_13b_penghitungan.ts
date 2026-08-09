import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { spt_pph_badan } from './spt_pph_badan';

export const spt_pph_badan_lampiran_13b_d_penghitungan = sqliteTable(
	'spt_pph_badan_lampiran_13b_d_penghitungan',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		sptPphBadanId: text('spt_pph_badan_id')
			.notNull()
			.references(() => spt_pph_badan.id, { onDelete: 'cascade' }),
		termanfaatkanTahunSebelumnya: integer('termanfaatkan_tahun_sebelumnya').notNull().default(0)
	},
	(t) => [uniqueIndex('spt_pph_badan_lampiran_13b_d_penghitungan_spt_unique').on(t.sptPphBadanId)]
);
