import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

// One table for every SPT 1770 lampiran dropdown, keyed by `daftar` (which list),
// rather than 20 separate reference tables.
//
// That works here because our lampiran reference lists only need descriptions:
// we deliberately keep KODE as a plain text input the peserta types, instead of
// copying Coretax's derive-Kode-from-Deskripsi behaviour, which would require
// every list to carry code/description pairs plus a per-sub-table derivation
// rule. See the pph-op-kode-plain-text-input decision and
// docs/ui-reference/coretax/spt-1770-lampiran/MODALS.md.
//
// `urutan` preserves DJP's own ordering, which is deliberately not sorted or
// deduplicated: the negara list genuinely contains Angola and Jersey twice and
// carries non-country entries such as "Tanpa kewarganegaraan". Silently tidying
// it would diverge from the source.
export const referensi_lampiran_spt_pph_orang_pribadi = sqliteTable(
	'referensi_lampiran_spt_pph_orang_pribadi',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		daftar: text('daftar').notNull(),
		urutan: integer('urutan').notNull(),
		nama: text('nama').notNull(),
		aktif: integer('aktif', { mode: 'boolean' }).notNull().default(true)
	},
	(t) => [uniqueIndex('referensi_lampiran_spt_pph_orang_pribadi_unique').on(t.daftar, t.urutan)]
);
