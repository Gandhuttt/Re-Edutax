// Checks the Induk tax engine against the figures measured on the live Coretax
// form. Every "want" below is a number read off the real form, recorded in
// docs/ui-reference/coretax/spt-1770-induk/COMPUTATION.md, not a value derived
// from our own implementation. If one of these fails, the engine has drifted
// from the system it mirrors.
//
//   npx tsx 'src/routes/surat-pemberitahuan/(form)/pph-orang-pribadi/components/Induk/hitungPphOrangPribadi.check.ts'
//
// The repo has no test runner, so this is a standalone script rather than a
// spec, run with the same tsx that db:seed uses.
import { hitungPphTerutang, hitungInduk, hitungLampiranL3A4BagianA, hitungLampiranL4, hitungLampiranL4SectionB, pembulatanRibuanL4, PTKP } from './hitungPphOrangPribadi';

let fail = 0;
const eq = (label: string, got: number, want: number) => {
  const ok = got === want;
  if (!ok) fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}: got ${got.toLocaleString('id-ID')} want ${want.toLocaleString('id-ID')}`);
};

// Tariff, the three measured PKP points
eq('tariff @ 538.527.000', hitungPphTerutang(538_527_000), 105_558_100);
eq('tariff @ 9.950.750.000', hitungPphTerutang(9_950_750_000), 3_176_762_500);
eq('tariff @ 950.750.000', hitungPphTerutang(950_750_000), 229_225_000);

// PTKP spot checks
eq('PTKP K/1', PTKP.k_1, 63_000_000);
eq('PTKP K/I/3', PTKP.k_i_3, 126_000_000);
eq('PTKP -/-', PTKP.tidak_berlaku, 0);

// Full chain, the end-to-end measurement in COMPUTATION.md
const base = {
  c3AdaPengurangPenghasilanNeto: true, c8AdaPengurangPphTerutang: true,
  d10aAdaPphDipotongPihakLain: true, d10bAngsuranPph25: 0, d10cStpPph25: 0,
  d10dAdaPengembalianKreditLuarNegeri: false, d10dJumlah: 0,
  e11bAdaSkPengangsuranPenundaan: false, e11bJumlah: 0, f12a: 0,
};
const r = hitungInduk({ ...base, n1a: 600_750_000, n1b: 0, n1c: 111_111, n1d: 888_888,
  n3: 222_222, c5PtkpStatus: 'k_1', n8: 333_333, n10a: 77_865 });
eq('row 2', r.n2, 601_749_999);
eq('row 4', r.n4, 601_527_777);
eq('row 5', r.n5, 63_000_000);
eq('row 6 (round down 1000)', r.n6, 538_527_000);
eq('row 7', r.n7, 105_558_100);
eq('row 9', r.n9, 105_224_767);

// BEHAVIOR.md chain B: no PTKP selected, row 6 floors/rounds
const b = hitungInduk({ ...base, n1a: 750_000, n1b: 0, n1c: 111_111, n1d: 888_888,
  n3: 222_222, c5PtkpStatus: null, n8: 0, n10a: 0 });
eq('chain B row 2', b.n2, 1_749_999);
eq('chain B row 4', b.n4, 1_527_777);
eq('chain B row 6', b.n6, 1_527_000);

// Row 6 floors at 0 when income is below PTKP
const f = hitungInduk({ ...base, n1a: 1_527_777, n1b: 0, n1c: 0, n1d: 0,
  n3: 0, c5PtkpStatus: 'tk_2', n8: 0, n10a: 0 });
eq('row 6 floor at 0', f.n6, 0);
eq('row 7 follows at 0', f.n7, 0);

// L-4 Bagian B, both measured test cases from L4.md
const l4bNoPtkp = hitungLampiranL4SectionB({
  netoWp: 600_000_000, setelahDikurangiSuamiIstri: 200_000_000, ptkpGabunganStatus: null,
});
eq('L4B neto gabungan', l4bNoPtkp.netoGabungan, 800_000_000);
eq('L4B PKP gabungan (no PTKP)', l4bNoPtkp.penghasilanKenaPajakGabungan, 800_000_000);
eq('L4B PPh gabungan (no PTKP)', l4bNoPtkp.pphTerutangGabungan, 184_000_000);
eq('L4B PPh WP (no PTKP)', l4bNoPtkp.pphDitanggungWp, 138_000_000);
eq('L4B PPh Suami/Istri (no PTKP)', l4bNoPtkp.pphDitanggungSuamiIstri, 46_000_000);

const l4bKi0 = hitungLampiranL4SectionB({
  netoWp: 600_000_000, setelahDikurangiSuamiIstri: 200_000_000, ptkpGabunganStatus: 'k_i_0',
});
eq('L4B PKP gabungan (K/I/0)', l4bKi0.penghasilanKenaPajakGabungan, 687_500_000);
eq('L4B PPh gabungan (K/I/0)', l4bKi0.pphTerutangGabungan, 150_250_000);
eq('L4B PPh WP (K/I/0)', l4bKi0.pphDitanggungWp, 112_687_500);
eq('L4B PPh Suami/Istri (K/I/0)', l4bKi0.pphDitanggungSuamiIstri, 37_562_500);


// ---------------------------------------------------------------------------
// Cases below come from the bundle diff (docs/bundle-diff-1770.md), not from UI
// measurement: each "want" is what chunk 827.1117977ff84ffcd9.js computes. They
// cover the edges the two UI captures could not distinguish.
// ---------------------------------------------------------------------------
console.log('\n--- bundle-diff cases ---');

// A1 — Bagian B floors PKP gabungan to the nearest 1.000 (calculateL4B6).
const a1 = hitungLampiranL4SectionB({
  netoWp: 150_000_000, setelahDikurangiSuamiIstri: 100_000_777,
  ptkpGabunganStatus: 'k_i_0', tahunPajak: 2025,
});
eq('A1 PKP gabungan floored', a1.penghasilanKenaPajakGabungan, 137_500_000);
eq('A1 PPh gabungan', a1.pphTerutangGabungan, 14_625_000);
eq('A1 PPh WP', a1.pphDitanggungWp, 8_774_973);
eq('A1 PPh Suami/Istri', a1.pphDitanggungSuamiIstri, 5_850_027);

// A2 — spouse neto <= 0 puts the whole PPh gabungan on the WP (calculateL4B8),
// and spouse neto < 0 forces the spouse share to 0 (calculateL4B9).
const a2 = hitungLampiranL4SectionB({
  netoWp: 400_000_000, setelahDikurangiSuamiIstri: -100_000_000,
  ptkpGabunganStatus: 'k_i_0', tahunPajak: 2025,
});
eq('A2 PPh gabungan', a2.pphTerutangGabungan, 22_125_000);
eq('A2 PPh WP takes all', a2.pphDitanggungWp, 22_125_000);
eq('A2 PPh Suami/Istri forced 0', a2.pphDitanggungSuamiIstri, 0);

const a2b = hitungLampiranL4SectionB({
  netoWp: 400_000_000, setelahDikurangiSuamiIstri: 0,
  ptkpGabunganStatus: 'k_i_0', tahunPajak: 2025,
});
eq('A2 spouse exactly 0 -> WP takes all', a2b.pphDitanggungWp, a2b.pphTerutangGabungan);
eq('A2 spouse exactly 0 -> spouse 0', a2b.pphDitanggungSuamiIstri, 0);

const a2c = hitungLampiranL4SectionB({
  netoWp: -50_000_000, setelahDikurangiSuamiIstri: 300_000_000,
  ptkpGabunganStatus: null, tahunPajak: 2025,
});
eq('A2 WP neto < 0 -> WP share 0', a2c.pphDitanggungWp, 0);

// A3 — the two thousand-roundings differ at their edges. roundingThousand
// returns 1..999 unchanged (string-length test); Induk row 6 collapses exactly
// 1000 to 0.
eq('A3 L-4 keeps 999', pembulatanRibuanL4(999), 999);
eq('A3 L-4 floors 1500', pembulatanRibuanL4(1_500), 1_000);
eq('A3 L-4 leaves 1000', pembulatanRibuanL4(1_000), 1_000);
const a3 = hitungInduk({ ...base, n1a: 54_001_000, n1b: 0, n1c: 0, n1d: 0,
  n3: 0, c5PtkpStatus: 'tk_0', n8: 0, n10a: 0 });
eq('A3 Induk row 6 collapses exactly 1000', a3.n6, 0);

// A4 — row 9 clamps at 0 and back-writes row 7 to 0.
const a4 = hitungInduk({ ...base, n1a: 100_000_000, n1b: 0, n1c: 0, n1d: 0,
  n3: 0, c5PtkpStatus: 'k_3', n8: 999_000_000, n10a: 0 });
eq('A4 row 9 clamped at 0', a4.n9, 0);
eq('A4 row 7 back-written to 0', a4.n7, 0);

// A5 — Bagian A's PPh yang harus dibayar clamps at 0, and A4's total neto too.
const a5 = hitungLampiranL4({
  penghasilanNeto: 367_000_500, kompensasiKerugian: 0, zakatSumbangan: 0,
  ptkpStatus: 'tk_0', pengurangPphTerutang: 250_000, kreditPajak: 70_000_000,
  tahunPajak: 2025,
});
eq('A5 PKP floored', a5.penghasilanKenaPajak, 313_000_000);
eq('A5 pajak terutang', a5.pajakTerutang, 47_250_000);
eq('A5 harus dibayar clamped', a5.pphYangHarusDibayar, 0);
eq('A5 angsuran follows at 0', a5.angsuranPph25, 0);

const a5b = hitungLampiranL4({
  penghasilanNeto: 0, kompensasiKerugian: 0, zakatSumbangan: 5_000_000,
  ptkpStatus: 'k_1', pengurangPphTerutang: 0, kreditPajak: 0, tahunPajak: 2025,
});
eq('A5 total neto clamped at 0', a5b.jumlahPenghasilanNeto, 0);

// A5 baseline, no credits: the whole Bagian A chain.
const a5c = hitungLampiranL4({
  penghasilanNeto: 367_000_500, kompensasiKerugian: 0, zakatSumbangan: 0,
  ptkpStatus: 'tk_0', pengurangPphTerutang: 0, kreditPajak: 0, tahunPajak: 2025,
});
eq('A5 baseline PKP', a5c.penghasilanKenaPajak, 313_000_000);
eq('A5 baseline pajak terutang', a5c.pajakTerutang, 47_250_000);
eq('A5 baseline angsuran (round, not floor)', a5c.angsuranPph25, 3_937_500);

// A5 rounding: Math.round on the angsuran, where floor would differ.
const a5d = hitungLampiranL4({
  penghasilanNeto: 28_000_000, kompensasiKerugian: 0, zakatSumbangan: 0,
  ptkpStatus: 'tidak_berlaku', pengurangPphTerutang: 0, kreditPajak: 0,
  tahunPajak: 2025,
});
eq('A5 angsuran rounds half up (116.666,67)', a5d.angsuranPph25, 116_667);

// B2 — PH/MT pins Bagian A's PTKP to 0 even with a status still selected.
const b2 = hitungLampiranL4({
  penghasilanNeto: 367_000_500, kompensasiKerugian: 0, zakatSumbangan: 0,
  ptkpStatus: 'tk_0', pengurangPphTerutang: 0, kreditPajak: 0,
  tahunPajak: 2025, phMt: true,
});
eq('B2 PTKP pinned to 0 on PH/MT', b2.ptkpNilai, 0);
eq('B2 PKP ignores the selection', b2.penghasilanKenaPajak, 367_000_000);

// A6 — angsuran divides by the accounting-period length, clamped at 0.
const a6full = hitungInduk({ ...base, n1a: 500_000_000, n1b: 0, n1c: 0, n1d: 0,
  n3: 0, c5PtkpStatus: 'tk_0', n8: 0, n10a: 0, bulanMulai: 1, bulanSelesai: 12 });
eq('A6 jumlah bulan (full year)', a6full.jumlahBulan, 12);
eq('A6 row 9', a6full.n9, 80_500_000);
 eq('A6 angsuran /12 (80.500.000/12)', a6full.angsuranPph25TahunDepan, 6_708_333);

const a6part = hitungInduk({ ...base, n1a: 500_000_000, n1b: 0, n1c: 0, n1d: 0,
  n3: 0, c5PtkpStatus: 'tk_0', n8: 0, n10a: 0, bulanMulai: 4, bulanSelesai: 9 });
eq('A6 jumlah bulan (Apr-Sep)', a6part.jumlahBulan, 6);
eq('A6 angsuran /6 (80.500.000/6)', a6part.angsuranPph25TahunDepan, 13_416_667);

const a6wrap = hitungInduk({ ...base, n1a: 500_000_000, n1b: 0, n1c: 0, n1d: 0,
  n3: 0, c5PtkpStatus: 'tk_0', n8: 0, n10a: 0, bulanMulai: 10, bulanSelesai: 3 });
eq('A6 jumlah bulan wraps year end (Oct-Mar)', a6wrap.jumlahBulan, 6);

const a6neg = hitungInduk({ ...base, n1a: 100_000_000, n1b: 0, n1c: 0, n1d: 0,
  n3: 0, c5PtkpStatus: 'tk_0', n8: 0, n10a: 999_000_000 });
eq('A6 angsuran numerator clamped at 0', a6neg.angsuranPph25TahunDepan, 0);

// A7 — pre-2022 schedule, and the one-year offset between the two predicates.
// Bagian A switches on tahunPajak + 1 < 2022, Bagian B on tahunPajak < 2022, so
// 2021 legitimately disagrees between the sections. PKP 100.000.000:
//   UU HPP      -> 15% x 100jt - 6jt  = 9.000.000
//   pre-UU HPP  -> 15% x 100jt - 5jt  = 10.000.000
const a7a2020 = hitungLampiranL4({
  penghasilanNeto: 100_000_000, kompensasiKerugian: 0, zakatSumbangan: 0,
  ptkpStatus: 'tidak_berlaku', pengurangPphTerutang: 0, kreditPajak: 0,
  tahunPajak: 2020,
});
eq('A7 Bagian A 2020 uses pre-HPP', a7a2020.pajakTerutang, 10_000_000);
const a7a2021 = hitungLampiranL4({
  penghasilanNeto: 100_000_000, kompensasiKerugian: 0, zakatSumbangan: 0,
  ptkpStatus: 'tidak_berlaku', pengurangPphTerutang: 0, kreditPajak: 0,
  tahunPajak: 2021,
});
eq('A7 Bagian A 2021 uses HPP (2021+1 = 2022)', a7a2021.pajakTerutang, 9_000_000);
const a7b2021 = hitungLampiranL4SectionB({
  netoWp: 100_000_000, setelahDikurangiSuamiIstri: 0,
  ptkpGabunganStatus: null, tahunPajak: 2021,
});
eq('A7 Bagian B 2021 uses pre-HPP (disagrees with A)', a7b2021.pphTerutangGabungan, 10_000_000);

// B3 is enforced in +page.svelte (n1a gated on the 1.a answer), not here.


// B5 — L-3A-4 Bagian A (Norma), feeding Induk 1.b.1. NetIncome = bruto x norma/100
// per row (rounded as setGrid1DataMap does), total rounded again.
console.log('\n--- B5: L-3A-4 Bagian A (Norma) ---');

const norma1 = hitungLampiranL3A4BagianA([
  { namaUsaha: 'TKU A', jenisUsahaPekerjaanBebas: 'Dagang', peredaranBruto: 1_200_000_000, normaPersen: 30 },
]);
eq('B5 neto = bruto x 30%', norma1.rows[0].penghasilanNeto, 360_000_000);
eq('B5 total bruto', norma1.totalPeredaranBruto, 1_200_000_000);
eq('B5 total neto', norma1.totalPenghasilanNeto, 360_000_000);

// Norma 0 short-circuits to 0 rather than multiplying (norm !== 0 ? ... : 0).
const norma0 = hitungLampiranL3A4BagianA([
  { namaUsaha: 'TKU A', jenisUsahaPekerjaanBebas: 'Dagang', peredaranBruto: 1_200_000_000, normaPersen: 0 },
]);
eq('B5 norma 0 -> neto 0', norma0.rows[0].penghasilanNeto, 0);

// Rounding: 333.333.333 x 12,5% = 41.666.666,625 -> 41.666.667
const normaRound = hitungLampiranL3A4BagianA([
  { namaUsaha: 'TKU A', jenisUsahaPekerjaanBebas: 'Jasa', peredaranBruto: 333_333_333, normaPersen: 12.5 },
]);
eq('B5 neto rounds', normaRound.rows[0].penghasilanNeto, 41_666_667);

// Multiple TKUs sum, each row rounded BEFORE totalling. This case discriminates:
// 100.000.001 x 25% = 25.000.000,25 rounds to 25.000.000 per row, so the total is
// 50.000.000. Summing unrounded first would give round(50.000.000,5) = 50.000.001.
// Coretax rounds per row (setGrid1DataMap) and Grid1TotalNetIncome then sums the
// already-rounded NetIncome values, so 50.000.000 is the Coretax answer.
const normaMulti = hitungLampiranL3A4BagianA([
  { namaUsaha: 'A', jenisUsahaPekerjaanBebas: 'Dagang', peredaranBruto: 100_000_001, normaPersen: 25 },
  { namaUsaha: 'B', jenisUsahaPekerjaanBebas: 'Jasa', peredaranBruto: 100_000_001, normaPersen: 25 },
]);
eq('B5 multi-row total (per-row rounding)', normaMulti.totalPenghasilanNeto, 50_000_000);

console.log(fail === 0 ? '\nAll checks passed.' : `\n${fail} FAILED`);
