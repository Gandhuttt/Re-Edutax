import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { spt_pph_orang_pribadi } from './spt_pph_orang_pribadi';

// L-4, Bagian A: PENGHITUNGAN ANGSURAN PPh PASAL 25 TAHUN PAJAK BERIKUTNYA.
// Gated on Induk 13b = Ya (h13bPerhitunganTersendiri), see L4.md. Flat,
// one-row-per-SPT scalar form, same shape as L-3B's TKU registry row: no
// Tambah/Hapus, no grid.
//
// Confirmed 2026-08-18 against the live form with real numbers (see L4.md's
// "Measured test cases"): five of the eleven Section A fields are DERIVED,
// not manual input — Jumlah penghasilan neto, Penghasilan Kena Pajak, Pajak
// Terutang, PPh yang harus dibayar and Angsuran PPh Pasal 25 all compute
// live client-side from the six columns below, via hitungLampiranL4 in
// ../../../../../../../routes/.../Induk/hitungPphOrangPribadi.ts (reused,
// not reimplemented, since the bracket math is shared with Induk). Only the
// true manual inputs are persisted here.
//
// Bagian B: PENGHITUNGAN PPh TERUTANG WAJIB PAJAK DAN SUAMI/ISTRI. Gated on
// Induk row 7 (a7StatusKewajibanSuamiIstri) being 'ph' or 'mt' — a different
// gate from Bagian A's, which is Induk 13b. Confirmed 2026-08-18 against the
// live form with two real test cases (see L4.md's "Section B fields, in
// order" and "Measured test cases"). Only the true manual inputs live here:
// the gabungan (combined) figures — neto gabungan, PKP gabungan, PPh
// terutang gabungan, and the two proportional splits — are all DERIVED,
// computed client-side via hitungLampiranL4SectionB, and are never persisted.
// The WP-column "Penghasilan Neto" and "...setelah dikurangi..." cells are
// also not stored here: they mirror Induk row 4 directly (threaded in as a
// prop), matching how other cross-lampiran read-only figures work in this
// codebase.
export const spt_pph_orang_pribadi_lampiran_4 = sqliteTable(
	'spt_pph_orang_pribadi_lampiran_4',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		sptPphOrangPribadiId: text('spt_pph_orang_pribadi_id')
			.notNull()
			.references(() => spt_pph_orang_pribadi.id, { onDelete: 'cascade' })
			.unique(),
		penghasilanNeto: integer('penghasilan_neto').notNull().default(0),
		kompensasiKerugian: integer('kompensasi_kerugian').notNull().default(0),
		zakatSumbangan: integer('zakat_sumbangan').notNull().default(0),
		// Same PTKP picklist as Induk row 5 (c5PtkpStatus), stored as plain text
		// since there is no reference table for it, matching the Induk column.
		ptkpStatus: text('ptkp_status'),
		pengurangPphTerutang: integer('pengurang_pph_terutang').notNull().default(0),
		kreditPajak: integer('kredit_pajak').notNull().default(0),
		// Bagian B manual inputs below. Penghasilan Bruto (both columns) is
		// confirmed disconnected from every computation on the live form
		// (tried twice with real numbers, nothing downstream moved), but is
		// still captured since Coretax itself keeps it as a field.
		brutoWp: integer('bruto_wp').notNull().default(0),
		brutoSuamiIstri: integer('bruto_suami_istri').notNull().default(0),
		netoSuamiIstri: integer('neto_suami_istri').notNull().default(0),
		setelahDikurangiSuamiIstri: integer('setelah_dikurangi_suami_istri').notNull().default(0),
		// Same PTKP table as Induk row 5 / Bagian A's ptkpStatus, but a separate
		// column since it is a distinct "gabungan" selection on the live form.
		ptkpGabunganStatus: text('ptkp_gabungan_status'),
		// The live form auto-fills this from a DJP spousal NPWP lookup we have
		// no equivalent of, so it is a plain manual input here.
		namaSuamiIstri: text('nama_suami_istri')
	}
);
