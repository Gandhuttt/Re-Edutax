// Induk computation chain for SPT 1770.
//
// Every rule and every number here was read off the live Coretax form rather
// than derived from regulation, and the measurements are recorded in
// docs/ui-reference/coretax/spt-1770-induk/COMPUTATION.md. Two of them are easy
// to get wrong and are called out at their implementation below: the round-down
// at row 6, and the floor at row 6.

export type PtkpStatus =
	| 'tk_0'
	| 'tk_1'
	| 'tk_2'
	| 'tk_3'
	| 'k_0'
	| 'k_1'
	| 'k_2'
	| 'k_3'
	| 'k_i_0'
	| 'k_i_1'
	| 'k_i_2'
	| 'k_i_3'
	| 'tidak_berlaku';

// Read by selecting each of the 13 options and reading the row 5 amount.
// Structure is base 54.000.000, +4.500.000 per tanggungan, +4.500.000 for kawin;
// the K/I series (penghasilan istri digabung) starts at 54.000.000 x 2 +
// 4.500.000. Listed as measured rather than computed from that structure, since
// the structure is an observation about the table and not its definition.
export const PTKP: Record<PtkpStatus, number> = {
	tk_0: 54_000_000,
	tk_1: 58_500_000,
	tk_2: 63_000_000,
	tk_3: 67_500_000,
	k_0: 58_500_000,
	k_1: 63_000_000,
	k_2: 67_500_000,
	k_3: 72_000_000,
	k_i_0: 112_500_000,
	k_i_1: 117_000_000,
	k_i_2: 121_500_000,
	k_i_3: 126_000_000,
	// "-/-" yields 0, so it reads as "not applicable" rather than as a status.
	tidak_berlaku: 0
};

// DOM order of the dropdown, which is neither alphabetical nor logical: K before
// TK, with -/- last. Kept as-is so our dropdown matches Coretax's.
export const PTKP_OPTIONS: { value: PtkpStatus; label: string }[] = [
	{ value: 'k_0', label: 'K/0' },
	{ value: 'k_1', label: 'K/1' },
	{ value: 'k_2', label: 'K/2' },
	{ value: 'k_3', label: 'K/3' },
	{ value: 'k_i_0', label: 'K/I/0' },
	{ value: 'k_i_1', label: 'K/I/1' },
	{ value: 'k_i_2', label: 'K/I/2' },
	{ value: 'k_i_3', label: 'K/I/3' },
	{ value: 'tk_0', label: 'TK/0' },
	{ value: 'tk_1', label: 'TK/1' },
	{ value: 'tk_2', label: 'TK/2' },
	{ value: 'tk_3', label: 'TK/3' },
	{ value: 'tidak_berlaku', label: '-/-' }
];

// UU HPP progressive brackets. All five confirmed to the rupiah against the live
// form at three different PKP values, including the 35% band.
const BRACKETS: { batas: number; tarif: number }[] = [
	{ batas: 60_000_000, tarif: 0.05 },
	{ batas: 250_000_000, tarif: 0.15 },
	{ batas: 500_000_000, tarif: 0.25 },
	{ batas: 5_000_000_000, tarif: 0.3 },
	{ batas: Infinity, tarif: 0.35 }
];

export function hitungPtkp(status: PtkpStatus | null | undefined) {
	return status ? PTKP[status] : 0;
}

export function hitungPphTerutang(penghasilanKenaPajak: number) {
	let sisa = Math.max(0, penghasilanKenaPajak);
	let batasBawah = 0;
	let pph = 0;

	for (const { batas, tarif } of BRACKETS) {
		if (sisa <= 0) break;
		const kena = Math.min(sisa, batas - batasBawah);
		pph += kena * tarif;
		sisa -= kena;
		batasBawah = batas;
	}

	return Math.round(pph);
}

export interface HitungIndukInput {
	// Rows 1a to 1d, each fed from a lampiran. Zero until that lampiran exists.
	n1a: number;
	n1b: number;
	n1c: number;
	n1d: number;

	// Row 3, fed from L-5 A (tahun pajak ini column) plus L-5 B.
	c3AdaPengurangPenghasilanNeto: boolean;
	n3: number;

	c5PtkpStatus: PtkpStatus | null | undefined;

	// Row 8, fed from L-5 C.
	c8AdaPengurangPphTerutang: boolean;
	n8: number;

	// Row 10a, fed from L-1 E JUMLAH BAGIAN E, which itself already includes the
	// kredit pajak luar negeri imported from L-2 C.
	d10aAdaPphDipotongPihakLain: boolean;
	n10a: number;
	d10bAngsuranPph25: number;
	d10cStpPph25: number;
	d10dAdaPengembalianKreditLuarNegeri: boolean;
	d10dJumlah: number;

