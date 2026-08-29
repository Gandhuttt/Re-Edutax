import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

// Options for the "Fasilitas Pajak yang Dimiliki oleh Penerima Penghasilan"
// field (SKB/DTP/etc.), and the TaxCertificateCode(s) that
// kode_objek_pajak_pph.parameterData.ItemList entries are keyed to. Matches
// Coretax's EBUPOT_TAX_CERTIFICATE reference-data type -- see
// docs/ui-reference/coretax/ebupot/NOTES.md.
export const fasilitas_pajak_ebupot = sqliteTable(
	'fasilitas_pajak_ebupot',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),

		kode: text('kode').notNull(),
		nama: text('nama').notNull(),
		aktif: integer('aktif', { mode: 'boolean' }).notNull().default(true)
	},
	(t) => [uniqueIndex('fasilitas_pajak_ebupot_kode_unique').on(t.kode)]
);
