import { spt_pph_orang_pribadi_lampiran_3a_neraca_akun } from '../../schema';
import type { SeedContext } from '../context';
import { batchInsert } from '../helpers';

// L-3A A.2 neraca chart of accounts, one template per sektor.
//
// Transcribed from the deployed Coretax bundle (chunk 827) on 2026-08-20, not
// from the UI capture: the bundle carries both the row labels and the subtotal
// arithmetic, as three asset classes (Dagang, Jasa, Industri — dagang and jasa
// differ only in the casing of 1499) and one liabilitas/ekuitas class shared by
// all three.
//
// The signs below are exactly the ones in the bundle's AC1700 getter: every
// contra account (1131, 1524, 1526, 1528, 1530) is subtracted, everything else
// added. AC2999, AC3299 and AC3300 sum with no contra rows at all.
type RowType = 'header' | 'data' | 'sum';
type Section = 'aset' | 'liabilitas_ekuitas';

type RowDef = readonly [
	kode: string | null,
	nama: string,
	type: RowType,
	section: Section,
	parentKode?: string | null,
	sign?: 1 | -1 | null
];

// Aset differs between sektors only in the persediaan block and the aset tetap
// block, so both are parameters and the rest of the list is shared verbatim.
const asetRows = (persediaan: RowDef[], asetTetapTambahan: RowDef[]): RowDef[] => [
	[null, 'Aset Lancar', 'header', 'aset'],
	['1101', 'Kas dan Setara Kas', 'data', 'aset', '1700', 1],
	['1200', 'Investasi', 'data', 'aset', '1700', 1],
	['1122', 'Piutang Usaha - Pihak Ketiga', 'data', 'aset', '1700', 1],
	['1123', 'Piutang Usaha - Pihak yang Mempunyai Hubungan Istimewa', 'data', 'aset', '1700', 1],
	['1124', 'Piutang Lainnya - Pihak Ketiga', 'data', 'aset', '1700', 1],
	['1125', 'Piutang Lainnya - Pihak yang Mempunyai Hubungan Istimewa', 'data', 'aset', '1700', 1],
	['1131', '(Dikurangi: Cadangan Piutang Tak Tertagih)', 'data', 'aset', '1700', -1],
	...persediaan,
	['1421', 'Beban Dibayar di Muka', 'data', 'aset', '1700', 1],
	['1422', 'Uang Muka', 'data', 'aset', '1700', 1],
	['1423', 'Pajak Dibayar di Muka', 'data', 'aset', '1700', 1],
	// The bundle spells this 'Aset lancar lainnya' in Dagang and Industri and
	// 'Aset Lancar Lainnya' in Jasa; the casing drift is normalised here.
	['1499', 'Aset Lancar Lainnya', 'data', 'aset', '1700', 1],
	[null, 'Aset Tidak Lancar', 'header', 'aset'],
	['1501', 'Piutang Jangka Panjang', 'data', 'aset', '1700', 1],
	['1523', 'Tanah dan Bangunan', 'data', 'aset', '1700', 1],
	['1524', '(Dikurangi: Akumulasi Penyusutan)', 'data', 'aset', '1700', -1],
	...asetTetapTambahan,
	['1529', 'Aset Tetap Lainnya', 'data', 'aset', '1700', 1],
	['1530', '(Dikurangi: Akumulasi Penyusutan)', 'data', 'aset', '1700', -1],
	['1541', 'Investasi pada Perusahaan Asosiasi', 'data', 'aset', '1700', 1],
	['1599', 'Investasi Jangka Panjang Lainnya', 'data', 'aset', '1700', 1],
	['1600', 'Aset Tak Berwujud - Net', 'data', 'aset', '1700', 1],
	['1611', 'Aset Pajak Tangguhan', 'data', 'aset', '1700', 1],
	['1698', 'Aset Tidak Lancar Lainnya', 'data', 'aset', '1700', 1],
	['1700', 'Jumlah Aset', 'sum', 'aset', null, null]
];

const persediaanTunggal: RowDef[] = [['1401', 'Persediaan', 'data', 'aset', '1700', 1]];

const persediaanIndustri: RowDef[] = [
	['1402', 'Persediaan Bahan Baku', 'data', 'aset', '1700', 1],
	['1403', 'Persediaan Barang Dalam Proses', 'data', 'aset', '1700', 1],
	['1404', 'Persediaan Barang Jadi', 'data', 'aset', '1700', 1]
];

const asetTetapIndustri: RowDef[] = [
	['1525', 'Peralatan', 'data', 'aset', '1700', 1],
	['1526', '(Dikurangi: Akumulasi Penyusutan)', 'data', 'aset', '1700', -1],
	['1527', 'Mesin', 'data', 'aset', '1700', 1],
	['1528', '(Dikurangi: Akumulasi Penyusutan)', 'data', 'aset', '1700', -1]
];

