import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { fasilitas_pajak_ebupot } from '../../references/ebupot/fasilitas_pajak_ebupot';
import { jenis_dokumen_ebupot } from '../../references/ebupot/jenis_dokumen_ebupot';
import { kode_objek_pajak_pph } from '../../references/ebupot/kode_objek_pajak_pph';
import { wajib_pajak } from '../wajib_pajak/wajib_pajak';
import { buktiPotongBpuStatusValues } from './bukti_potong_bpu';
import { bpa1PtkpValues } from '../../../../../helpers/ptkp-bpa1';

// eBupot BPA1 ("Bukti Pemotongan A1 Masa Pajak") -- the annual/period-end
// PPh Pasal 21 recap for permanent employees (1721-A1 equivalent). See
// docs/ui-reference/coretax/ebupot/NOTES.md "BPA1" for the live-verified
// form this mirrors -- by far the most complex bukti type built so far:
// a period range (not a single Masa Pajak), a full Penghasilan
// Bruto/Pengurang/Neto build-up, PTKP-driven exemption, and a Pasal 17
// progressive-bracket tax computation (same mechanism as BP21's
// cumulative branch, see resolveBpa1.ts).
export const bukti_potong_bpa1 = sqliteTable('bukti_potong_bpa1', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),

	npwpPemotong: text('npwp_pemotong')
		.notNull()
		.references(() => wajib_pajak.npwp),

	// BPA1 spans a period range (Masa Pajak Awal..Akhir), not a single
	// Masa Pajak like BPU/BP21/BP26 -- Akhir is what list sorting/display
	// treats as "the period" for consistency with the other bukti types.
	masaPajakAwal: integer('masa_pajak_awal')
		.notNull()
		.$defaultFn(() => new Date().getMonth() + 1),
	tahunAwal: integer('tahun_awal')
		.notNull()
		.$defaultFn(() => new Date().getFullYear()),
	masaPajakAkhir: integer('masa_pajak_akhir')
		.notNull()
		.$defaultFn(() => new Date().getMonth() + 1),
	tahunAkhir: integer('tahun_akhir')
		.notNull()
		.$defaultFn(() => new Date().getFullYear()),
	status: text('status', { enum: buktiPotongBpuStatusValues }).notNull().default('NORMAL'),

	bekerjaDiLebihDariSatuPemberiKerja: integer('bekerja_di_lebih_dari_satu_pemberi_kerja', {
		mode: 'boolean'
	})
		.notNull()
		.default(false),
	pegawaiAsing: integer('pegawai_asing', { mode: 'boolean' }).notNull().default(false),
	nomorIdentitasWp: text('nomor_identitas_wp').notNull().default(''),
	nama: text('nama').notNull().default(''),
	statusPtkp: text('status_ptkp', { enum: bpa1PtkpValues }),
	jabatan: text('jabatan').notNull().default(''),

	kodeObjekPajakId: text('kode_objek_pajak_id').references(() => kode_objek_pajak_pph.id),
	fasilitasPajakId: text('fasilitas_pajak_id').references(() => fasilitas_pajak_ebupot.id),
	jenisPemotongan: text('jenis_pemotongan', {
		enum: ['KURANG_SETAHUN', 'KURANG_SETAHUN_DISETAHUNKAN', 'SETAHUN_PENUH']
	}),

	// Penghasilan Bruto components -- each a manual input, summed into
	// penghasilanBruto at save time (see updateBpa1.remote.ts).
	gajiPensiunThtJht: real('gaji_pensiun_tht_jht').notNull().default(0),
	tunjanganPph: real('tunjangan_pph').notNull().default(0),
	tunjanganLainnya: real('tunjangan_lainnya').notNull().default(0),
	honorarium: real('honorarium').notNull().default(0),
	premiAsuransi: real('premi_asuransi').notNull().default(0),
	natura: real('natura').notNull().default(0),
	tantiemBonus: real('tantiem_bonus').notNull().default(0),
	penghasilanBruto: real('penghasilan_bruto').notNull().default(0),

	// Pengurang -- biayaJabatan is computed (see calculateBiayaJabatan);
	// iuranPensiun/zakat are manual inputs.
	biayaJabatan: real('biaya_jabatan').notNull().default(0),
	iuranPensiun: real('iuran_pensiun').notNull().default(0),
	zakat: real('zakat').notNull().default(0),
	jumlahPengurangan: real('jumlah_pengurangan').notNull().default(0),
	penghasilanNeto: real('penghasilan_neto').notNull().default(0),

	// "Get data" pulling a prior employer's BPA1 automatically requires DJP
	// registry access this app doesn't have (same class of gap as
	// NITKU/Nama Penerima elsewhere) -- both fields are plain manual input.
	nomorBuktiSebelumnya: text('nomor_bukti_sebelumnya').notNull().default(''),
	penghasilanNetoSebelumnya: real('penghasilan_neto_sebelumnya').notNull().default(0),

	penghasilanNetoSetahunDisetahunkan: real('penghasilan_neto_setahun_disetahunkan')
		.notNull()
		.default(0),
	penghasilanTidakKenaPajak: real('penghasilan_tidak_kena_pajak').notNull().default(0),
	penghasilanKenaPajak: real('penghasilan_kena_pajak').notNull().default(0),
	tarif: real('tarif').notNull().default(0),
	pphPasal21AtasPkp: real('pph_pasal_21_atas_pkp').notNull().default(0),
	pphPasal21Terutang: real('pph_pasal_21_terutang').notNull().default(0),
	// Manual input -- same DJP-registry limitation as nomorBuktiSebelumnya.
	pphPasal21DipotongSebelumnya: real('pph_pasal_21_dipotong_sebelumnya').notNull().default(0),
	pphPasal21TerutangPadaIni: real('pph_pasal_21_terutang_pada_ini').notNull().default(0),
	pphDipotongDitanggungPemerintah: real('pph_dipotong_ditanggung_pemerintah').notNull().default(0),
	pphKurangLebihDipotongDesember: real('pph_kurang_lebih_dipotong_desember').notNull().default(0),

	jenisDokumenId: text('jenis_dokumen_id').references(() => jenis_dokumen_ebupot.id),
	nomorDokumen: text('nomor_dokumen').notNull().default(''),
	tanggalDokumen: text('tanggal_dokumen'),

	nomorPemotongan: text('nomor_pemotongan'),
	diterbitkan: integer('diterbitkan', { mode: 'boolean' }).notNull().default(false)
});
