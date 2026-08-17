import { spt_pph_orang_pribadi_lampiran_3a_akun } from '../../schema';
import type { SeedContext } from '../context';
import { batchInsert } from '../helpers';

// L-3A A.1 chart of accounts, one row-tuple template per sektor, transcribed
// from docs/ui-reference/coretax/spt-1770-lampiran/L3A.md.
//
// Same shape as the SPT Badan L1 seed (005-lampiran-1-akun.ts): `parentKode`
// and `sign` describe how a row folds into its sum-row parent. Classification
// (income/expense) is derived from the kode prefix at insert time, exactly as
// on the Badan side, since nothing in the captured L-3A data needed an
// override.
//
// Unlike Badan's umum/manufaktur templates, L-3A has no non-usaha section:
// the doc confirms 4800 sits directly below 5400 in every sektor, with no
// 4500/4600/4700 chain. All three sektors also share an identical Beban Usaha
// tail (5311..5400), reproduced verbatim in each rather than factored out, to
// keep each sektor's row-tuple list a faithful standalone transcript.
type RowType = 'header' | 'data' | 'sum';

type RowDef = readonly [
	kode: string | null,
	nama: string,
	type: RowType,
	parentKode?: string | null,
	sign?: 1 | -1 | null
];

const BEBAN_USAHA_TAIL = (gajiLabel: string, promosiLabel: string): RowDef[] => [
	[null, 'Beban Usaha', 'header'],
	['5311', gajiLabel, 'data', '5400', 1],
	['5313', 'Beban Transportasi', 'data', '5400', 1],
	['5314', 'Beban Penyusutan dan Amortisasi', 'data', '5400', 1],
	['5315', 'Beban Sewa', 'data', '5400', 1],
	['5316', 'Beban Bunga', 'data', '5400', 1],
	['5317', 'Beban Sehubungan dengan Jasa', 'data', '5400', 1],
	['5318', 'Beban Piutang Tidak Tertagih', 'data', '5400', 1],
	['5320', promosiLabel, 'data', '5400', 1],
	['5321', 'Beban Entertainment', 'data', '5400', 1],
	['5322', 'Beban Umum dan Administrasi', 'data', '5400', 1],
	['5399', 'Beban Usaha Lainnya', 'data', '5400', 1],
	['5400', 'Jumlah Beban Usaha', 'sum', '4800', -1],
	['4800', 'Laba (Rugi) Sebelum Pajak', 'sum', null, null]
];

const dagangRows: RowDef[] = [
	[null, 'Penjualan', 'header'],
	['4002', 'Penjualan Domestik', 'data', '4004', 1],
	['4003', 'Penjualan Ekspor', 'data', '4004', 1],
	['4004', 'Penjualan Bruto', 'sum', '4020', 1],
	[null, 'Dikurangi :', 'header'],
	['4011', 'Retur', 'data', '4020', -1],
	['4012', 'Potongan Penjualan', 'data', '4020', -1],
	['4020', 'Penjualan Bersih', 'sum', '4300', 1],
	[null, 'Harga Pokok Penjualan (HPP)', 'header'],
	['5001', 'Pembelian', 'data', '5020', 1],
	['5008', 'Persediaan - Awal', 'data', '5020', 1],
	['5009', 'Dikurangi: Persediaan Akhir', 'data', '5020', -1],
	['5020', 'Jumlah HPP', 'sum', '4300', -1],
	['4300', 'Laba Kotor', 'sum', '4800', 1],
	...BEBAN_USAHA_TAIL(
		'Gaji, Tunjangan, Bonus, Honorarium, THR, dsb',
		'Beban Pemasaran atau Promosi'
	)
];

const jasaRows: RowDef[] = [
	[null, 'Pendapatan', 'header'],
	['4021', 'Pendapatan Jasa', 'data', '4300', 1],
	['5020', 'Biaya Pokok Jasa', 'data', '4300', -1],
	['4300', 'Laba Kotor', 'sum', '4800', 1],
	// The live form has a typo, "Grafikasi" for gratifikasi; corrected here
	// rather than reproduced.
	...BEBAN_USAHA_TAIL('Gaji, Upah, Bonus, Gratifikasi, Honorarium, THR, Dsb', 'Biaya Pemasaran/Promosi')
];