// Identical in all three sektors.
const liabilitasEkuitasRows: RowDef[] = [
	[null, 'Liabilitas Jangka Pendek', 'header', 'liabilitas_ekuitas'],
	['2102', 'Utang Usaha - Pihak Ketiga', 'data', 'liabilitas_ekuitas', '2999', 1],
	[
		'2103',
		'Utang Usaha - Pihak yang Mempunyai Hubungan Istimewa',
		'data',
		'liabilitas_ekuitas',
		'2999',
		1
	],
	['2111', 'Utang Bunga', 'data', 'liabilitas_ekuitas', '2999', 1],
	['2191', 'Utang Pajak', 'data', 'liabilitas_ekuitas', '2999', 1],
	['2192', 'Utang Dividen', 'data', 'liabilitas_ekuitas', '2999', 1],
	['2195', 'Beban yang Masih Harus Dibayar', 'data', 'liabilitas_ekuitas', '2999', 1],
	['2201', 'Utang Bank Jangka Pendek', 'data', 'liabilitas_ekuitas', '2999', 1],
	[
		'2202',
		'Utang Jangka Panjang yang Jatuh Tempo dalam Satu Tahun',
		'data',
		'liabilitas_ekuitas',
		'2999',
		1
	],
	['2203', 'Uang Muka', 'data', 'liabilitas_ekuitas', '2999', 1],
	['2228', 'Liabilitas Jangka Pendek Lainnya', 'data', 'liabilitas_ekuitas', '2999', 1],
	[null, 'Liabilitas Jangka Panjang', 'header', 'liabilitas_ekuitas'],
	['2301', 'Utang Bank Jangka Panjang', 'data', 'liabilitas_ekuitas', '2999', 1],
	['2303', 'Utang Jangka Panjang-Pihak Ketiga', 'data', 'liabilitas_ekuitas', '2999', 1],
	[
		'2304',
		'Utang Jangka Panjang - Pihak yang Mempunyai Hubungan Istimewa',
		'data',
		'liabilitas_ekuitas',
		'2999',
		1
	],
	['2321', 'Liabilitas Pajak Tangguhan', 'data', 'liabilitas_ekuitas', '2999', 1],
	['2998', 'Liabilitas Jangka Panjang Lainnya', 'data', 'liabilitas_ekuitas', '2999', 1],
	['2999', 'Jumlah Liabilitas', 'sum', 'liabilitas_ekuitas', '3300', 1],
	[null, 'Ekuitas', 'header', 'liabilitas_ekuitas'],
	// 3102 Modal Saham on an orang pribadi return is odd, but it is what the
	// live form shows: the account list is shared with the badan form.
	['3102', 'Modal Saham', 'data', 'liabilitas_ekuitas', '3299', 1],
	['3120', 'Tambahan Modal Disetor', 'data', 'liabilitas_ekuitas', '3299', 1],
	['3200', 'Saldo Laba', 'data', 'liabilitas_ekuitas', '3299', 1],
	['3298', 'Ekuitas Lainnya', 'data', 'liabilitas_ekuitas', '3299', 1],
	['3299', 'Jumlah Ekuitas', 'sum', 'liabilitas_ekuitas', '3300', 1],
	['3300', 'Jumlah Liabilitas dan Ekuitas', 'sum', 'liabilitas_ekuitas', null, null]
];

const templates: { sektor: 'dagang' | 'jasa' | 'industri'; rows: RowDef[] }[] = [
	{
		sektor: 'dagang',
		rows: [...asetRows(persediaanTunggal, []), ...liabilitasEkuitasRows]
	},
	{
		sektor: 'jasa',
		rows: [...asetRows(persediaanTunggal, []), ...liabilitasEkuitasRows]
	},
	{
		sektor: 'industri',
		rows: [
			...asetRows(persediaanIndustri, asetTetapIndustri),
			...liabilitasEkuitasRows
		]
	}
];

// Same id scheme as the A.1 chart: sektor-namespaced and index-based, so a row
// saved under a since-abandoned sektor can never collide with the current one.
const akunId = (sektor: string, index: number) =>
	`pph-op-lampiran-3a-neraca-akun-${sektor}-${index}`;

export const name = '019 SPT PPh Orang Pribadi L-3A A.2 neraca chart of accounts';

export const run = async ({ db }: SeedContext) => {
	let seeded = 0;

	for (const template of templates) {
		const statements = template.rows.map(([kode, nama, type, section, parentKode, sign], index) => {
			const values = {
				sektor: template.sektor,
				nomorUrut: index + 1,
				kode,
				namaAkun: nama,
				rowType: type,
				section,
				parentKode: parentKode ?? null,
				sign: sign ?? null
			};

			return db
				.insert(spt_pph_orang_pribadi_lampiran_3a_neraca_akun)
				.values({ id: akunId(template.sektor, index), ...values })
				.onConflictDoUpdate({
					target: spt_pph_orang_pribadi_lampiran_3a_neraca_akun.id,
					set: values
				});
		});

		await batchInsert(db, statements);
		seeded += template.rows.length;
	}

	console.log(
		`Seeded SPT PPh Orang Pribadi L-3A A.2: ${seeded} neraca rows across 3 sektor`
	);

	return [];
};
