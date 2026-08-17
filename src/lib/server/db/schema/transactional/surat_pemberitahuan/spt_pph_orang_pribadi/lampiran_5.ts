import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { spt_pph_orang_pribadi } from './spt_pph_orang_pribadi';

// L-5 Bagian A, PENGHITUNGAN KOMPENSASI KERUGIAN FISKAL.
//
// Same shape as SPT Badan's L7 (spt_pph_badan_lampiran_7_kompensasi_kerugian):
// one row per loss year, with six columns for the year the loss is
// compensated in, named by their offset from the SPT's own tahun pajak
// (Y-4 through Y+1) rather than as absolute years, so the same six columns
// serve every SPT year without renaming.
//
// The row range is wider here than on the Badan side: Coretax shows ten rows
// (tahun pajak and the nine years before it) against the same six fixed
// columns, not one row per column offset. A row outside the six-column window
// has no year of its own to disable; see the "self-year" note on the frontend.
//
// The math is deliberately manual, mirroring the Badan L7 decision recorded in
// spt_pph_badan_l6_l7_status: nothing here is derived or validated against the
// loss amount. Only the kompensasiTahunIni column of each row feeds Induk row 3.
export const spt_pph_orang_pribadi_lampiran_5_kompensasi_kerugian = sqliteTable(
	'spt_pph_orang_pribadi_lampiran_5_kompensasi_kerugian',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		sptPphOrangPribadiId: text('spt_pph_orang_pribadi_id')
			.notNull()
			.references(() => spt_pph_orang_pribadi.id, { onDelete: 'cascade' }),
		// The loss year this row records, an absolute year (unlike the columns).
		tahunPajak: integer('tahun_pajak').notNull(),
		// Accepts negative values: this is the only field on the whole form
		// confirmed to take one, typed with a leading minus.
		labaRugiNetoFiskal: integer('laba_rugi_neto_fiskal').notNull().default(0),
		kompensasiYMin4: integer('kompensasi_y_min_4').notNull().default(0),
		kompensasiYMin3: integer('kompensasi_y_min_3').notNull().default(0),
		kompensasiYMin2: integer('kompensasi_y_min_2').notNull().default(0),
		kompensasiYMin1: integer('kompensasi_y_min_1').notNull().default(0),
		kompensasiTahunIni: integer('kompensasi_tahun_ini').notNull().default(0),
		kompensasiYPlus1: integer('kompensasi_y_plus_1').notNull().default(0)
	},
	(t) => [
		uniqueIndex('spt_pph_orang_pribadi_lampiran_5_kompensasi_unique').on(
			t.sptPphOrangPribadiId,
			t.tahunPajak
		)
	]
);

// L-5 Bagian B, PENGURANG PENGHASILAN NETO. Feeds Induk row 3 together with
// L-5 A's kompensasiTahunIni column: JUMLAH PENGURANG PENGHASILAN NETO is
// their sum.
export const spt_pph_orang_pribadi_lampiran_5_pengurang_neto = sqliteTable(
	'spt_pph_orang_pribadi_lampiran_5_pengurang_neto',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		sptPphOrangPribadiId: text('spt_pph_orang_pribadi_id')
			.notNull()
			.references(() => spt_pph_orang_pribadi.id, { onDelete: 'cascade' }),
		nomorUrut: integer('nomor_urut').notNull(),
		kode: text('kode').notNull().default(''),
		jenisPengurang: text('jenis_pengurang').notNull().default(''),
		jumlah: integer('jumlah').notNull().default(0)
	}
);

// L-5 Bagian C, PENGURANG PPh TERUTANG. Feeds Induk row 8.
export const spt_pph_orang_pribadi_lampiran_5_pengurang_pph = sqliteTable(
	'spt_pph_orang_pribadi_lampiran_5_pengurang_pph',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		sptPphOrangPribadiId: text('spt_pph_orang_pribadi_id')
			.notNull()
			.references(() => spt_pph_orang_pribadi.id, { onDelete: 'cascade' }),
		nomorUrut: integer('nomor_urut').notNull(),
		kode: text('kode').notNull().default(''),
		jenisPengurang: text('jenis_pengurang').notNull().default(''),
		jumlah: integer('jumlah').notNull().default(0)
	}
);
