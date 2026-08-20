// Induk + L-4 computation chains for SPT 1770.
//
// Provenance: the rules below are transcribed from the deployed Coretax
// production bundle (chunk 827.1117977ff84ffcd9.js, read 2026-08-19), which is
// the behaviour actually running in the live form. The field-by-field diff that
// produced the current shape of this file is docs/bundle-diff-1770.md; the
// earlier UI measurements in docs/ui-reference/coretax/ agree with it but could
// not distinguish several edge cases, so where the two disagree the bundle wins.
//
// Coretax's own internal field names are quoted in comments so this file can be
// re-checked against a future build: valueC1 = row 2, valueC2 = row 3,
// valueC3 = row 4, valueC5 = row 6, valueC7 = row 7, valueC8 = row 8,
// valueC6 = row 9, valueD1 = row 10a, valueE1 = row 11a, valueH1 = angsuran.

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

// Coretax's calculateTaxExemption / onChangeTaxExemption switch, verbatim. The
// bundle's table also carries HB0-HB3 (same amounts as TK0-TK3) but filters any
// code containing "HB" out of the dropdown, so they are unreachable and omitted.
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

// Coretax applies the schedule as a single "tarif x PKP - pengurang" per band
// rather than accumulating marginal bands. The two are mathematically identical
// (the ladder is continuous at every boundary), but not bit-identical in
// floating point: at PKP 5.446.000.000 this form yields 1.600.099.999,9999998
// where marginal accumulation yields exactly 1.600.100.000. Coretax leaves that
// value unrounded in row 7, so the band form is used here to keep our numbers
// equal to theirs. formatRupiah's toLocaleString renders both as the same digits.
//
// Because the ladder is continuous, a wrong `<` vs `<=` on any band edge is
// invisible in output — do not expect live comparison to validate the bounds.
interface Band {
	batasAtas: number;
	tarif: number;
	pengurang: number;
}

// The one schedule this app applies, for every tahun pajak.
//
// Coretax carries a second, pre-UU-HPP ladder (50jt/5%, four bands, no 35%) and
// picks between them per tahun pajak, inconsistently: L-4 Bagian A's predicate
// was `tahunPajak + 1 < 2022` and Bagian B's `tahunPajak < 2022`, so the two
// disagreed for 2021. Both the second ladder and the predicates were removed on
// 2026-08-20 by decision: this is a training app, the pre-2022 path was never
// exercised, and one table that always applies beats two that disagree. If
// pre-2022 returns ever matter, reinstate from git history rather than guessing
// the old bracket values.
const BANDS: Band[] = [
	{ batasAtas: 60_000_000, tarif: 0.05, pengurang: 0 },
	{ batasAtas: 250_000_000, tarif: 0.15, pengurang: 6_000_000 },
	{ batasAtas: 500_000_000, tarif: 0.25, pengurang: 31_000_000 },
	{ batasAtas: 5_000_000_000, tarif: 0.3, pengurang: 56_000_000 },
	{ batasAtas: Infinity, tarif: 0.35, pengurang: 306_000_000 }
];

function terapkanTarif(penghasilanKenaPajak: number) {
	if (penghasilanKenaPajak < 0) return 0;
	for (const { batasAtas, tarif, pengurang } of BANDS) {
		if (penghasilanKenaPajak <= batasAtas) return tarif * penghasilanKenaPajak - pengurang;
	}
	return 0;
}

export function hitungPtkp(status: PtkpStatus | null | undefined) {
	return status ? PTKP[status] : 0;
}

// Induk row 7 (valueC7). Coretax does NOT round here — it rounds at row 9 — so
// neither do we; see hitungInduk's n9.
//
// Caveat recorded in docs/bundle-diff-1770.md: on the live form the Induk tariff
// is not hardcoded at all. getIncomeTaxPayable fetches reference data
// PIT_TAX_RATE, selects the row whose ValidFrom/ValidTo bracket the end of month
// (TaxYear, AccountingPeriodEnd - 1), and reads Rate/Minus from
// ParameterData.ItemList[0].Rates, falling back to rate 1% / minus 0 when
// nothing matches. That data has never been observed, so the UU HPP schedule is
// hardcoded here as the best available stand-in.
export function hitungPphTerutang(penghasilanKenaPajak: number) {
	return terapkanTarif(penghasilanKenaPajak);
}

// Coretax carries two thousand-roundings that behave differently, and uses each
// in a different place. Both are reproduced rather than unified.

