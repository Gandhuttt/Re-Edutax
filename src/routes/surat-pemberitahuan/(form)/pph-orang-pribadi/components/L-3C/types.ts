// L-3C row shape. One shape serves all twelve sub-grids: Coretax uses a single
// component with a different tableIndex per sub-group, and the columns are the
// same throughout. See docs/ui-reference/coretax/spt-1770-lampiran/L3C-L3D.md.
export interface BarisHartaFiskal {
	// Derived from jenisHarta, never typed. Coretax's disabled AssetCode.
	kodeHarta: string;
	jenisHarta: string;
	bulanPerolehan: number;
	tahunPerolehan: number;
	hargaPerolehan: number;
	nilaiSisaBukuFiskal: number;
	metodeKomersial: string;
	metodeFiskal: string;
	penyusutanFiskalTahunIni: number;
	keterangan: string;
}

// The twelve sub-grids, keyed by Coretax's tableIndex. Kept as one flat map so
// the page can bind each grid without twelve separate props.
export type BarisPerTabel = Record<number, BarisHartaFiskal[]>;

// Which reference list and heading each tableIndex uses. Order here is the order
// Coretax renders the sections in.
export const L3C_SUB_GRID = [
	{ tableIndex: 1, seksi: 'berwujud', judul: 'KELOMPOK 1', daftar: 'l3c_harta_berwujud' },
	{ tableIndex: 2, seksi: 'berwujud', judul: 'KELOMPOK 2', daftar: 'l3c_harta_berwujud' },
	{ tableIndex: 3, seksi: 'berwujud', judul: 'KELOMPOK 3', daftar: 'l3c_harta_berwujud' },
	{ tableIndex: 4, seksi: 'berwujud', judul: 'KELOMPOK 4', daftar: 'l3c_harta_berwujud' },
	{ tableIndex: 5, seksi: 'berwujud', judul: 'KELOMPOK LAINNYA', daftar: 'l3c_harta_berwujud' },
	{ tableIndex: 6, seksi: 'bangunan', judul: 'PERMANEN', daftar: 'l3c_bangunan' },
	{ tableIndex: 7, seksi: 'bangunan', judul: 'TIDAK PERMANEN', daftar: 'l3c_bangunan' },
	{ tableIndex: 8, seksi: 'takberwujud', judul: 'KELOMPOK 1', daftar: 'l3c_harta_tidak_berwujud' },
	{ tableIndex: 9, seksi: 'takberwujud', judul: 'KELOMPOK 2', daftar: 'l3c_harta_tidak_berwujud' },
	{ tableIndex: 10, seksi: 'takberwujud', judul: 'KELOMPOK 3', daftar: 'l3c_harta_tidak_berwujud' },
	{ tableIndex: 11, seksi: 'takberwujud', judul: 'KELOMPOK 4', daftar: 'l3c_harta_tidak_berwujud' },
	{
		tableIndex: 12,
		seksi: 'takberwujud',
		judul: 'KELOMPOK LAINNYA',
		daftar: 'l3c_harta_tidak_berwujud'
	}
] as const;

// Coretax sums grids 1-7 into TotalFiscalDepreciation and 8-12 into
// TotalFiscalAmortization (which it numbers Grid1..5 within its own section).
export const L3C_PENYUSUTAN = [1, 2, 3, 4, 5, 6, 7];
export const L3C_AMORTISASI = [8, 9, 10, 11, 12];
