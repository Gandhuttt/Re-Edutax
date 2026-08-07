import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { spt_pph_badan_lampiran_1_neraca_akun } from '../../../references/spt_pph_badan/lampiran_1_neraca_akun';
import { spt_pph_badan } from './spt_pph_badan';

export const spt_pph_badan_lampiran_1_neraca = sqliteTable(
	'spt_pph_badan_lampiran_1_neraca',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		sptPphBadanId: text('spt_pph_badan_id')
			.notNull()
			.references(() => spt_pph_badan.id, { onDelete: 'cascade' }),
		akunId: text('akun_id')
			.notNull()
			.references(() => spt_pph_badan_lampiran_1_neraca_akun.id),
		nilai: integer('nilai').notNull().default(0)
	},
	(t) => [uniqueIndex('spt_pph_badan_lampiran_1_neraca_spt_akun_unique').on(t.sptPphBadanId, t.akunId)]
);
