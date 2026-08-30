import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { kode_objek_pajak_pph } from '../../references/ebupot/kode_objek_pajak_pph';
import { wajib_pajak } from '../wajib_pajak/wajib_pajak';
import { buktiPotongBpuStatusValues } from './bukti_potong_bpu';
import { bpa1PtkpValues } from '../../../../../helpers/ptkp-bpa1';

// eBupot BPA2 ("Bukti Pemotongan A2 Masa Pajak") -- BPA1's counterpart for
// PNS/TNI/Polri/pejabat negara. Shares BPA1's period-range/PTKP/progressive-
// bracket mechanics exactly (see resolveBpa2.ts), but live-verified with a
// structurally simpler form: no Pegawai Asing, no Fasilitas Pajak/DTP
// mechanism, a PNS-specific Penghasilan Bruto breakdown, and no Dokumen
// Referensi section at all. See docs/ui-reference/coretax/ebupot/NOTES.md
// "BPA2" for the full live-verified field list.
export const bukti_potong_bpa2 = sqliteTable('bukti_potong_bpa2', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),

	npwpPemotong: text('npwp_pemotong')
		.notNull()
		.references(() => wajib_pajak.npwp),

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
	nomorIdentitasWp: text('nomor_identitas_wp').notNull().default(''),
	nama: text('nama').notNull().default(''),
	nip: text('nip').notNull().default(''),
	pangkatGolongan: text('pangkat_golongan').notNull().default(''),
	statusPtkp: text('status_ptkp', { enum: bpa1PtkpValues }),
	posisi: text('posisi').notNull().default(''),

	kodeObjekPajakId: text('kode_objek_pajak_id').references(() => kode_objek_pajak_pph.id),
	jenisPemotongan: text('jenis_pemotongan', {
		enum: ['KURANG_SETAHUN', 'KURANG_SETAHUN_DISETAHUNKAN', 'SETAHUN_PENUH']
	}),

	// Penghasilan Bruto -- PNS-specific allowance breakdown, live-verified
	// distinct from BPA1's (no Honorarium/Premi Asuransi/Natura/Tantiem
	// Bonus, no Gross Up).
	gajiPokokPensiun: real('gaji_pokok_pensiun').notNull().default(0),
	tunjanganIstri: real('tunjangan_istri').notNull().default(0),
	tunjanganAnak: real('tunjangan_anak').notNull().default(0),
	tunjanganPerbaikanPenghasilan: real('tunjangan_perbaikan_penghasilan').notNull().default(0),
	tunjanganStrukturalFungsional: real('tunjangan_struktural_fungsional').notNull().default(0),
	tunjanganBeras: real('tunjangan_beras').notNull().default(0),
	tunjanganLainLain: real('tunjangan_lain_lain').notNull().default(0),
	penghasilanTetapTeraturLainnya: real('penghasilan_tetap_teratur_lainnya').notNull().default(0),
	penghasilanBruto: real('penghasilan_bruto').notNull().default(0),

	biayaJabatan: real('biaya_jabatan').notNull().default(0),
	iuranPensiun: real('iuran_pensiun').notNull().default(0),
	zakat: real('zakat').notNull().default(0),
	jumlahPengurangan: real('jumlah_pengurangan').notNull().default(0),
	penghasilanNeto: real('penghasilan_neto').notNull().default(0),

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
	pphPasal21DipotongSebelumnya: real('pph_pasal_21_dipotong_sebelumnya').notNull().default(0),
	pphPasal21TerutangPadaIni: real('pph_pasal_21_terutang_pada_ini').notNull().default(0),
	// No Fasilitas Pajak/DTP mechanism for BPA2 (live-verified: no such
	// dropdown exists) -- this is a plain manual/system figure representing
	// PPh 21 already withheld via monthly payroll, distinct from BPA1's
	// facility-driven pphDipotongDitanggungPemerintah.
	pphPasal21YangTelahDipotong: real('pph_pasal_21_yang_telah_dipotong').notNull().default(0),
	pphKurangLebihDipotongDesember: real('pph_kurang_lebih_dipotong_desember').notNull().default(0),

	nomorPemotongan: text('nomor_pemotongan'),
	diterbitkan: integer('diterbitkan', { mode: 'boolean' }).notNull().default(false)
});
