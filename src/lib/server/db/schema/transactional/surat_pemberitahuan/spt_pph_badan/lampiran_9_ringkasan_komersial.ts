import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { spt_pph_badan } from './spt_pph_badan';

export const spt_pph_badan_lampiran_9_ringkasan_komersial = sqliteTable(
	'spt_pph_badan_lampiran_9_ringkasan_komersial',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		sptPphBadanId: text('spt_pph_badan_id')
			.notNull()
			.references(() => spt_pph_badan.id, { onDelete: 'cascade' }),
		jumlahPenyusutanKomersialA: integer('jumlah_penyusutan_komersial_a').notNull().default(0),
		jumlahPenyusutanKomersialB: integer('jumlah_penyusutan_komersial_b').notNull().default(0),
		jumlahAmortisasiKomersialC: integer('jumlah_amortisasi_komersial_c').notNull().default(0)
	},
	(t) => [uniqueIndex('spt_pph_badan_lampiran_9_ringkasan_komersial_spt_unique').on(t.sptPphBadanId)]
);
