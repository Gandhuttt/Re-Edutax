import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// L-3A A.1's KODE PENYESUAIAN FISKAL multi-select. Own copy rather than a
// reference into kode_koreksi_fiskal_spt_pph_badan, for the same reason as
// lampiran_3a_akun: the fifteen codes happen to be identical to Badan's today,
// but the two domains stay independently editable.
export const spt_pph_orang_pribadi_kode_koreksi_fiskal = sqliteTable(
	'spt_pph_orang_pribadi_kode_koreksi_fiskal',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		kode: text('kode').notNull().unique(),
		nama: text('nama').notNull(),
		jenis: text('jenis', { enum: ['positif', 'negatif'] }).notNull(),
		aktif: integer('aktif', { mode: 'boolean' }).notNull().default(true)
	}
);
