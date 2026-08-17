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
import { hitungPphTerutang, hitungInduk, hitungLampiranL4SectionB, PTKP } from './hitungPphOrangPribadi';

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

console.log(fail === 0 ? '\nAll checks passed.' : `\n${fail} FAILED`);
