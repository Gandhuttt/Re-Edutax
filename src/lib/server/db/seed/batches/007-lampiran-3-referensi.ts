import {
	jenis_pajak_dipotong_dipungut_spt_pph_badan,
	jenis_penghasilan_kredit_pajak_luar_negeri_spt_pph_badan,
	mata_uang_spt_pph_badan
} from '../../schema';
import type { SeedContext } from '../context';
import { batchInsert } from '../helpers';

export const name = '007 lampiran 3 kredit pajak luar negeri reference data';

const jenisPenghasilanOptions = [
	'Penghasilan dari Usaha Jasa Konstruksi',
	'Penghasilan dari kegiatan usaha',
	'Penghasilan dari Premi Asuransi Termasuk Premi Reasuransi',
	'Penghasilan kena pajak sesudah dikurangi PPh suatu BUT',
	'Penghasilan lain-lain dari usaha',
	'Sewa tanah dan atau bangunan',
	'Sewa harta selain tanah dan atau bangunan',
	'Dividen',
	'Bunga',
	'Obligasi',
	'Royalti',
	'Keuntungan Penjualan Harta',
	'Bunga Deposito',
	'Bunga Tabungan',
	'Surat Berharga/Sekurita',
	'Penjualan Saham di Bursa',
	'Pengalihan atau Penjualan Tanah Bangunan',
	'Penghasilan dari Bangun Guna Serah',
	'Penghasilan lain-lain dari Modal atau Aset/Harta',
	'Pembebasan Utang',
	'Hibah',
	'Bantuan/Sumbangan',
	'Klaim Asuransi',
	'Hadiah/Undian',
	'Penghasilan lain'
] as const;

const mataUangOptions = [
	'UAE Dirham: UNITED ARAB EMIRATES',
	'Afghani Afghanistan',
	'Albania Lek',
	'Gulden Antillen Belanda',
	'Peso Argentina',
	'Dolar Australia',
	'Gulden Aruba',
	'Manat Azerbaijan',
	'Mark Konvertibel Bosnia dan Herzegovina',
	'Dolar Barbados',
	'Bangladeshi Taka',
	'Lev Bulgaria',
	'Dolar Bermuda',
	'Dolar Brunei Darussalam',
	'Boliviano Bolivia',
	'Real Brazil',
	'Dolar Bahama',
	'Pula Botswana',
	'Rubel Belarusia',
	'Dolar Belize',
	'Dolar Kanada',
	'Franc Swiss',
	'Peso Chili',
	'Yuan Renminbi: CHINA',
	'Peso Kolombia',
	'Kolon Kosta Rika',
	'Peso Kuba',
	'Koruna Republik Ceko',
	'Krone Denmark',
	'Peso Republik Dominika',
	'Pound Mesir',
	'Negara Anggota Euro',
	'Dolar Fiji',
	'Kepulauan Falkland (Malvinas) Pound',
	'Pound Inggris',
	'Pound Guernsey',
	'Cedi Ghana',
	'Pound Gibraltar',
	'Quetzal Guatemala',
	'Dolar Guyana',
	'Dollar Hongkong',
	'Lempira Honduras',
	'Kuna Kroasia',
	'Forint Hongaria',
	'Rupiah Indonesia',
	'Shekel Israel',
	'Pulau Man Pound',
	'Rupee India',
	'Rial Iran',
	'Krona Islandia',
	'Jersey Pound',
	'Dolar Jamaika',
	'Yen Jepang',
	'Som Kirgistan',
	'Kamboja Riel',
	'Won Korea Utara',
	'Won Korea Selatan',
	'Dolar Kepulauan Cayman',
	'Tenge Kazakstan',
	'Kip Laos',
	'Pound Lebanon',
	'Rupee Sri Lanka',
	'Dolar Liberia',
	'Denar Makedonia',
	'Tughrik Mongolia',
	'Rupee Mauritius',
	'Peso Meksiko',
	'Ringgit Malaysia',
	'Metical Mozambik',
	'Dolar Namibia',
	'Naira Nigeria',
	'Cordoba Nikaragua',
	'Krone Norwegia',
	'Rupee Nepal',
	'Dolar Selandia Baru',
	'Rial Oman',
	'Balboa Panama',
	'Sol Peru',
	'Peso Filipina',
	'Rupee Pakistan',
	'Zloty Polandia',
	'Guarani Paraguay',
	'Riyal Qatar',
	'Leu Romania',
	'Dinar Serbia',
	'Rubel Rusia',
	'Riyal Arab Saudi',
	'Dolar Kepulauan Solomon',
	'Rupee Seychelles',
	'Krona Swedia',
	'Dolar Singapura',
	'Pound Saint Helena',
	'Shilling Somalia',
	'Dolar Suriname',
	'Kolon El Salvador',
	'Pound Suriah',
	'Baht Thailand',
	'Lira Turki',
	'Dolar Trinidad dan Tobago',
	'Dolar Tuvalu',
	'Dolar Baru Taiwan',
	'Ukraina Ukraina',
	'Dolar Amerika Serikat',
	'Peso Uruguay',
	'Som Uzbekistan',
	'Bolivar Venezuela',
	'Dong Vietnam',
	'Dolar Karibia Timur',
	'Rial Yaman',
	'Rand Afrika Selatan',
	'Dolar Zimbabwe'
] as const;

