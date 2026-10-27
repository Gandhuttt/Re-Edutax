import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aggregateSptUnifikasi, SptUnifikasiError, type SptUnifikasiSource } from './spt-unifikasi';

const slip = (values: Partial<SptUnifikasiSource>): SptUnifikasiSource => ({
	id: 'bppu-1', nomor: 'BPPU-0001', tanggalDokumen: '2025-03-10', identitas: '1234567890123456', nama: 'Penerima',
	kodeObjek: '23-100-01', namaObjek: 'Sewa', pasal: 'Pasal 23', kapKjs: '411124-100', dpp: 780_000, tarif: 2, pajak: 15_600,
	dtp: 0, fasilitasKode: '', fasilitas: '', nitku: '0123456789012000000', status: 'SUBMITTED', ...values
});

test('stored withholding is used as-is: Rp780.000 at 2% is Rp15.600', () => {
	const snapshot = aggregateSptUnifikasi([slip({})]);
	assert.equal(snapshot.totalDpp, 780_000);
	assert.equal(snapshot.rows.find(row => row.kapKjs === '411124-100')?.pemotongan, 15_600);
	assert.equal(snapshot.harusDibayar, 15_600);
	// Source tax is authoritative; a differing stored value is not recomputed from DPP*tarif.
	assert.equal(aggregateSptUnifikasi([slip({ pajak: 15_000 })]).totalPemotongan, 15_000);
});

test('DTP facility amount is subtracted exactly once', () => {
	const snapshot = aggregateSptUnifikasi([slip({ fasilitasKode: '4', dtp: 15_600 }), slip({ id: 'bppu-2', nomor: 'BPPU-0002', pajak: 4_000 })]);
	assert.equal(snapshot.totalPemotongan, 19_600);
	assert.equal(snapshot.totalDtp, 15_600);
	assert.equal(snapshot.totalTerutang, 4_000);
	assert.equal(snapshot.harusDibayar, 4_000);
	assert.throws(() => aggregateSptUnifikasi([slip({ dtp: 15_601 })]), SptUnifikasiError);
});

test('prior payments are applied per KAP-KJS and never netted across codes', () => {
	const sources = [slip({}), slip({ id: 'bppu-2', nomor: 'BPPU-0002', pasal: 'Pasal 4 Ayat 2', kapKjs: '411128-100', pajak: 10_000 })];
	const snapshot = aggregateSptUnifikasi(sources, { '411124-100': 20_000 });
	const byKap = Object.fromEntries(snapshot.rows.map(row => [row.kapKjs, row]));
	assert.equal(byKap['411124-100'].kurangLebihBayar, -4_400);
	assert.equal(byKap['411124-100'].harusDibayar, 0);
	assert.equal(byKap['411128-100'].harusDibayar, 10_000);
	assert.equal(snapshot.kurangLebihBayar, 5_600);
	assert.equal(snapshot.harusDibayar, 10_000);
});

test('amendment keeps actual prior payments of disappeared sources; 411128-600 is Pasal 15', () => {
	const snapshot = aggregateSptUnifikasi([slip({})], { '411124-100': 15_600, '411128-600': 5_000, '411128-100': 3_000 });
	const byKap = Object.fromEntries(snapshot.rows.map(row => [row.kapKjs, row]));
	assert.equal(byKap['411128-600'].pasal, 'Pasal 15');
	assert.equal(byKap['411128-600'].kurangLebihBayar, -5_000);
	assert.equal(byKap['411128-100'].pasal, 'Pasal 4 Ayat 2');
	assert.equal(byKap['411124-100'].harusDibayar, 0);
	assert.equal(snapshot.totalPembayaranSebelumnya, 23_600);
	assert.equal(snapshot.harusDibayar, 0);
	assert.throws(() => aggregateSptUnifikasi([], { '999999-999': 1 }), SptUnifikasiError);
});

test('explicit article of a prior payment wins over KAP inference', () => {
	const snapshot = aggregateSptUnifikasi([], { '411129-100': 1_000 }, { '411129-100': 'Pasal 15' });
	const row = snapshot.rows.find(item => item.kapKjs === '411129-100');
	assert.equal(row?.pasal, 'Pasal 15');
	assert.equal(row?.pembayaranSebelumnya, 1_000);
});

test('fixed Coretax KAP rows are always present with zero values and do not change totals', () => {
	const snapshot = aggregateSptUnifikasi([]);
	assert.deepEqual(snapshot.rows.map(row => row.kapKjs), ['411128-100', '411128-402', '411128-403', '411128-600', '411129-600', '411122-100', '411122-900', '411122-910', '411124-100', '411127-110']);
	assert.ok(snapshot.rows.every(row => row.pemotongan === 0 && row.pembayaranSebelumnya === 0 && row.harusDibayar === 0));
	assert.equal(snapshot.totalPemotongan, 0);
	assert.equal(snapshot.harusDibayar, 0);
	const byKap = Object.fromEntries(snapshot.rows.map(row => [row.kapKjs, row.pasal]));
	assert.equal(byKap['411128-600'], 'Pasal 15');
	assert.equal(byKap['411129-600'], 'Pasal 15');
	assert.equal(byKap['411128-402'], 'Pasal 4 Ayat 2');
});

test('additional source KAP is kept alongside the fixed rows', () => {
	const snapshot = aggregateSptUnifikasi([slip({ id: 'bppu-x', kapKjs: '411124-101', pajak: 500 })]);
	assert.equal(snapshot.rows.length, 11);
	assert.equal(snapshot.rows.find(row => row.kapKjs === '411124-101')?.pemotongan, 500);
	assert.equal(snapshot.rows.find(row => row.kapKjs === '411124-100')?.pemotongan, 0);
});

test('unsafe numerics, fractions, negatives, duplicates, and inconsistent articles are rejected', () => {
	for (const bad of [{ pajak: Number.MAX_SAFE_INTEGER + 1 }, { pajak: 100.5 }, { pajak: -1 }, { dpp: Number.NaN }, { tarif: -2 }]) {
		assert.throws(() => aggregateSptUnifikasi([slip(bad)]), SptUnifikasiError);
	}
	assert.throws(() => aggregateSptUnifikasi([slip({ pajak: Number.MAX_SAFE_INTEGER }), slip({ id: 'bppu-2', nomor: 'BPPU-0002', pajak: 1 })]), SptUnifikasiError);
	assert.throws(() => aggregateSptUnifikasi([slip({}), slip({})]), SptUnifikasiError);
	assert.throws(() => aggregateSptUnifikasi([slip({ kapKjs: '41124-100' })]), SptUnifikasiError);
	assert.throws(() => aggregateSptUnifikasi([slip({}), slip({ id: 'bppu-2', nomor: 'BPPU-0002', pasal: 'Pasal 22' })]), SptUnifikasiError);
	assert.throws(() => aggregateSptUnifikasi([], { '411124-100': -1 }), SptUnifikasiError);
});
