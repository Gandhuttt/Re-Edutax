import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { spt_pph_badan } from './spt_pph_badan';

export const spt_pph_badan_lampiran_7_kompensasi_kerugian = sqliteTable(
	'spt_pph_badan_lampiran_7_kompensasi_kerugian',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		sptPphBadanId: text('spt_pph_badan_id')
			.notNull()
			.references(() => spt_pph_badan.id, { onDelete: 'cascade' }),
		tahunPajak: integer('tahun_pajak').notNull(),
		labaRugiNetoFiskal: integer('laba_rugi_neto_fiskal').notNull().default(0),
		kompensasiYMin4: integer('kompensasi_y_min_4').notNull().default(0),
		kompensasiYMin3: integer('kompensasi_y_min_3').notNull().default(0),
		kompensasiYMin2: integer('kompensasi_y_min_2').notNull().default(0),
		kompensasiYMin1: integer('kompensasi_y_min_1').notNull().default(0),
		kompensasiTahunIni: integer('kompensasi_tahun_ini').notNull().default(0),
		kompensasiYPlus1: integer('kompensasi_y_plus_1').notNull().default(0)
	},
	(t) => [
		uniqueIndex('spt_pph_badan_lampiran_7_kompensasi_kerugian_unique').on(t.sptPphBadanId, t.tahunPajak)
	]
);
