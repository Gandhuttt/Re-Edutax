import { index, sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// L-3A A.1 chart of accounts, one fixed template per sektor (Dagang, Jasa,
// Industri), transcribed from docs/ui-reference/coretax/spt-1770-lampiran/L3A.md.
//
// Deliberately its own table rather than a reference into
// spt_pph_badan_lampiran_1_akun, even though the row shape and the rollup rules
// (spt_pph_badan_l1_income_expense, spt_pph_badan_l1_fiskal_sign) are identical.
// The two domains stay independent: a future edit to Badan's chart of accounts
// must not silently change what an Orang Pribadi filer sees, and vice versa.
//
// Same tree-rollup shape as Badan L1: `parentKode` and `sign` describe how a
// row folds into its sum-row parent, not the fiscal income/expense sign flip
// (which is derived from the kode prefix at compute time, see
// computeLabaRugiRows in the pph-badan L1 component, reused as-is here since
// it is pure logic with no schema coupling).
export const spt_pph_orang_pribadi_lampiran_3a_akun = sqliteTable(
	'spt_pph_orang_pribadi_lampiran_3a_akun',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		sektor: text('sektor', { enum: ['dagang', 'jasa', 'industri'] }).notNull(),
		nomorUrut: integer('nomor_urut').notNull(),
		kode: text('kode'),
		namaAkun: text('nama_akun').notNull(),
		rowType: text('row_type', { enum: ['header', 'data', 'sum'] }).notNull(),
		classification: text('classification', { enum: ['income', 'expense'] }),
		parentKode: text('parent_kode'),
		sign: integer('sign')
	},
	(t) => [index('spt_pph_orang_pribadi_lampiran_3a_akun_sektor_kode_idx').on(t.sektor, t.kode)]
);