// roundingThousand(), used by L-4 Bagian A row 6 and Bagian B's PKP gabungan:
//   t.toString().length >= 4 && t % 1000 != 0 ? t - t % 1000 : t
// Note the string-length test rather than a magnitude test, which means values
// of 1..999 are returned UNCHANGED instead of being rounded down to 0.
export function pembulatanRibuanL4(nilai: number) {
	return String(nilai).length >= 4 && nilai % 1000 !== 0 ? nilai - (nilai % 1000) : nilai;
}

// getTaxableIncome()'s inline variant, used by Induk row 6:
//   o > 1000 ? o -= o % 1000 : o = 0
// Differs from the above at exactly 1000, which this collapses to 0.
function pembulatanRibuanInduk(nilai: number) {
	return nilai > 1000 ? nilai - (nilai % 1000) : 0;
}

// getIncomeTaxPayableAfterIncomeTaxDeduction()'s rounding:
//   Math.floor(o) + (o % 1 >= .5 ? 1 : 0)
// Half-up on positives. Kept as written rather than swapped for Math.round,
// which differs on negatives — the input is clamped at 0 first, so in practice
// they agree, but the clamp is the reason, not the rounding.
function pembulatanSetengahKeAtas(nilai: number) {
	return Math.floor(nilai) + (nilai % 1 >= 0.5 ? 1 : 0);
}

// get numberOfMonth(): the accounting period length, wrapping across a year end.
//   s <= e ? e - s + 1 : 12 - s + (e - 1) + 2
export function hitungJumlahBulan(bulanMulai: number, bulanSelesai: number) {
	const s = Number(bulanMulai);
	const e = Number(bulanSelesai);
	if (!s || !e) return 12;
	return s <= e ? e - s + 1 : 12 - s + (e - 1) + 2;
}

export interface HitungIndukInput {
	// Rows 1a to 1d, each fed from a lampiran. Zero until that lampiran exists.
	// Each arrives already gated on its own Ya/Tidak answer where Coretax gates
	// it — see +page.svelte, which mirrors chkB1A's explicit else-zero.
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

	// Periode pembukuan, driving the angsuran divisor. Coretax divides by the
	// period length, not by a fixed 12; the 13a hint text on the live form is
	// literally built as "Angsuran PPh Pasal 25 adalah 1/" + numberOfMonth +
	// " x ((9) - (10)(a))". Defaults to a full year when unset.
	bulanMulai?: number;
	bulanSelesai?: number;

	// When set, this SPT is PH/MT (row 7's a7StatusKewajibanSuamiIstri is 'ph'
	// or 'mt') and L-4 Section B's WP-share PPh Terutang overrides the normal
	// bracket calculation: row 6 goes to 0 and row 7 takes this value directly.
	// Coretax: valueC5 = 0 plus a locked PTKP dropdown in getTaxableIncome, and
	// valueC7 = L4Form.IncomeTaxPaybleHusband in getIncomeTaxPayable. Verified
	// live 2026-08-19 — row 7 read 0 while Bagian B's gabungan and spouse shares
	// both read 22.950.000, which rules out those two as the source.
	phMtOverride?: { pphDitanggungWp: number };
}

export function hitungInduk(input: HitungIndukInput) {
	const n2 = input.n1a + input.n1b + input.n1c + input.n1d;

	const n3 = input.c3AdaPengurangPenghasilanNeto ? input.n3 : 0;
	const n4 = n2 - n3;

	// PH/MT lock the PTKP dropdown and force row 5 to 0, so a stale selection
	// cannot leak into the calculation.
	const n5 = input.phMtOverride ? 0 : hitungPtkp(input.c5PtkpStatus);

	// Row 6 floors at 0 and rounds down to the nearest 1.000, with Coretax's own
	// edge case at exactly 1.000 (see pembulatanRibuanInduk). PH/MT bypasses the
	// row entirely.
	const n6 = input.phMtOverride ? 0 : pembulatanRibuanInduk(Math.max(0, n4 - n5));

	const n7Awal = input.phMtOverride
		? input.phMtOverride.pphDitanggungWp
		: hitungPphTerutang(n6);

	const n8 = input.c8AdaPengurangPphTerutang ? input.n8 : 0;

	// Row 9 clamps at 0 before rounding — row 8 exceeding row 7 yields 0, not a
	// negative. Coretax then back-writes row 7 to 0 whenever row 9 lands on 0.
	const n9 = pembulatanSetengahKeAtas(Math.max(0, n7Awal - n8));
	const n7 = n9 === 0 ? 0 : n7Awal;

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

	// valueH1 = Math.round(1 / numberOfMonth * (C6 < D1 ? 0 : C6 - D1)). Numerator
	// clamped at 0, divisor is the period length rather than a fixed 12.
	const jumlahBulan = hitungJumlahBulan(input.bulanMulai ?? 1, input.bulanSelesai ?? 12);
	// Written as (1 / n) * x, not x / n, to match getArticle25IncomeTaxInstallment
	// bit for bit; the two can differ in the last place.
	const angsuranPph25TahunDepan = Math.round((1 / jumlahBulan) * Math.max(0, n9 - n10a));

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
		jumlahBulan,
		angsuranPph25TahunDepan
	};
}