const industriRows: RowDef[] = [
	[null, 'Penjualan', 'header'],
	['4002', 'Penjualan Domestik', 'data', '4004', 1],
	['4003', 'Penjualan Ekspor', 'data', '4004', 1],
	['4004', 'Penjualan Bruto', 'sum', '4020', 1],
	[null, 'Dikurangi :', 'header'],
	['4011', 'Retur', 'data', '4020', -1],
	['4012', 'Potongan Penjualan', 'data', '4020', -1],
	['4020', 'Penjualan Bersih', 'sum', '4300', 1],
	[null, 'Harga Pokok Produksi', 'header'],
	['5040', 'Biaya Bahan Baku', 'data', '5080', 1],
	['5050', 'Biaya Tenaga Kerja Langsung', 'data', '5080', 1],
	[null, 'Biaya Pabrikasi', 'header'],
	['5051', 'Biaya Tenaga Kerja Tidak Langsung', 'data', '5070', 1],
	['5052', 'Biaya Pemeliharaan dan Perbaikan Mesin', 'data', '5070', 1],
	['5058', 'Biaya Penyusutan dan Amortisasi', 'data', '5070', 1],
	['5059', 'Biaya Utilitas', 'data', '5070', 1],
	['5069', 'Biaya Pabrikasi Lainnya', 'data', '5070', 1],
	['5070', 'Jumlah Biaya Pabrikasi', 'sum', '5080', 1],
	['5080', 'Jumlah Biaya Produksi', 'sum', '5100', 1],
	['5090', 'Persediaan Awal Barang Dalam Proses', 'data', '5100', 1],
	['5099', 'Dikurangi: Persediaan Akhir Barang Dalam Proses', 'data', '5100', -1],
	['5100', 'Jumlah Harga Pokok Produksi', 'sum', '5020', 1],
	['5008', 'Persediaan Awal Barang Jadi', 'data', '5020', 1],
	['5009', 'Dikurangi: Persediaan Akhir Barang Jadi', 'data', '5020', -1],
	['5020', 'Jumlah Harga Pokok Penjualan', 'sum', '4300', -1],
	['4300', 'Laba Kotor', 'sum', '4800', 1],
	...BEBAN_USAHA_TAIL('Gaji, Tunjangan, Bonus, Honorarium, THR, dll', 'Biaya Pemasaran/Promosi')
];

const templates: { sektor: 'dagang' | 'jasa' | 'industri'; rows: RowDef[] }[] = [
	{ sektor: 'dagang', rows: dagangRows },
	{ sektor: 'jasa', rows: jasaRows },
	{ sektor: 'industri', rows: industriRows }
];

const akunId = (sektor: string, index: number) => `pph-op-lampiran-3a-akun-${sektor}-${index}`;

const classificationOf = (kode: string | null): 'income' | 'expense' | null => {
	if (!kode) return null;
	return kode.startsWith('4') ? 'income' : 'expense';
};

export const name = '018 SPT PPh Orang Pribadi L-3A chart of accounts (Dagang/Jasa/Industri)';

export const run = async ({ db }: SeedContext) => {
	let seeded = 0;

	for (const template of templates) {
		const statements = template.rows.map(([kode, nama, type, parentKode, sign], index) => {
			const classification = type === 'data' ? classificationOf(kode) : null;

			return db
				.insert(spt_pph_orang_pribadi_lampiran_3a_akun)
				.values({
					id: akunId(template.sektor, index),
					sektor: template.sektor,
					nomorUrut: index + 1,
					kode,
					namaAkun: nama,
					rowType: type,
					classification,
					parentKode: parentKode ?? null,
					sign: sign ?? null
				})
				.onConflictDoUpdate({
					target: spt_pph_orang_pribadi_lampiran_3a_akun.id,
					set: {
						nomorUrut: index + 1,
						kode,
						namaAkun: nama,
						rowType: type,
						classification,
						parentKode: parentKode ?? null,
						sign: sign ?? null
					}
				});
		});
		await batchInsert(db, statements);
		seeded += template.rows.length;
	}

	console.log(`Seeded SPT PPh Orang Pribadi L-3A: ${seeded} chart of accounts rows across 3 sektor`);

	return [];
};
