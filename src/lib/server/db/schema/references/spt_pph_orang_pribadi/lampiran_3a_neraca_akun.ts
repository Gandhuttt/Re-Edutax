import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// L-3A A.2, LAPORAN POSISI KEUANGAN (NERACA), one fixed template per sektor,
// transcribed from docs/ui-reference/coretax/spt-1770-lampiran/L3A.md.
//
// Its own table rather than a reference into
// spt_pph_badan_lampiran_1_neraca_akun, for the same reason the A.1 chart is
// (see lampiran_3a_akun.ts): the two domains must stay independently editable
// even though the account codes overlap heavily.
//
// The chart varies by sektor only for Industri — Dagang and Jasa are identical
// apart from a casing drift on 1499, normalised at seed time — but the sektor
// column carries all three anyway, matching how A.1 is keyed so that a row from
// an abandoned sektor can never be mistaken for a row of the current one.
//
// Same tree rollup as Badan L1 Section B: `parentKode` and `sign` fold a row
// into its sum-row parent, and computeNeracaRows walks it. Only 1700, 2999,
// 3299 and 3300 are sum rows; the live form has no 1500/1699 subtotals here,
// unlike the badan neraca.
export const spt_pph_orang_pribadi_lampiran_3a_neraca_akun = sqliteTable(
	'spt_pph_orang_pribadi_lampiran_3a_neraca_akun',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		sektor: text('sektor', { enum: ['dagang', 'jasa', 'industri'] }).notNull(),
		nomorUrut: integer('nomor_urut').notNull(),
		kode: text('kode'),
		namaAkun: text('nama_akun').notNull(),
		rowType: text('row_type', { enum: ['header', 'data', 'sum'] }).notNull(),
		section: text('section', { enum: ['aset', 'liabilitas_ekuitas'] }).notNull(),
		parentKode: text('parent_kode'),
		sign: integer('sign')
	},
	(t) => [index('spt_pph_orang_pribadi_lampiran_3a_neraca_akun_sektor_kode_idx').on(t.sektor, t.kode)]
);