// L-3A-4 Bagian A: PENGHASILAN NETO DALAM NEGERI DARI USAHA DAN/ATAU PEKERJAAN
// BEBAS BERDASARKAN PENCATATAN (Norma / NPPN). Feeds Induk row 1.b.1 when 1.b.3
// = Norma, via TotalNetIncome.
//
// This was long assumed unimplementable for want of an NPPN percentage table.
// The bundle shows there is no such table: NORMA (%) is the one ENABLED field in
// the row dialog (`Norm`, required, > 0, <= 100) and the taxpayer types it. The
// other four columns are disabled and generated from L-3B Bagian C:
//
//   addDataL3bTableCToL3A4TableA(rows) {
//     const existingNorm = new Map(grid1.map(r => [r.NameOfBusinessType, r.Norm]));
//     rows.forEach(T => {
//       const bruto = T.January + T.February + ... + T.December;
//       const norm  = existingNorm.get(T.Address) ?? 0;
//       push({ NameOfBusinessType: T.Address, BusinessProfessionType: T.BusinessProfessionType,
//              GrossIncome: bruto, Norm: norm,
//              NetIncome: norm !== 0 ? bruto * (norm / 100) : 0 });
//     });
//   }
//
// Note the Norm is re-keyed by name on every regeneration, so editing L-3B C
// does not lose it. Rounding: setGrid1DataMap stores Math.round(NetIncome), and
// setGridValue then patches TotalNetIncome as Math.round(Grid1TotalNetIncome).
//
// One structural difference: Coretax carries one row per registered TKU, keyed on
// the L-3B row's `Address`. We model a single TKU (see the note on
// spt_pph_orang_pribadi_lampiran_3b_tku), so the key is 1:1 and the norma is held
// on that registry row. Written row-wise anyway so multiple TKUs need no rewrite.
export interface BarisNormaL3A4 {
	namaUsaha: string;
	jenisUsahaPekerjaanBebas: string;
	peredaranBruto: number;
	normaPersen: number;
}

export function hitungLampiranL3A4BagianA(baris: BarisNormaL3A4[]) {
	const rows = baris.map((row) => {
		const bruto = Number(row.peredaranBruto) || 0;
		const norma = Number(row.normaPersen) || 0;
		return {
			namaUsaha: row.namaUsaha,
			jenisUsahaPekerjaanBebas: row.jenisUsahaPekerjaanBebas,
			peredaranBruto: bruto,
			normaPersen: norma,
			// `norm !== 0 ? bruto * (norm / 100) : 0`, rounded as setGrid1DataMap does.
			penghasilanNeto: norma !== 0 ? Math.round(bruto * (norma / 100)) : 0
		};
	});

	return {
		rows,
		totalPeredaranBruto: rows.reduce((s, r) => s + r.peredaranBruto, 0),
		totalPenghasilanNeto: Math.round(rows.reduce((s, r) => s + r.penghasilanNeto, 0))
	};
}

// L-4 Bagian A: PENGHITUNGAN ANGSURAN PPh PASAL 25 TAHUN PAJAK BERIKUTNYA.
// Gated on Induk 13b (chkH2). A separate, smaller chain from hitungInduk, with
// its own PTKP selection and its own thousand-rounding.
export interface HitungLampiranL4Input {
	penghasilanNeto: number;
	kompensasiKerugian: number;
	zakatSumbangan: number;
	ptkpStatus: PtkpStatus | null | undefined;
	pengurangPphTerutang: number;
	kreditPajak: number;
	// PH/MT disables this section's PTKP dropdown outright
	// (isTaxExemptionDisabled), leaving row 5 at 0 — the joint PTKP is claimed in
	// Bagian B instead.
	phMt?: boolean;
}

