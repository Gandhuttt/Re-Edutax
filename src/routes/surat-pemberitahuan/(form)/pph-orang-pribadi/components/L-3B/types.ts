export interface TkuL3B {
	nama: string;
	alamat: string;
	kelurahan: string;
	kecamatan: string;
	kabupaten: string;
	provinsi: string;
	jenisUsahaPekerjaanBebas: string;
	// NORMA (%) for L-3A-4 Bagian A; see the schema note on why it lives here.
	normaPersen: number;
}

// Section A, fixed 12-row monthly matrix (PP 55/2022 final).
export interface BarisFinalBulanan {
	bulan: number;
	peredaranBruto: number;
	disetorSendiri: number;
	dipotongPihakLain: number;
}

// Sections B (OPPT) and C (Norma) are a plain monthly bruto figure each.
export interface BarisPeredaranBulanan {
	bulan: number;
	peredaranBruto: number;
}
