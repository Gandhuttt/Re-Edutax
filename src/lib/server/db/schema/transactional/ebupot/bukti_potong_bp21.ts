import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { fasilitas_pajak_ebupot } from '../../references/ebupot/fasilitas_pajak_ebupot';
import { jenis_dokumen_ebupot } from '../../references/ebupot/jenis_dokumen_ebupot';
import { kode_objek_pajak_pph } from '../../references/ebupot/kode_objek_pajak_pph';
import { wajib_pajak } from '../wajib_pajak/wajib_pajak';
import { buktiPotongBpuStatusValues } from './bukti_potong_bpu';
import { ptkpEbupotValues } from '../../../../../helpers/ptkp-ebupot';

// eBupot BP21 ("Bukti Pemotongan Selain Pegawai Tetap") -- PPh Pasal 21
// withholding for non-permanent-employee recipients (freelancers,
// honorarium, severance/pension lump sums, etc). See
// docs/ui-reference/coretax/ebupot/NOTES.md "BP21: TER, flat, and
// cumulative-bracket formulas" for the live-verified tax computation this
// mirrors, and bukti_potong_bpu.ts for the shared status-lifecycle /
// Terbitkan-simulation conventions this table reuses as-is.
//
// Unlike BPU (flat Dasar Pengenaan Pajak x Tarif), BP21's tax is computed
// from Penghasilan Bruto x DPP% x Tarif%, where DPP%/Tarif% are usually
// derived (TER bracket keyed by Status PTKP + bruto, or a flat rate) via
// resolveBp21.ts -- both `dpp` and `tarif` are stored as the *resolved*
// values at save time, same treatment BPU already gives `tarif`.
export const bukti_potong_bp21 = sqliteTable('bukti_potong_bp21', {
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
	statusPtkp: text('status_ptkp', { enum: ptkpEbupotValues }),

	kodeObjekPajakId: text('kode_objek_pajak_id').references(() => kode_objek_pajak_pph.id),
	fasilitasPajakId: text('fasilitas_pajak_id').references(() => fasilitas_pajak_ebupot.id),

	// "Pendapatan Bruto yang Telah Dibayar Sebelumnya" -- only meaningful for
	// kode objek pajak 21-401-01/21-401-02 (pesangon/pensiun sekaligus);
	// harmless 0 for every other object. See resolveBp21.ts's cumulative
	// bracket branch.
	pendapatanBrutoSebelumnya: real('pendapatan_bruto_sebelumnya').notNull().default(0),
	penghasilanBruto: real('penghasilan_bruto').notNull().default(0),
	dpp: real('dpp').notNull().default(0),
	tarif: real('tarif').notNull().default(0),
	pajakPenghasilan: real('pajak_penghasilan').notNull().default(0),

	jenisDokumenId: text('jenis_dokumen_id').references(() => jenis_dokumen_ebupot.id),
	nomorDokumen: text('nomor_dokumen').notNull().default(''),
	tanggalDokumen: text('tanggal_dokumen'),

	// Assigned on Terbitkan -- simulated locally, same as BPU's
	// nomorPemotongan/diterbitkan (see terbitkanBpu.remote.ts).
	nomorPemotongan: text('nomor_pemotongan'),
	diterbitkan: integer('diterbitkan', { mode: 'boolean' }).notNull().default(false)
});
