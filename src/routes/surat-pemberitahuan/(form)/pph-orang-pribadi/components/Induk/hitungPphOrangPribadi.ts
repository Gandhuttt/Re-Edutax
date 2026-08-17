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
	const n6 = Math.max(0, Math.floor((n4 - n5) / 1000) * 1000);

	const n7 = hitungPphTerutang(n6);

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
