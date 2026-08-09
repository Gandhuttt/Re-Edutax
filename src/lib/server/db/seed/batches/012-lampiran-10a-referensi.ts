import { notInArray } from 'drizzle-orm';
import {
	bentuk_hubungan_istimewa_spt_pph_badan,
	jenis_transaksi_hubungan_istimewa_spt_pph_badan,
	metode_penentuan_harga_transfer_spt_pph_badan
} from '../../schema';
import type { SeedContext } from '../context';

export const name = '012 lampiran 10a bentuk hubungan/jenis transaksi/metode harga transfer reference data';

const bentukHubungan = [
	'Hubungan istimewa karena kepemilikan saham/ penyertaan sebagaimana diatur oleh Pasal 18 ayat (4) huruf a UU Pajak Penghasilan',
	'Hubungan istimewa karena penguasaan sebagaimana diatur oleh Pasal 18 ayat (4) huruf b UU Pajak Penghasilan',
	'Hubungan istimewa karena hubungan keluarga sebagaimana diatur oleh Pasal 18 ayat (4) huruf c UU Pajak Penghasilan',
	'Hubungan istimewa karena pengendalian sebagaimana diatur oleh Pasal 9 ayat (1) Perjanjian Penghindaran Pajak Berganda (tax treaty) antara Indonesia dengan negara domisili pihak yang mempunyai hubungan istimewa dengan wajib pajak'
] as const;

const jenisTransaksi = [
	'Penjualan barang berwujud (bahan baku, barang jadi dan barang dagangan)',
	'Pembelian barang berwujud (bahan baku, barang jadi dan barang dagangan)',
	'Penjualan barang modal, termasuk aktiva tetap',
	'Pembelian barang modal, termasuk aktiva tetap',
	'Penyerahan barang tidak berwujud',
	'Pemanfaatan barang tidak berwujud',
	'Peminjaman Uang ke Pihak yang Memiliki Hubungan Istimewa',
	'Pinjaman Uang dari Pihak yang Memiliki Hubungan Istimewa',
	'Penyerahan jasa',
	'Pemanfaatan jasa',
	'Penyerahan instrumen keuangan seperti saham dan obligasi',
	'Perolehan instrumen keuangan seperti saham dan obligasi',
	'Transaksi Penyerahan Lainnya',
	'Transaksi Pembelian Lainnya'
] as const;

const metodePenentuanHargaTransfer = [
	'Metode Perbandingan Harga Antarpihak yang Independen',
	'Metode Biaya-Plus',
	'Metode Harga Penjualan Kembali',
	'Metode Laba Bersih Transaksional',
	'Metode Pembagian Laba',
	'Metode Perbandingan Transaksi Independen',
	'Metode dalam Penilaian Harta Berwujud dan/atau Harta Tidak Berwujud',
	'Metode dalam Penilaian Bisnis',
	'Metode Biaya-Plus dengan Besaran Kenaikan'
] as const;

const slugify = (value: string) =>
	value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '_')
		.replace(/^_+|_+$/g, '')
		.slice(0, 80);

async function seedGroup(
	db: SeedContext['db'],
	table:
		| typeof bentuk_hubungan_istimewa_spt_pph_badan
		| typeof jenis_transaksi_hubungan_istimewa_spt_pph_badan
		| typeof metode_penentuan_harga_transfer_spt_pph_badan,
	prefix: string,
	items: readonly string[]
) {
	const currentKode = items.map((nama) => `${prefix}_${slugify(nama)}`);

	for (const [index, nama] of items.entries()) {
		const kode = currentKode[index];

		await db
			.insert(table)
			.values({ id: `${prefix}-${slugify(nama)}`, kode, nama, nomorUrut: index + 1 })
			.onConflictDoUpdate({
				target: table.kode,
				set: { nama, nomorUrut: index + 1, aktif: true }
			});
	}

	await db.update(table).set({ aktif: false }).where(notInArray(table.kode, currentKode));

	return items.length;
}

export const run = async ({ db }: SeedContext) => {
	const total =
		(await seedGroup(db, bentuk_hubungan_istimewa_spt_pph_badan, 'bentuk_hubungan', bentukHubungan)) +
		(await seedGroup(db, jenis_transaksi_hubungan_istimewa_spt_pph_badan, 'jenis_transaksi', jenisTransaksi)) +
		(await seedGroup(
			db,
			metode_penentuan_harga_transfer_spt_pph_badan,
			'metode_harga_transfer',
			metodePenentuanHargaTransfer
		));

	console.log(`Seeded SPT PPh Badan references: ${total} lampiran 10a bentuk hubungan/jenis transaksi/metode harga transfer`);

	return [];
};