	e11bAdaSkPengangsuranPenundaan: boolean;
	e11bJumlah: number;

	// Row 12a, carried from the SPT being amended. 0 on a normal return.
	f12a: number;

	// When set, this SPT is PH/MT (row 7's a7StatusKewajibanSuamiIstri is 'ph'
	// or 'mt') and L-4 Section B's WP-share PPh Terutang overrides the normal
	// bracket calculation for rows 6/7: row 6 goes to 0 and row 7 takes this
	// value directly, instead of hitungPphTerutang(n6). Measured on the live
	// form, see docs/ui-reference/coretax/spt-1770-lampiran/L4.md's "Section B
	// feeds back into Induk's PPh Terutang chain". Confirmed on exactly two
	// cases (PTKP gabungan unset, then K/I/0) with the WP-share value from
	// hitungLampiranL4SectionB matching row 7 to the rupiah both times, and
	// propagating correctly through row 9/11a; not exhaustively fuzzed, but
	// the mechanism (row 6 bypassed to 0, row 7 sourced from Section B) is
	// solid.
	phMtOverride?: { pphDitanggungWp: number };
}

export function hitungInduk(input: HitungIndukInput) {
	const n2 = input.n1a + input.n1b + input.n1c + input.n1d;

	const n3 = input.c3AdaPengurangPenghasilanNeto ? input.n3 : 0;
	const n4 = n2 - n3;

	const n5 = hitungPtkp(input.c5PtkpStatus);

	// Row 6 rounds DOWN to the nearest 1.000 (pembulatan ke bawah ribuan penuh)
	// and floors at 0. Both confirmed by measurement: 601.527.777 - 63.000.000
	// displays as 538.527.000, and an income below PTKP displays 0 rather than a
	// negative. Getting either wrong makes every downstream figure drift.
	// PH/MT override: row 6 is bypassed to 0 and row 7 is sourced directly from
	// L-4 Section B's WP-share PPh Terutang instead of the normal bracket
	// formula. See phMtOverride's doc comment on HitungIndukInput above.
	const n6 = input.phMtOverride ? 0 : Math.max(0, Math.floor((n4 - n5) / 1000) * 1000);

	const n7 = input.phMtOverride ? input.phMtOverride.pphDitanggungWp : hitungPphTerutang(n6);

	const n8 = input.c8AdaPengurangPphTerutang ? input.n8 : 0;
	const n9 = n7 - n8;

	const n10a = input.d10aAdaPphDipotongPihakLain ? input.n10a : 0;
	const n10d = input.d10dAdaPengembalianKreditLuarNegeri ? input.d10dJumlah : 0;

	// Note 10d is ADDED back, not subtracted: it is a refund of foreign tax credit
	// previously claimed. Formula as printed on the form.
	const n11a = n9 - n10a - input.d10bAngsuranPph25 - input.d10cStpPph25 + n10d;

	const n11b = input.e11bAdaSkPengangsuranPenundaan ? input.e11bJumlah : 0;
	const n11c = n11a - n11b;

	const n12b = n11a - input.f12a;

	// Drives which of sections F and G apply, and is displayed as a chip.
	const statusSpt: 'nihil' | 'kurang_bayar' | 'lebih_bayar' =
		n11a === 0 ? 'nihil' : n11a > 0 ? 'kurang_bayar' : 'lebih_bayar';

	// 13a's hint states the formula outright: 1/12 x ((9) - (10)(a)).
	const angsuranPph25TahunDepan = Math.round((n9 - n10a) / 12);

	return {
		n2,
		n3,
		n4,
		n5,
		n6,
		n7,
		n8,
		n9,
		n10a,
		n10d,
		n11a,
		n11b,
		n11c,
		n12b,
		statusSpt,
		angsuranPph25TahunDepan
	};
}

// L-4 Bagian A: PENGHITUNGAN ANGSURAN PPh PASAL 25 TAHUN PAJAK BERIKUTNYA.
// Measured against two real cases on the live form (see
// docs/ui-reference/coretax/spt-1770-lampiran/L4.md) — a separate, smaller
// computation chain from hitungInduk above, but reusing the same PTKP table
// and bracket function since both ultimately apply the UU HPP schedule.
export interface HitungLampiranL4Input {
	penghasilanNeto: number;
	kompensasiKerugian: number;
	zakatSumbangan: number;
	ptkpStatus: PtkpStatus | null | undefined;
	pengurangPphTerutang: number;
	kreditPajak: number;
}

