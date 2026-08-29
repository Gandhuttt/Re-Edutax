import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { fasilitas_pajak_ebupot } from '../../references/ebupot/fasilitas_pajak_ebupot';
import { jenis_dokumen_ebupot } from '../../references/ebupot/jenis_dokumen_ebupot';
import { kode_objek_pajak_pph } from '../../references/ebupot/kode_objek_pajak_pph';
import { wajib_pajak } from '../wajib_pajak/wajib_pajak';

// eBupot BPU ("Bukti Pemotongan/Pemungutan Unifikasi Standar") -- general
// PPh 23/26/4(2)/22 withholding slips. See
// docs/ui-reference/coretax/ebupot/NOTES.md for the live Coretax form this
// mirrors (withholding-slips-portal/id-ID/ebupotbpu).
//
// NITKU (recipient sub-unit) is intentionally not modeled yet -- Coretax
// requires it, but this is a first slice and most withholders/recipients
// don't have registered sub-units. Nama Penerima is stored as typed input
// rather than looked up, since Coretax derives it from the DJP taxpayer
// master, which this app has no access to.
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
	status: text('status').notNull().default('NORMAL'),

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

	diterbitkan: integer('diterbitkan', { mode: 'boolean' }).notNull().default(false)
});
