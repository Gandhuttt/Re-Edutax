import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { fasilitas_pajak_ebupot } from '../../references/ebupot/fasilitas_pajak_ebupot';
import { kode_objek_pajak_pph } from '../../references/ebupot/kode_objek_pajak_pph';
import { wajib_pajak } from '../wajib_pajak/wajib_pajak';
import { buktiPotongBpuStatusValues } from './bukti_potong_bpu';
import { ptkpEbupotValues } from '../../../../../helpers/ptkp-ebupot';

// eBupot MP ("Bukti Pemotongan Bulanan Pegawai Tetap") -- the running
// monthly PPh Pasal 21 withholding slip for permanent employees, computed
// via TER (Tarif Efektif Rata-rata, PMK 168/2023). See
// docs/ui-reference/coretax/ebupot/NOTES.md "MP" for the live-verified
// field list this mirrors.
//
// A single Masa Pajak like BP21/BPU (not a period range like BPA1/BPA2 --
// MP is the per-month slip those annual recaps would cross-reference
// against, if this app had that history feature). Reuses BP21's 12-value
// PTKP enum (K/TK/HB 0-3) since MP's own object codes carry TaxExemptionStatus
// bands keyed to the exact same codes, and reuses resolveBp21's TER branch
// directly (see updateMp.remote.ts) rather than a separate resolver --
// MP's ItemList shape (TER bands + one manual-facility entry, no cumulative
// bracket) is a strict subset of what resolveBp21 already handles. No DPP%
// field shown on the live form (same as BPU) -- dppPercent from the
// resolver is used internally to compute pajakPenghasilan but not stored.
export const bukti_potong_mp = sqliteTable('bukti_potong_mp', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),

	npwpPemotong: text('npwp_pemotong')
		.notNull()
		.references(() => wajib_pajak.npwp),

	masaPajak: integer('masa_pajak')
		.notNull()
		.$defaultFn(() => new Date().getMonth() + 1),
	tahun: integer('tahun')
		.notNull()
		.$defaultFn(() => new Date().getFullYear()),
	status: text('status', { enum: buktiPotongBpuStatusValues }).notNull().default('NORMAL'),

	pegawaiAsing: integer('pegawai_asing', { mode: 'boolean' }).notNull().default(false),
	nomorIdentitasWp: text('nomor_identitas_wp').notNull().default(''),
	nama: text('nama').notNull().default(''),
	statusPtkp: text('status_ptkp', { enum: ptkpEbupotValues }),
	jabatan: text('jabatan').notNull().default(''),

	fasilitasPajakId: text('fasilitas_pajak_id').references(() => fasilitas_pajak_ebupot.id),
	kodeObjekPajakId: text('kode_objek_pajak_id').references(() => kode_objek_pajak_pph.id),

	penghasilanBruto: real('penghasilan_bruto').notNull().default(0),
	tarif: real('tarif').notNull().default(0),
	pajakPenghasilanDipotong: real('pajak_penghasilan_dipotong').notNull().default(0),

	// Assigned on Terbitkan -- simulated locally, same as BPU/BP21.
	nomorPemotongan: text('nomor_pemotongan'),
	diterbitkan: integer('diterbitkan', { mode: 'boolean' }).notNull().default(false)
});
