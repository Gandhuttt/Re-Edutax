import type { ColumnSpec, FieldSpec, LampiranRow } from '../lampiran/types';

// Field and column specs for every L-1 grid, transcribed from
// docs/ui-reference/coretax/spt-1770-lampiran/ (NOTES.md for the grid columns,
// MODAL-FIELDS.md for the row-editor fields).
//
// Two deliberate divergences from the source, both already decided:
//   - Kode is an ordinary text input everywhere, not disabled and not derived
//     from Deskripsi.
//   - Modal titles and placeholders use consistent Indonesian rather than
//     Coretax's, which are inconsistently cased, sometimes name one of their own
//     fields, and in one case are untranslated English.

const kode: FieldSpec = { key: 'kode', label: 'Kode', kind: 'text', wajib: true };
const keteranganPps: FieldSpec = {
	key: 'keterangan',
	label: 'Keterangan',
	kind: 'daftar',
	daftar: 'keterangan_pps',
	// No asterisk on the live form, yet it raises "Kolom ini wajib diisi!".
	// Requiredness is its own metadata precisely because of cases like this.
	wajib: true
};
const tahunPerolehan: FieldSpec = {
	key: 'tahunPerolehan',
	label: 'Tahun Perolehan',
	kind: 'tahun',
	wajib: true
};

// A1, KAS DAN SETARA KAS
export const A1_FIELDS: FieldSpec[] = [
	kode,
	{ key: 'deskripsi', label: 'Deskripsi', kind: 'daftar', daftar: 'l1_a1_deskripsi', wajib: true },
	{ key: 'nomorAkun', label: 'Nomor Akun', kind: 'text', wajib: true },
	{ key: 'atasNama', label: 'Atas Nama', kind: 'text', wajib: true },
	{ key: 'namaBankInstitusi', label: 'Nama Bank/Institusi', kind: 'text', wajib: true },
	{ key: 'lokasiHarta', label: 'Lokasi Harta', kind: 'daftar', daftar: 'negara', wajib: true },
	tahunPerolehan,
	// A1 records a single Saldo where its siblings record Harga Perolehan and
	// Nilai Saat Ini. It populates both columns of the A7 rollup.
	{ key: 'nilaiSaatIni', label: 'Saldo', kind: 'rupiah', wajib: true },
	keteranganPps
];
export const A1_COLUMNS: ColumnSpec[] = [
	{ key: 'kode', label: 'KODE' },
	{ key: 'deskripsi', label: 'DESKRIPSI' },
	{ key: 'nomorAkun', label: 'NOMOR AKUN' },
	{ key: 'atasNama', label: 'ATAS NAMA' },
	{ key: 'namaBankInstitusi', label: 'NAMA BANK/INSTITUSI' },
	{ key: 'lokasiHarta', label: 'LOKASI HARTA' },
	{ key: 'tahunPerolehan', label: 'TAHUN PEROLEHAN' },
	{ key: 'nilaiSaatIni', label: 'SALDO', kind: 'rupiah' },
	{ key: 'keterangan', label: 'KETERANGAN' }
];

