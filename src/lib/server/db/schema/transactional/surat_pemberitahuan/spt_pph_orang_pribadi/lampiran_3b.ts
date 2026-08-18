import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { spt_pph_orang_pribadi } from './spt_pph_orang_pribadi';

// L-3B, REKAPITULASI PEREDARAN BRUTO. Gated on Induk 1.b.2 (either "Ya" option)
// or 1.b.3 = Norma; see L3B.md. Section A (PP 55/2022, final 0,5%) is a
// self-contained final-tax computation, verified NOT to feed the Induk chain
// (1.b.5 and row 2 are unaffected). Sections B (OPPT) and C (Norma) are plain
// monthly totals with JUMLAH PPh always 0, their real tax effect lives
// elsewhere (Induk 13c for OPPT; Norma's neto calc is out of reach entirely).
//
// On the live form every section is seeded from a read-only DAFTAR TEMPAT
// KEGIATAN USAHA registry pre-filled by DJP, one row per registered TKU, never
// added or deleted by the user. We have no DJP prefill and only ever observed
// one TKU per taxpayer, so this table holds that single registry row directly,
// user-editable rather than DJP-sourced, matching how Badan's L-5 TKU rows are
// also manually entered rather than prefilled.
export const spt_pph_orang_pribadi_lampiran_3b_tku = sqliteTable(
	'spt_pph_orang_pribadi_lampiran_3b_tku',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		sptPphOrangPribadiId: text('spt_pph_orang_pribadi_id')
			.notNull()
			.references(() => spt_pph_orang_pribadi.id, { onDelete: 'cascade' })
			.unique(),
		nama: text('nama').notNull().default(''),
		alamat: text('alamat').notNull().default(''),
		kelurahan: text('kelurahan').notNull().default(''),
		kecamatan: text('kecamatan').notNull().default(''),
		kabupaten: text('kabupaten').notNull().default(''),
		provinsi: text('provinsi').notNull().default(''),
		// Section C only: the norma classification.
		jenisUsahaPekerjaanBebas: text('jenis_usaha_pekerjaan_bebas').notNull().default(''),
		// NORMA (%), edited in L-3A-4 Bagian A but persisted here because that
		// section is generated from this registry row and Coretax likewise re-keys
		// its Norm by the row identity on every regeneration
		// (addDataL3bTableCToL3A4TableA). No NPPN reference table is involved: the
		// percentage is typed by the taxpayer, validated > 0 and <= 100.
		normaPersen: integer('norma_persen').notNull().default(0)
	}
);

// One row per (section, month). Section A uses disetorSendiri/dipotongPihakLain
// (rows f/g of the doc's a-h chain); B and C leave them at 0, unused.
export const spt_pph_orang_pribadi_lampiran_3b_bulanan = sqliteTable(
	'spt_pph_orang_pribadi_lampiran_3b_bulanan',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		sptPphOrangPribadiId: text('spt_pph_orang_pribadi_id')
			.notNull()
			.references(() => spt_pph_orang_pribadi.id, { onDelete: 'cascade' }),
		seksi: text('seksi', { enum: ['A', 'B', 'C'] }).notNull(),
		bulan: integer('bulan').notNull(),
		peredaranBruto: integer('peredaran_bruto').notNull().default(0),
		disetorSendiri: integer('disetor_sendiri').notNull().default(0),
		dipotongPihakLain: integer('dipotong_pihak_lain').notNull().default(0)
	},
	(t) => [
		uniqueIndex('spt_pph_orang_pribadi_lampiran_3b_bulanan_unique').on(
			t.sptPphOrangPribadiId,
			t.seksi,
			t.bulan
		)
	]
);