export function hitungLampiranL4(input: HitungLampiranL4Input) {
	const jumlahPenghasilanNeto =
		input.penghasilanNeto - input.kompensasiKerugian - input.zakatSumbangan;

	const ptkpNilai = hitungPtkp(input.ptkpStatus);

	// Mirrors Induk row 6's floor-to-nearest-1.000 (see hitungInduk's n6 comment
	// above). Both measured L-4 cases happened to already be exact multiples of
	// 1.000, so this floor is unconfirmed for L-4 specifically — applied here
	// for consistency with Induk, pending a future capture with a non-round PKP.
	const penghasilanKenaPajak = Math.max(0, Math.floor((jumlahPenghasilanNeto - ptkpNilai) / 1000) * 1000);

	const pajakTerutang = hitungPphTerutang(penghasilanKenaPajak);

	const pphYangHarusDibayar = pajakTerutang - input.pengurangPphTerutang - input.kreditPajak;

	// Induk's own angsuranPph25TahunDepan uses Math.round, not truncation. The
	// one measured L-4 value (118.870.833 from 118.870.833,33) is consistent
	// with either Math.round or Math.floor since the fractional part was .33;
	// Math.round is chosen to match Induk's own convention, unconfirmed for a
	// case where the two would actually differ.
	const angsuranPph25 = Math.round(pphYangHarusDibayar / 12);

	return {
		jumlahPenghasilanNeto,
		penghasilanKenaPajak,
		pajakTerutang,
		pphYangHarusDibayar,
		angsuranPph25
	};
}

// L-4 Bagian B: PENGHITUNGAN PPh TERUTANG WAJIB PAJAK DAN SUAMI/ISTRI. Gated
// on Induk row 7 (a7StatusKewajibanSuamiIstri) being 'ph' or 'mt', a
// different gate from Bagian A's (Induk 13b). Measured against two real
// cases on the live form (see docs/ui-reference/coretax/spt-1770-lampiran/
// L4.md's "Section B fields, in order" and "Measured test cases").
export interface HitungLampiranL4SectionBInput {
	// WP's "Penghasilan Neto" and "...setelah dikurangi..." cells both mirror
	// Induk row 4 (n4 from hitungInduk above) — WP has no zakat/kompensasi
	// inputs of its own in this section to subtract, so the same value feeds
	// both. Threaded in as a prop rather than re-derived here.
	netoWp: number;
	// Suami/Istri's "...setelah dikurangi zakat/sumbangan keagamaan wajib dan
	// kompensasi kerugian" cell. This is the field that actually feeds the
	// gabungan sum, NOT the plain "Penghasilan Neto (Suami/Istri)" cell above
	// it (that one is captured but never referenced by any formula here).
	setelahDikurangiSuamiIstri: number;
	ptkpGabunganStatus: PtkpStatus | null | undefined;
}

export function hitungLampiranL4SectionB(input: HitungLampiranL4SectionBInput) {
	const netoGabungan = input.netoWp + input.setelahDikurangiSuamiIstri;

	const ptkpGabunganNilai = hitungPtkp(input.ptkpGabunganStatus);

	// Confirmed exact on the live form's two test cases with no floor/rounding
	// applied (800.000.000 - 112.500.000 = 687.500.000 to the rupiah), unlike
	// Induk row 6 and L-4 Bagian A's penghasilanKenaPajak which both floor to
	// the nearest 1.000. Both measured cases here also happened to already be
	// round millions, so a hidden floor can't be ruled out either way; kept
	// unfloored since that is what the doc's formula literally states.
	const penghasilanKenaPajakGabungan = Math.max(0, netoGabungan - ptkpGabunganNilai);

	const pphTerutangGabungan = hitungPphTerutang(penghasilanKenaPajakGabungan);

	// Proportional split by each spouse's share of neto gabungan. Confirmed
	// exact on both measured cases (75%/25% split in both). Guards against a
	// zero neto gabungan (e.g. before any input is filled) to avoid NaN.
	const wpShare = netoGabungan > 0 ? input.netoWp / netoGabungan : 0;
	const pphDitanggungWp = Math.round(pphTerutangGabungan * wpShare);
	const pphDitanggungSuamiIstri = pphTerutangGabungan - pphDitanggungWp;

	return {
		netoGabungan,
		ptkpGabunganNilai,
		penghasilanKenaPajakGabungan,
		pphTerutangGabungan,
		pphDitanggungWp,
		pphDitanggungSuamiIstri
	};
}