// A2, PIUTANG
export const A2_FIELDS: FieldSpec[] = [
	kode,
	{ key: 'deskripsi', label: 'Deskripsi', kind: 'daftar', daftar: 'l1_a2_deskripsi', wajib: true },
	{ key: 'lokasiHarta', label: 'Lokasi Penerima', kind: 'daftar', daftar: 'negara', wajib: true },
	{
		key: 'nomorIdentitasPenerima',
		label: 'Nomor Identitas Penerima (NIK/NPWP)',
		kind: 'text',
		wajib: true
	},
	// Derived from the NIK/NPWP on the live form. We keep it editable: the lookup
	// would need a taxpayer directory we do not have, and defaulting it to the
	// filer's own identity (which Coretax does) would be misleading here.
	{ key: 'namaPenerimaPinjaman', label: 'Nama Penerima Pinjaman', kind: 'text', wajib: true },
	{ key: 'nilaiPiutang', label: 'Nilai Piutang', kind: 'rupiah', wajib: true },
	{ key: 'tahunDimulai', label: 'Tahun Dimulai', kind: 'tahun', wajib: true },
	{ key: 'nilaiSaatIni', label: 'Saldo Piutang Saat Ini', kind: 'rupiah', wajib: true },
	keteranganPps
];
export const A2_COLUMNS: ColumnSpec[] = [
	{ key: 'kode', label: 'KODE' },
	{ key: 'deskripsi', label: 'DESKRIPSI' },
	{ key: 'lokasiHarta', label: 'LOKASI PENERIMA PINJAMAN' },
	{ key: 'nomorIdentitasPenerima', label: 'NIK/NPWP PENERIMA PINJAMAN' },
	{ key: 'namaPenerimaPinjaman', label: 'NAMA PENERIMA PINJAMAN' },
	{ key: 'tahunDimulai', label: 'TAHUN DIMULAI' },
	{ key: 'nilaiPiutang', label: 'NILAI PIUTANG', kind: 'rupiah' },
	{ key: 'nilaiSaatIni', label: 'SALDO PIUTANG SAAT INI', kind: 'rupiah' },
	{ key: 'keterangan', label: 'KETERANGAN' }
];

// A3, INVESTASI/SEKURITAS
export const A3_FIELDS: FieldSpec[] = [
	kode,
	{ key: 'deskripsi', label: 'Deskripsi', kind: 'daftar', daftar: 'l1_a3_deskripsi', wajib: true },
	{ key: 'lokasiHarta', label: 'Lokasi Harta', kind: 'daftar', daftar: 'negara', wajib: true },
	{
		key: 'nomorIdentitasPenerima',
		label: 'Nomor Identitas Bank/Institusi/Penerima Investasi (NPWP)',
		kind: 'text',
		wajib: true
	},
	// Editable here, unlike A2's equivalent, which the live form derives. The
	// inconsistency is Coretax's, not ours.
	{
		key: 'namaBankInstitusi',
		label: 'Nama Bank/Institusi/Penerima Investasi',
		kind: 'text',
		wajib: true
	},
	{ key: 'nomorAkun', label: 'Nomor Akun', kind: 'text', wajib: true },
	{ key: 'hargaPerolehan', label: 'Harga Perolehan', kind: 'rupiah', wajib: true },
	tahunPerolehan,
	{ key: 'nilaiSaatIni', label: 'Nilai Saat Ini', kind: 'rupiah', wajib: true },
	keteranganPps
];
export const A3_COLUMNS: ColumnSpec[] = [
	{ key: 'kode', label: 'KODE' },
	{ key: 'deskripsi', label: 'DESKRIPSI' },
	{ key: 'lokasiHarta', label: 'LOKASI HARTA' },
	{ key: 'nomorIdentitasPenerima', label: 'NPWP BANK/INSTITUSI/PENERIMA INVESTASI' },
	{ key: 'namaBankInstitusi', label: 'NAMA BANK/INSTITUSI/PENERIMA INVESTASI' },
	{ key: 'nomorAkun', label: 'NOMOR AKUN' },
	{ key: 'tahunPerolehan', label: 'TAHUN PEROLEHAN' },
	{ key: 'hargaPerolehan', label: 'HARGA PEROLEHAN', kind: 'rupiah' },
	{ key: 'nilaiSaatIni', label: 'NILAI SAAT INI', kind: 'rupiah' },
	{ key: 'keterangan', label: 'KETERANGAN' }
];