const jenisPajakDipotongDipungutOptions = [
	'Nilai LB dalam SPT yang dianggap bukan merupakan lebih bayar',
	'PPh Ditanggung Pemerintah',
	'PPh Ditanggung Pemerintah(Proyek Bantuan Luar Negeri)',
	'PPh Pasal 15',
	'PPh Pasal 22',
	'PPh Pasal 23',
	'PPh Pasal 26'
] as const;

const slugify = (value: string) =>
	value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '_')
		.replace(/^_+|_+$/g, '');

const jenisPenghasilanId = (kode: string) => `jenis-penghasilan-kredit-pajak-ln-${kode}`;
const mataUangId = (kode: string) => `mata-uang-${kode}`;
const jenisPajakDipotongDipungutId = (kode: string) => `jenis-pajak-dipotong-dipungut-${kode}`;

export const run = async ({ db }: SeedContext) => {
	await batchInsert(
		db,
		jenisPenghasilanOptions.map((nama, index) => {
			const kode = slugify(nama);

			return db
				.insert(jenis_penghasilan_kredit_pajak_luar_negeri_spt_pph_badan)
				.values({
					id: jenisPenghasilanId(kode),
					kode,
					nama,
					nomorUrut: index + 1
				})
				.onConflictDoUpdate({
					target: jenis_penghasilan_kredit_pajak_luar_negeri_spt_pph_badan.kode,
					set: { nama, nomorUrut: index + 1, aktif: true }
				});
		})
	);

	await batchInsert(
		db,
		mataUangOptions.map((nama) => {
			const kode = slugify(nama);

			return db
				.insert(mata_uang_spt_pph_badan)
				.values({
					id: mataUangId(kode),
					kode,
					nama
				})
				.onConflictDoUpdate({
					target: mata_uang_spt_pph_badan.kode,
					set: { nama, aktif: true }
				});
		})
	);

	await batchInsert(
		db,
		jenisPajakDipotongDipungutOptions.map((nama, index) => {
			const kode = slugify(nama);

			return db
				.insert(jenis_pajak_dipotong_dipungut_spt_pph_badan)
				.values({
					id: jenisPajakDipotongDipungutId(kode),
					kode,
					nama,
					nomorUrut: index + 1
				})
				.onConflictDoUpdate({
					target: jenis_pajak_dipotong_dipungut_spt_pph_badan.kode,
					set: { nama, nomorUrut: index + 1, aktif: true }
				});
		})
	);

	console.log(
		`Seeded SPT PPh Badan references: ${jenisPenghasilanOptions.length} jenis penghasilan kredit pajak luar negeri`
	);
	console.log(`Seeded SPT PPh Badan references: ${mataUangOptions.length} mata uang`);
	console.log(
		`Seeded SPT PPh Badan references: ${jenisPajakDipotongDipungutOptions.length} jenis pajak dipotong/dipungut`
	);

	return [];
};
