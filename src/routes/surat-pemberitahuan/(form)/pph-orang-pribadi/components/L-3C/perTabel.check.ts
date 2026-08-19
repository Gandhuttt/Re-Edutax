// Checks the L-3C sub-grid round-trip: the twelve grids Coretax distinguishes by
// TableIndex are stored flat and regrouped on load, and neither direction may
// lose or misplace a row.
//
//   npx tsx 'src/routes/surat-pemberitahuan/(form)/pph-orang-pribadi/components/L-3C/perTabel.check.ts'
//
// The repo has no test runner, so this is a standalone script, same as
// Induk/hitungPphOrangPribadi.check.ts.
import { kelompokkanPerTabel, ratakanPerTabel, type BarisBertabel } from './perTabel';
import { L3C_AMORTISASI, L3C_PENYUSUTAN, L3C_SUB_GRID, type BarisHartaFiskal } from './types';

let fail = 0;
const eq = (label: string, got: unknown, want: unknown) => {
	const ok = JSON.stringify(got) === JSON.stringify(want);
	if (!ok) fail++;
	console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}: got ${JSON.stringify(got)} want ${JSON.stringify(want)}`);
};

const baris = (jenis: string, nilai: number): BarisHartaFiskal => ({
	kodeHarta: '', jenisHarta: jenis, bulanPerolehan: 1, tahunPerolehan: 2025,
	hargaPerolehan: nilai, nilaiSisaBukuFiskal: 0, metodeKomersial: 'Garis Lurus',
	metodeFiskal: 'Garis Lurus', penyusutanFiskalTahunIni: nilai, keterangan: ''
});

// The twelve grids Coretax declares, and the split its two totals imply.
eq('twelve sub-grids', L3C_SUB_GRID.length, 12);
eq('tableIndex 1..12', L3C_SUB_GRID.map((g) => g.tableIndex), [1,2,3,4,5,6,7,8,9,10,11,12]);
eq('penyusutan covers grids 1-7', L3C_PENYUSUTAN, [1,2,3,4,5,6,7]);
eq('amortisasi covers grids 8-12', L3C_AMORTISASI, [8,9,10,11,12]);
// Depreciation spans both the tangible and building sections, which is why the
// total cannot live inside either one.
eq(
	'penyusutan spans berwujud + bangunan',
	[...new Set(L3C_SUB_GRID.filter((g) => L3C_PENYUSUTAN.includes(g.tableIndex)).map((g) => g.seksi))],
	['berwujud', 'bangunan']
);

// Empty input still yields all twelve keys, so every grid can bind.
const kosong = kelompokkanPerTabel([]);
eq('empty regroups to twelve keys', Object.keys(kosong).length, 12);
eq('empty grid 7 is an array', Array.isArray(kosong[7]), true);
eq('empty flattens back to nothing', ratakanPerTabel(kosong).length, 0);

// Round-trip: rows land in their own grid and keep their order.
const tersimpan: BarisBertabel[] = [
	{ ...baris('Mesin', 10), tableIndex: 1 },
	{ ...baris('Bus', 20), tableIndex: 1 },
	{ ...baris('Apartemen', 30), tableIndex: 6 },
	{ ...baris('Paten', 40), tableIndex: 12 }
];
const dikelompokkan = kelompokkanPerTabel(tersimpan);
eq('grid 1 keeps both rows in order', dikelompokkan[1].map((r) => r.jenisHarta), ['Mesin', 'Bus']);
eq('grid 6 gets its one row', dikelompokkan[6].map((r) => r.jenisHarta), ['Apartemen']);
eq('grid 12 gets its one row', dikelompokkan[12].map((r) => r.jenisHarta), ['Paten']);
eq('untouched grid stays empty', dikelompokkan[3], []);
eq('tableIndex is not left on the row', 'tableIndex' in dikelompokkan[1][0], false);

const kembali = ratakanPerTabel(dikelompokkan);
eq('round-trip preserves row count', kembali.length, 4);
eq(
	'round-trip preserves grid assignment',
	kembali.map((r) => `${r.tableIndex}:${r.jenisHarta}`),
	['1:Mesin', '1:Bus', '6:Apartemen', '12:Paten']
);

// A row from an older shape is dropped, not promoted to a thirteenth grid.
const aneh = kelompokkanPerTabel([{ ...baris('Entah', 1), tableIndex: 99 }]);
eq('out-of-range tableIndex is dropped', Object.keys(aneh).length, 12);
eq('out-of-range row is not kept', ratakanPerTabel(aneh).length, 0);

console.log(fail === 0 ? '\nAll checks passed.' : `\n${fail} check(s) failed.`);
if (fail > 0) process.exit(1);