// A4, HARTA BERGERAK. The only sub-table with no Deskripsi: Tipe describes it.
export const A4_FIELDS: FieldSpec[] = [
	kode,
	{ key: 'deskripsi', label: 'Tipe', kind: 'daftar', daftar: 'l1_a4_tipe', wajib: true },
	{ key: 'merkModel', label: 'Merk/Model', kind: 'text', wajib: true },
	{ key: 'nomorPolisiRegistrasi', label: 'Nomor Polisi/Registrasi', kind: 'text', wajib: true },
	{
		key: 'kepemilikan',
		label: 'Kepemilikan',
		kind: 'daftar',
		daftar: 'l1_a4_kepemilikan',
		wajib: true
	},
	{
		key: 'nomorIdentitasPemilik',
		label: 'Nomor Identitas Pemilik (NIK/NPWP)',
		kind: 'text',
		wajib: true
	},
	{ key: 'namaPemilik', label: 'Nama Pemilik', kind: 'text', wajib: true },
	tahunPerolehan,
	{ key: 'hargaPerolehan', label: 'Harga Perolehan', kind: 'rupiah', wajib: true },
	{ key: 'nilaiSaatIni', label: 'Nilai Saat Ini', kind: 'rupiah', wajib: true },
	keteranganPps
];
export const A4_COLUMNS: ColumnSpec[] = [
	{ key: 'kode', label: 'KODE' },
	{ key: 'deskripsi', label: 'TIPE' },
	{ key: 'merkModel', label: 'MERK/MODEL' },
	{ key: 'nomorPolisiRegistrasi', label: 'NOMOR POLISI/REGISTRASI' },
	{ key: 'kepemilikan', label: 'KEPEMILIKAN' },
	{ key: 'nomorIdentitasPemilik', label: 'NIK/NPWP PEMILIK' },
	{ key: 'namaPemilik', label: 'NAMA PEMILIK' },
	{ key: 'tahunPerolehan', label: 'TAHUN PEROLEHAN' },
	{ key: 'hargaPerolehan', label: 'HARGA PEROLEHAN', kind: 'rupiah' },
	{ key: 'nilaiSaatIni', label: 'NILAI SAAT INI', kind: 'rupiah' },
	{ key: 'keterangan', label: 'KETERANGAN' }
];

// A5, HARTA TIDAK BERGERAK. Lokasi Harta is a plain text input here, where A1
// and A3 use the negara dropdown for the same concept.
export const A5_FIELDS: FieldSpec[] = [
	kode,
	{ key: 'deskripsi', label: 'Deskripsi', kind: 'daftar', daftar: 'l1_a5_deskripsi', wajib: true },
	{ key: 'lokasiHarta', label: 'Lokasi Harta', kind: 'text', wajib: true },
	{ key: 'ukuranTanah', label: 'Ukuran Properti - Tanah', kind: 'text', wajib: true },
	{ key: 'ukuranBangunan', label: 'Ukuran Properti - Bangunan', kind: 'text', wajib: true },
	{
		key: 'sumberKepemilikan',
		label: 'Sumber Kepemilikan',
		kind: 'daftar',
		daftar: 'l1_a5_sumber_kepemilikan',
		wajib: true
	},
	{ key: 'nomorSertifikat', label: 'Nomor Sertifikat', kind: 'text', wajib: true },
	tahunPerolehan,
	{ key: 'hargaPerolehan', label: 'Harga Perolehan', kind: 'rupiah', wajib: true },
	{ key: 'nilaiSaatIni', label: 'Nilai Saat Ini', kind: 'rupiah', wajib: true },
	keteranganPps
];
export const A5_COLUMNS: ColumnSpec[] = [
	{ key: 'kode', label: 'KODE' },
	{ key: 'deskripsi', label: 'DESKRIPSI' },
	{ key: 'lokasiHarta', label: 'LOKASI HARTA' },
	{ key: 'ukuranTanah', label: 'UKURAN PROPERTI - TANAH' },
	{ key: 'ukuranBangunan', label: 'UKURAN PROPERTI - BANGUNAN' },
	{ key: 'sumberKepemilikan', label: 'SUMBER KEPEMILIKAN' },
	{ key: 'nomorSertifikat', label: 'NOMOR SERTIFIKAT' },
	{ key: 'tahunPerolehan', label: 'TAHUN PEROLEHAN' },
	{ key: 'hargaPerolehan', label: 'HARGA PEROLEHAN', kind: 'rupiah' },
	{ key: 'nilaiSaatIni', label: 'NILAI SAAT INI', kind: 'rupiah' },
	{ key: 'keterangan', label: 'KETERANGAN' }
];

