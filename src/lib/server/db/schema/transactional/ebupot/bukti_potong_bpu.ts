import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { fasilitas_pajak_ebupot } from '../../references/ebupot/fasilitas_pajak_ebupot';
import { jenis_dokumen_ebupot } from '../../references/ebupot/jenis_dokumen_ebupot';
import { kode_objek_pajak_pph } from '../../references/ebupot/kode_objek_pajak_pph';
import { wajib_pajak } from '../wajib_pajak/wajib_pajak';

// eBupot BPU ("Bukti Pemotongan/Pemungutan Unifikasi Standar") -- general
// PPh 23/26/4(2)/22 withholding slips. See
// docs/ui-reference/coretax/ebupot/NOTES.md for the live Coretax form this
// mirrors (withholding-slips-portal/id-ID/ebupotbpu), including the real
// Simpan Konsep -> Submit -> Terbitkan flow `status` mirrors.
//
// NITKU is derived (NPWP + "000000") rather than looked up against a real
// sub-unit registry, and Nama Penerima is either typed or filled via
// "Cari NPWP" against this app's own wajib_pajak table -- neither is a DJP
// taxpayer-master lookup, which this app has no access to.
//
// `status` is the same field Coretax's Informasi Umum "Status*" shows --
// live-verified it displays the literal lifecycle code (SAVEDINVALID,
// SUBMITTED, ...), not a separate correction-type flag. NORMAL is only the
// pre-save placeholder for a brand-new draft; the first Simpan Konsep moves
// it to SAVEDINVALID regardless of data correctness, and Submit is what
// flips it to SUBMITTED.
export const buktiPotongBpuStatusValues = ['NORMAL', 'SAVEDINVALID', 'SUBMITTED'] as const;
export type BuktiPotongBpuStatus = (typeof buktiPotongBpuStatusValues)[number];

export const bukti_potong_bpu = sqliteTable('bukti_potong_bpu', {
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

	nomorIdentitasWp: text('nomor_identitas_wp').notNull().default(''),
	namaPenerima: text('nama_penerima').notNull().default(''),

	kodeObjekPajakId: text('kode_objek_pajak_id').references(() => kode_objek_pajak_pph.id),
	fasilitasPajakId: text('fasilitas_pajak_id').references(() => fasilitas_pajak_ebupot.id),

	dasarPengenaanPajak: real('dasar_pengenaan_pajak').notNull().default(0),
	tarif: real('tarif').notNull().default(0),
	pajakPenghasilan: real('pajak_penghasilan').notNull().default(0),

	jenisDokumenId: text('jenis_dokumen_id').references(() => jenis_dokumen_ebupot.id),
	nomorDokumen: text('nomor_dokumen').notNull().default(''),
	tanggalDokumen: text('tanggal_dokumen'),

	// Assigned on Terbitkan (see terbitkanBpu.remote.ts) -- simulated locally,
	// never issued through the real Coretax Terbitkan action. Once issued,
	// the slip also becomes visible to the recipient's own "Bukti Potong
	// Saya" recap (see bukti-potong-saya route) by matching nomorIdentitasWp
	// against their NPWP, the same way a faktur keluaran shows up in the
	// buyer's Faktur Masukan.
	nomorPemotongan: text('nomor_pemotongan'),
	diterbitkan: integer('diterbitkan', { mode: 'boolean' }).notNull().default(false)
});
