import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { spt_pph_badan } from './spt_pph_badan';

export const spt_pph_badan_lampiran_10d_dokumen = sqliteTable(
	'spt_pph_badan_lampiran_10d_dokumen',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		sptPphBadanId: text('spt_pph_badan_id')
			.notNull()
			.references(() => spt_pph_badan.id, { onDelete: 'cascade' }),
		dokumenIndukA: integer('dokumen_induk_a', { mode: 'boolean' }),
		dokumenIndukB: integer('dokumen_induk_b', { mode: 'boolean' }),
		dokumenIndukC: integer('dokumen_induk_c', { mode: 'boolean' }),
		dokumenIndukD: integer('dokumen_induk_d', { mode: 'boolean' }),
		dokumenIndukE: integer('dokumen_induk_e', { mode: 'boolean' }),
		dokumenLokalA: integer('dokumen_lokal_a', { mode: 'boolean' }),
		dokumenLokalB: integer('dokumen_lokal_b', { mode: 'boolean' }),
		dokumenLokalC: integer('dokumen_lokal_c', { mode: 'boolean' }),
		dokumenLokalD: integer('dokumen_lokal_d', { mode: 'boolean' }),
		dokumenLokalE: integer('dokumen_lokal_e', { mode: 'boolean' }),
		tanggalDokumenIndukTersedia: text('tanggal_dokumen_induk_tersedia'),
		tanggalDokumenLokalTersedia: text('tanggal_dokumen_lokal_tersedia')
	},
	(t) => [uniqueIndex('spt_pph_badan_lampiran_10d_dokumen_spt_unique').on(t.sptPphBadanId)]
);