// A6, HARTA LAINNYA. The live modal is titled "Aset Lain-Lain" and calls the
// same field Biaya Perolehan where the grid column says HARGA PEROLEHAN.
export const A6_FIELDS: FieldSpec[] = [
	kode,
	{ key: 'deskripsi', label: 'Deskripsi', kind: 'daftar', daftar: 'l1_a6_deskripsi', wajib: true },
	tahunPerolehan,
	{ key: 'hargaPerolehan', label: 'Harga Perolehan', kind: 'rupiah', wajib: true },
	{ key: 'nilaiSaatIni', label: 'Nilai Saat Ini', kind: 'rupiah', wajib: true },
	{ key: 'buktiKepemilikan', label: 'Bukti Kepemilikan/Nomor Akun', kind: 'text', wajib: true },
	{ key: 'informasiTambahan', label: 'Informasi Tambahan', kind: 'text', wajib: true },
	keteranganPps
];
export const A6_COLUMNS: ColumnSpec[] = [
	{ key: 'kode', label: 'KODE' },
	{ key: 'deskripsi', label: 'DESKRIPSI' },
	{ key: 'tahunPerolehan', label: 'TAHUN PEROLEHAN' },
	{ key: 'buktiKepemilikan', label: 'BUKTI KEPEMILIKAN/NOMOR AKUN' },
	{ key: 'informasiTambahan', label: 'INFORMASI TAMBAHAN' },
	{ key: 'hargaPerolehan', label: 'HARGA PEROLEHAN', kind: 'rupiah' },
	{ key: 'nilaiSaatIni', label: 'NILAI SAAT INI', kind: 'rupiah' },
	{ key: 'keterangan', label: 'KETERANGAN' }
];

// B, UTANG PADA AKHIR TAHUN PAJAK
export const B_FIELDS: FieldSpec[] = [
	kode,
	{ key: 'deskripsi', label: 'Deskripsi', kind: 'daftar', daftar: 'l1_b_deskripsi', wajib: true },
	{ key: 'nikNpwpKreditur', label: 'NIK/NPWP Kreditur', kind: 'text', wajib: true },
	{ key: 'namaKreditur', label: 'Nama Kreditur', kind: 'text', wajib: true },
	{ key: 'negaraKreditur', label: 'Negara Kreditur', kind: 'daftar', daftar: 'negara', wajib: true },
	// The rare field carrying no asterisk on the live form.
	{ key: 'tahunPeminjaman', label: 'Tahun Peminjaman', kind: 'tahun' },
	{ key: 'saldo', label: 'Saldo', kind: 'rupiah', wajib: true },
	{ key: 'keterangan', label: 'Keterangan', kind: 'daftar', daftar: 'l1_b_keterangan', wajib: true }
];
export const B_COLUMNS: ColumnSpec[] = [
	{ key: 'kode', label: 'KODE' },
	{ key: 'deskripsi', label: 'DESKRIPSI' },
	{ key: 'nikNpwpKreditur', label: 'NIK/NPWP KREDITUR' },
	{ key: 'namaKreditur', label: 'NAMA KREDITUR' },
	{ key: 'negaraKreditur', label: 'NEGARA KREDITUR' },
	{ key: 'tahunPeminjaman', label: 'TAHUN PEMINJAMAN' },
	{ key: 'saldo', label: 'SALDO', kind: 'rupiah' },
	{ key: 'keterangan', label: 'KETERANGAN' }
];

// C, DAFTAR ANGGOTA KELUARGA. Read-only in every captured state, populated from
// DJP records; seeded rather than fetched here.
export const C_COLUMNS: ColumnSpec[] = [
	{ key: 'nama', label: 'NAMA' },
	{ key: 'nik', label: 'NIK' },
	{ key: 'tanggalLahir', label: 'TANGGAL LAHIR' },
	{ key: 'hubungan', label: 'HUBUNGAN DENGAN WAJIB PAJAK' },
	{ key: 'pekerjaan', label: 'PEKERJAAN' }
];

