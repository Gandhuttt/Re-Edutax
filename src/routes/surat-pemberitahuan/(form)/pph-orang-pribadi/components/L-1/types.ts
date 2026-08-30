// Row shapes for each L-1 grid.
//
// One interface per sub-table rather than a shared loose record, so each
// section's own markup is type-checked against the fields it actually renders.
// The six harta sub-tables share a single storage table (with a subTabel
// discriminator and the union of their columns), but they are distinct shapes at
// the UI level and are typed as such here.

export interface BarisA1 {
	kode: string;
	deskripsi: string;
	nomorAkun: string;
	atasNama: string;
	namaBankInstitusi: string;
	lokasiHarta: string;
	tahunPerolehan: number;
	// A1 records a single Saldo where its siblings record harga perolehan and
	// nilai saat ini separately. Stored in nilaiSaatIni; A7 falls back to it.
	nilaiSaatIni: number;
	keterangan: string;
}

export interface BarisA2 {
	kode: string;
	deskripsi: string;
	lokasiHarta: string;
	nomorIdentitasPenerima: string;
	namaPenerimaPinjaman: string;
	nilaiPiutang: number;
	tahunDimulai: number;
	nilaiSaatIni: number;
	keterangan: string;
}

export interface BarisA3 {
	kode: string;
	deskripsi: string;
	lokasiHarta: string;
	nomorIdentitasPenerima: string;
	namaBankInstitusi: string;
	nomorAkun: string;
	hargaPerolehan: number;
	tahunPerolehan: number;
	nilaiSaatIni: number;
	keterangan: string;
}

// No deskripsi: A4 is the one sub-table where Tipe describes the asset.
export interface BarisA4 {
	kode: string;
	deskripsi: string;
	merkModel: string;
	nomorPolisiRegistrasi: string;
	kepemilikan: string;
	nomorIdentitasPemilik: string;
	namaPemilik: string;
	tahunPerolehan: number;
	hargaPerolehan: number;
	nilaiSaatIni: number;
	keterangan: string;
}

export interface BarisA5 {
	kode: string;
	deskripsi: string;
	lokasiHarta: string;
	ukuranTanah: string;
	ukuranBangunan: string;
	sumberKepemilikan: string;
	nomorSertifikat: string;
	tahunPerolehan: number;
	hargaPerolehan: number;
	nilaiSaatIni: number;
	keterangan: string;
}

export interface BarisA6 {
	kode: string;
	deskripsi: string;
	tahunPerolehan: number;
	hargaPerolehan: number;
	nilaiSaatIni: number;
	buktiKepemilikan: string;
	informasiTambahan: string;
	keterangan: string;
}

export interface Harta {
	a1: BarisA1[];
	a2: BarisA2[];
	a3: BarisA3[];
	a4: BarisA4[];
	a5: BarisA5[];
	a6: BarisA6[];
}

export interface BarisUtang {
	kode: string;
	deskripsi: string;
	nikNpwpKreditur: string;
	namaKreditur: string;
	negaraKreditur: string;
	// The one field here with no asterisk on the live form.
	tahunPeminjaman: number;
	saldo: number;
	keterangan: string;
}

export interface BarisKeluarga {
	nama: string;
	nik: string;
	tanggalLahir: string;
	hubungan: string;
	pekerjaan: string;
}

export interface BarisPekerjaan {
	nomorIdentitasPemberiKerja: string;
	namaPemberiKerja: string;
	penghasilanBruto: number;
	pengurangPenghasilanBruto: number;
	// Derived as bruto - pengurang, recomputed on save.
	penghasilanNeto: number;
}

export interface BarisBuktiPotong {
	namaPemotong: string;
	npwpPemotong: string;
	nomorBukti: string;
	tanggalBukti: string;
	jenisPajak: string;
	penghasilanBruto: number;
	pphDipotong: number;
	// Set only when this row was pulled in via "Impor dari eBupot" -- undefined
	// for manually-typed rows. Powers the dedup check in the import picker
	// (an already-imported bukti isn't offered again) and the "Diimpor" badge.
	sumberBuktiPotongJenis?: 'BPU' | 'BP21' | 'BP26' | 'BPA1' | 'BPA2' | 'MP' | null;
	sumberBuktiPotongId?: string | null;
}
