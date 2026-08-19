import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

// One table for every SPT 1770 lampiran dropdown, keyed by `daftar` (which list),
// rather than 20 separate reference tables.
//
// `kode` is DJP's own code for the option, taken from the reference-data endpoint
// (docs/coretax-api/reference-data-1770.json). Coretax fills its disabled KODE
// cells by deriving them from the selected Deskripsi, and storing the pair here
// lets us do the same instead of leaving KODE permanently blank. It is nullable
// because only the seven lists we have fetched carry codes so far; the remaining
// thirteen have no code source yet and render KODE as before.
//
// `urutan` preserves DJP's own ordering, which is deliberately not sorted or
// deduplicated: the negara list genuinely contains Angola and Jersey twice and
// carries non-country entries such as "Tanpa kewarganegaraan". Silently tidying
// it would diverge from the source. Note that the reference-data endpoint returns
// its own, different order, so codes are matched to options by description --
// never by position.
export const referensi_lampiran_spt_pph_orang_pribadi = sqliteTable(
	'referensi_lampiran_spt_pph_orang_pribadi',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		daftar: text('daftar').notNull(),
		urutan: integer('urutan').notNull(),
		nama: text('nama').notNull(),
		kode: text('kode'),
		aktif: integer('aktif', { mode: 'boolean' }).notNull().default(true)
	},
	(t) => [uniqueIndex('referensi_lampiran_spt_pph_orang_pribadi_unique').on(t.daftar, t.urutan)]
);
