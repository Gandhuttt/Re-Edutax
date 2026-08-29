import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

// Options for the "Jenis Dokumen" field in every eBupot form's Dokumen
// Referensi section. Matches Coretax's EBUPOT_DOCUMENT_TYPE reference-data
// type -- see docs/ui-reference/coretax/ebupot/NOTES.md.
export const jenis_dokumen_ebupot = sqliteTable(
	'jenis_dokumen_ebupot',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),

		kode: text('kode').notNull(),
		nama: text('nama').notNull(),
		aktif: integer('aktif', { mode: 'boolean' }).notNull().default(true)
	},
	(t) => [uniqueIndex('jenis_dokumen_ebupot_kode_unique').on(t.kode)]
);
