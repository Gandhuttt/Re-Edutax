import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	aggregateSpt2126, emptySpt2126Input, isActiveSpt2126Source,
	lastPeriodSpt2126Gross, validateSpt2126Input, type Spt2126Source
} from './spt-pph-2126';

const slip = (values: Partial<Spt2126Source>): Spt2126Source => ({
	id: 'issued-slip', jenis: 'MP', nama: 'Penerima', identitas: '1234567890123456',
	kodeObjek: '21-100-01', masaPajak: 12, tahun: 2025, bruto: 0, pajak: 0,
	dtp: 0, brutoTahunan: null, pajakTahunan: null, dtpTahunan: null,
	nomor: 'SIM-MP', status: 'SUBMITTED', ...values
});

test('issued amendment replaces the inactive original; draft and terminal lifecycle states never contribute', () => {
	const rows = [
		{ status: 'AMENDED', issued: true, pajak: 1000 },
		{ status: 'AMENDMENT', issued: true, pajak: 700 },
		{ status: 'AMENDMENT', issued: false, pajak: 400 },
		{ status: 'SAVEDINVALID', issued: true, pajak: 300 },
		{ status: 'CANCELLED', issued: true, pajak: 200 },
		{ status: 'DELETED', issued: true, pajak: 100 },
		{ status: 'SUBMITTED', issued: false, pajak: 50 }
	];
	const active = rows.filter(row => isActiveSpt2126Source(row.status, row.issued));
	const snapshot = aggregateSpt2126(active.map(row => slip({ jenis: 'BP21', status: row.status, pajak: row.pajak })), emptySpt2126Input());
	assert.equal(snapshot.pasal21.pajak, 700);
	assert.equal(snapshot.pasal21.harusDibayar, 700);
});

test('BPA last-period gross subtracts effective monthly gross; L-II annual figures never enter Induk twice', () => {
	const annual = slip({ jenis: 'BPA1', bruto: lastPeriodSpt2126Gross(54_000_000, [20_000_000,25_000_000]), pajak: -200_000, brutoTahunan: 54_000_000, pajakTahunan: 1_000_000, dtpTahunan: 0 });
	const snapshot = aggregateSpt2126([annual], emptySpt2126Input());
	assert.equal(snapshot.lib.bruto, 9_000_000);
	assert.equal(snapshot.lii.bruto, 54_000_000);
	assert.equal(snapshot.lii.pajak, 1_000_000);
	assert.equal(snapshot.pasal21.bruto, 9_000_000);
	assert.equal(snapshot.pasal21.harusDibayar, -200_000);
	assert.throws(() => lastPeriodSpt2126Gross(1_000_000,[1_000_001]));
});

test('annual DTP survives a zero last-period withholding and does not reduce unrelated non-DTP tax', () => {
	const snapshot = aggregateSpt2126([
		slip({jenis:'BPA1',brutoTahunan:54_000_000,pajakTahunan:800_000,dtpTahunan:800_000}),
		slip({id:'other',jenis:'BP21',pajak:300_000})
	],emptySpt2126Input());
	assert.equal(snapshot.lii.dtp,800_000);
	assert.equal(snapshot.lib.dtp,0);
	assert.equal(snapshot.pasal21.harusDibayar,300_000);
});

test('PPh21 surplus cannot net PPh26 due and amendment baseline only subtracts prior payments per article', () => {
	const snapshot = aggregateSpt2126([
		slip({jenis:'BPA2',pajak:-500_000,brutoTahunan:20_000_000,pajakTahunan:0,dtpTahunan:0}),
		slip({id:'foreign',jenis:'BP26',pajak:200_000})
	],emptySpt2126Input(),100_000,50_000);
	assert.equal(snapshot.pasal21.kurangLebihBayar,-500_000);
	assert.equal(snapshot.pasal21.harusDibayar,-600_000);
	assert.equal(snapshot.pasal26.kurangLebihBayar,200_000);
	assert.equal(snapshot.pasal26.harusDibayar,150_000);
});

test('SP2D requires explicit government simulator scenario and finite integer rupiah', () => {
	assert.throws(()=>validateSpt2126Input({...emptySpt2126Input(),sp2d21:100,sp2dKeterangan:'Contoh'}));
	const accepted=validateSpt2126Input({...emptySpt2126Input(),jenisWajibPajak:'instansi_pemerintah',sp2d21:100,sp2dKeterangan:'Contoh lokal'});
	assert.equal(accepted.sp2d21,100);
	for(const invalid of [NaN,Infinity,-1,1.5,Number.MAX_SAFE_INTEGER+1]) {
		assert.throws(()=>validateSpt2126Input({...emptySpt2126Input(),kompensasi21:invalid}));
	}
});
