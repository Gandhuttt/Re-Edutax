// L-4 Bagian A, flat scalar form (one row per SPT), not a repeating grid.
// Only the true manual inputs live here; the five derived fields (Jumlah
// penghasilan neto, Penghasilan Kena Pajak, Pajak Terutang, PPh yang harus
// dibayar, Angsuran PPh Pasal 25) are computed on the fly from these via
// hitungLampiranL4 (Induk/hitungPphOrangPribadi.ts), never stored or bound.
//
// Bagian B manual inputs (gated on Induk row 7 = ph/mt, a different gate
// from Bagian A's 13b) live in the same flat row. Its gabungan/derived
// figures are likewise computed on the fly via hitungLampiranL4SectionB and
// never stored; the WP-column "Penghasilan Neto" / "...setelah dikurangi..."
// cells are Induk row 4 mirrored in as a prop, not their own fields here.
export interface LampiranL4 {
	penghasilanNeto: number;
	kompensasiKerugian: number;
	zakatSumbangan: number;
	// Same PTKP status values as Induk row 5 (c5PtkpStatus).
	ptkpStatus: string;
	pengurangPphTerutang: number;
	kreditPajak: number;
	// Bagian B.
	brutoWp: number;
	brutoSuamiIstri: number;
	netoSuamiIstri: number;
	setelahDikurangiSuamiIstri: number;
	ptkpGabunganStatus: string;
	namaSuamiIstri: string;
}