export function hitungLampiranL4(input: HitungLampiranL4Input) {
	// Coretax clamps this at 0 (calculateL4A4: t >= 0 ? t : 0).
	const jumlahPenghasilanNeto = Math.max(
		0,
		input.penghasilanNeto - input.kompensasiKerugian - input.zakatSumbangan
	);

	const ptkpNilai = input.phMt ? 0 : hitungPtkp(input.ptkpStatus);

	const penghasilanKenaPajak = pembulatanRibuanL4(Math.max(0, jumlahPenghasilanNeto - ptkpNilai));

	// Unrounded, like Induk row 7 and unlike Bagian B's row 20.
	const pajakTerutang = terapkanTarif(penghasilanKenaPajak);

	// calculateL4A9: max(0, V7 - V23 - V8). Kredit pajak exceeding the tax due
	// yields 0, not a negative.
	const pphYangHarusDibayar = Math.max(
		0,
		pajakTerutang - input.pengurangPphTerutang - input.kreditPajak
	);

	// calculateL4A10 is Math.round(V9 * 0.08333333333333333). That literal is the
	// double nearest 1/12, so it is equivalent to / 12 (checked over 400k random
	// values); unlike Induk's angsuran this one is always a twelfth, never the
	// accounting-period length.
	const angsuranPph25 = Math.round(pphYangHarusDibayar / 12);

	return {
		jumlahPenghasilanNeto,
		ptkpNilai,
		penghasilanKenaPajak,
		pajakTerutang,
		pphYangHarusDibayar,
		angsuranPph25
	};
}

// L-4 Bagian B: PENGHITUNGAN PPh TERUTANG WAJIB PAJAK DAN SUAMI/ISTRI. Gated on
// Induk row 7 (a7StatusKewajibanSuamiIstri) being 'ph' or 'mt'
// (IsL4SectionBRequired), a different gate from Bagian A's.
export interface HitungLampiranL4SectionBInput {
	// Coretax patches Value15 from netIncomeSummary, which is Induk row 4
	// (valueC3). The WP's plain "Penghasilan Neto" cell above it is Value13 from
	// annualNetIncome = Induk row 2 (valueC1) — a different row, and one no
	// formula reads; see netoWpTampilan in _L4.svelte.
	netoWp: number;
	// Suami/Istri's "...setelah dikurangi zakat/sumbangan keagamaan wajib dan
	// kompensasi kerugian" cell (Value16). This is the field that feeds the
	// gabungan sum, NOT the plain "Penghasilan Neto (Suami/Istri)" cell above it.
	setelahDikurangiSuamiIstri: number;
	ptkpGabunganStatus: PtkpStatus | null | undefined;
}

export function hitungLampiranL4SectionB(input: HitungLampiranL4SectionBInput) {
	const netoGabungan = input.netoWp + input.setelahDikurangiSuamiIstri;

	const ptkpGabunganNilai = hitungPtkp(input.ptkpGabunganStatus);

	// calculateL4B6 rounds down to the nearest 1.000 exactly as Bagian A does.
	// The older note here claimed the live form applied no rounding; both cases
	// it was based on were round millions and could not tell the two apart, and
	// the bundle settles it.
	const penghasilanKenaPajakGabungan = pembulatanRibuanL4(
		Math.max(0, netoGabungan - ptkpGabunganNilai)
	);

	// calculationIncomeTaxPaybleL4B rounds each band and clamps at 0, unlike
	// Bagian A's unrounded equivalent.
	const pphTerutangGabungan = Math.max(
		0,
		Math.round(terapkanTarif(penghasilanKenaPajakGabungan))
	);

	// calculateL4B8 / calculateL4B9. Three branches beyond the plain
	// proportional split:
	//   - spouse neto <= 0  -> the whole PPh gabungan falls on the WP, no ratio
	//   - WP neto < 0       -> WP share is 0
	//   - spouse neto < 0   -> spouse share is 0, NOT gabungan minus WP share
	// Without them, a negative spouse neto makes the ratio exceed 1, pushing the
	// WP share above the PPh gabungan and the spouse share negative.
	let pphDitanggungWp = 0;
	if (input.netoWp >= 0) {
		if (input.setelahDikurangiSuamiIstri > 0 && netoGabungan !== 0) {
			pphDitanggungWp = Math.round((input.netoWp / netoGabungan) * pphTerutangGabungan);
		} else if (input.setelahDikurangiSuamiIstri <= 0) {
			pphDitanggungWp = pphTerutangGabungan;
		}
	}

	const pphDitanggungSuamiIstri =
		input.setelahDikurangiSuamiIstri >= 0 ? pphTerutangGabungan - pphDitanggungWp : 0;

	return {
		netoGabungan,
		ptkpGabunganNilai,
		penghasilanKenaPajakGabungan,
		pphTerutangGabungan,
		pphDitanggungWp,
		pphDitanggungSuamiIstri
	};
}