// D, PENGHASILAN NETO DALAM NEGERI DARI PEKERJAAN. Feeds Induk 1.a.
export const D_FIELDS: FieldSpec[] = [
	{
		key: 'nomorIdentitasPemberiKerja',
		label: 'Nomor Identitas Pemberi Kerja',
		kind: 'text',
		wajib: true
	},
	{ key: 'namaPemberiKerja', label: 'Nama Pemberi Kerja', kind: 'text', wajib: true },
	{ key: 'penghasilanBruto', label: 'Penghasilan Bruto', kind: 'rupiah', wajib: true },
	{
		key: 'pengurangPenghasilanBruto',
		label: 'Pengurang Penghasilan Bruto/Biaya',
		kind: 'rupiah',
		wajib: true
	},
	{
		key: 'penghasilanNeto',
		label: 'Penghasilan Neto',
		kind: 'rupiah',
		// Genuine arithmetic rather than a lookup, so it stays derived. The D
		// footer totals this, not the bruto, and that total is what reaches Induk.
		turunan: (row: LampiranRow) =>
			Number(row.penghasilanBruto || 0) - Number(row.pengurangPenghasilanBruto || 0)
	}
];
export const D_COLUMNS: ColumnSpec[] = [
	{ key: 'namaPemberiKerja', label: 'NAMA PEMBERI KERJA' },
	{ key: 'nomorIdentitasPemberiKerja', label: 'NOMOR IDENTITAS PEMBERI KERJA' },
	{ key: 'penghasilanBruto', label: 'PENGHASILAN BRUTO', kind: 'rupiah' },
	{ key: 'pengurangPenghasilanBruto', label: 'PENGURANG PENGHASILAN BRUTO/BIAYA', kind: 'rupiah' },
	{ key: 'penghasilanNeto', label: 'PENGHASILAN NETO', kind: 'rupiah' }
];

// E, DAFTAR BUKTI PEMOTONGAN/PEMUNGUTAN PPh. Feeds Induk 10a.
export const E_FIELDS: FieldSpec[] = [
	{ key: 'namaPemotong', label: 'Nama Pemotong/Pemungut PPh', kind: 'text', wajib: true },
	{ key: 'npwpPemotong', label: 'NPWP Pemotong/Pemungut PPh', kind: 'text', wajib: true },
	{ key: 'nomorBukti', label: 'Nomor Bukti Pemotongan/Pemungutan', kind: 'text', wajib: true },
	{ key: 'tanggalBukti', label: 'Tanggal Bukti Pemotongan/Pemungutan', kind: 'tanggal', wajib: true },
	{
		key: 'jenisPajak',
		label: 'Jenis Pajak',
		kind: 'daftar',
		daftar: 'l1_e_jenis_pajak',
		wajib: true
	},
	{ key: 'penghasilanBruto', label: 'Penghasilan Bruto', kind: 'rupiah', wajib: true },
	{ key: 'pphDipotong', label: 'PPh yang Dipotong/Dipungut', kind: 'rupiah', wajib: true }
];
export const E_COLUMNS: ColumnSpec[] = [
	{ key: 'namaPemotong', label: 'NAMA PEMOTONG/PEMUNGUT PPh' },
	{ key: 'npwpPemotong', label: 'NPWP PEMOTONG/PEMUNGUT PPh' },
	{ key: 'nomorBukti', label: 'NOMOR BUKTI PEMOTONGAN/PEMUNGUTAN' },
	{ key: 'tanggalBukti', label: 'TANGGAL BUKTI PEMOTONGAN/PEMUNGUTAN' },
	{ key: 'jenisPajak', label: 'JENIS PAJAK' },
	{ key: 'penghasilanBruto', label: 'PENGHASILAN BRUTO', kind: 'rupiah' },
	{ key: 'pphDipotong', label: 'PPh YANG DIPOTONG/DIPUNGUT', kind: 'rupiah' }
];
