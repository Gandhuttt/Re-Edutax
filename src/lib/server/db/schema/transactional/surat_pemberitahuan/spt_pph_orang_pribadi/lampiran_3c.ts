import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { spt_pph_orang_pribadi } from './spt_pph_orang_pribadi';

// L-3C, DAFTAR PENYUSUTAN DAN AMORTISASI FISKAL.
//
// Read from the Coretax bundle, not from the UI: the lampiran was never
// reachable on the captured account. See
// docs/ui-reference/coretax/spt-1770-lampiran/L3C-L3D.md.
//
// Coretax renders three sections (HARTA BERWUJUD, BANGUNAN, HARTA TIDAK
// BERWUJUD) that are really TWELVE separate grids, one per sub-group, each an
// instance of the same component with a different `tableIndex` input and its own
// GridId of {ReturnSheetRecordId, TableIndex, PeriodYear}. The sub-group is
// therefore structural, not a field the taxpayer picks -- they choose it by
// choosing which grid to add a row to. We store all twelve in one table keyed by
// the same tableIndex rather than twelve tables, which keeps the shape that
// Coretax's own GridId implies.
//
//   1-5   HARTA BERWUJUD        KELOMPOK 1, 2, 3, 4, KELOMPOK LAINNYA
//   6-7   BANGUNAN              PERMANEN, TIDAK PERMANEN
//   8-12  HARTA TIDAK BERWUJUD  KELOMPOK 1, 2, 3, 4, KELOMPOK LAINNYA
//
// The split matches Coretax's own totals: TotalFiscalDepreciationGrid1..7 covers
// the tangible and building sections, TotalFiscalAmortizationGrid1..5 the
// intangible one.
export const spt_pph_orang_pribadi_lampiran_3c_baris = sqliteTable(
	'spt_pph_orang_pribadi_lampiran_3c_baris',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		sptPphOrangPribadiId: text('spt_pph_orang_pribadi_id')
			.notNull()
			.references(() => spt_pph_orang_pribadi.id, { onDelete: 'cascade' }),
		// 1-12, the sub-grid this row belongs to. Coretax's TableIndex.
		tableIndex: integer('table_index').notNull(),
		nomorUrut: integer('nomor_urut').notNull(),
		// Coretax's AssetCode: disabled, and set by onAssetTypeChange from the
		// chosen jenisHarta, exactly like the Kode fields on the other lampiran.
		kodeHarta: text('kode_harta').notNull().default(''),
		jenisHarta: text('jenis_harta').notNull().default(''),
		// Coretax's MonthYearAcquisition, entered as month + year only ("mm yyyy").
		bulanPerolehan: integer('bulan_perolehan').notNull().default(0),
		tahunPerolehan: integer('tahun_perolehan').notNull().default(0),
		hargaPerolehan: integer('harga_perolehan').notNull().default(0),
		nilaiSisaBukuFiskal: integer('nilai_sisa_buku_fiskal').notNull().default(0),
		metodeKomersial: text('metode_komersial').notNull().default(''),
		metodeFiskal: text('metode_fiskal').notNull().default(''),
		// Coretax's FiscalValueThisYear. The only per-row amount that feeds a total;
		// there is deliberately no per-row commercial amount, see below.
		penyusutanFiskalTahunIni: integer('penyusutan_fiskal_tahun_ini').notNull().default(0),
		keterangan: text('keterangan').notNull().default('')
	}
);

// The two commercial totals are form-level fields on L-3C, not per-row columns:
// Coretax declares TotalCommercialDepreciation and
// TotalCommercialAmortizationIntangible as plain editable controls defaulting to
// 0, while the fiscal totals and both SELISIH figures are disabled and derived.
// One row per SPT.
//
// Nothing here feeds an Induk figure -- Coretax only persists and validates
// L3CForm, never patching a valueXX from it.
export const spt_pph_orang_pribadi_lampiran_3c = sqliteTable(
	'spt_pph_orang_pribadi_lampiran_3c',
	{
		sptPphOrangPribadiId: text('spt_pph_orang_pribadi_id')
			.primaryKey()
			.references(() => spt_pph_orang_pribadi.id, { onDelete: 'cascade' }),
		totalPenyusutanKomersial: integer('total_penyusutan_komersial').notNull().default(0),
		totalAmortisasiKomersial: integer('total_amortisasi_komersial').notNull().default(0)
	}
);
