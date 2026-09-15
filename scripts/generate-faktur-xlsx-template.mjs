import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as XLSX from 'xlsx';

const outputDirectory = new URL('../static/templates/', import.meta.url);
const outputFile = new URL('faktur-keluaran-template.xlsx', outputDirectory);
mkdirSync(outputDirectory, { recursive: true });

const transactionCodes = [
	['01', 'Kepada selain Pemungut PPN'],
	['02', 'Kepada Pemungut PPN Instansi Pemerintah'],
	['03', 'Kepada Pemungut PPN Selain Instansi Pemerintah'],
	['04', 'DPP Nilai Lain-Lain'],
	['05', 'Besaran Tertentu'],
	['06', 'Kepada Orang Pribadi Pemegang Paspor Luar Negeri'],
	['07', 'Penyerahan dengan Fasilitas PPN atau PPN dan PPnBM tidak dipungut/ditanggung pemerintah'],
	['08', 'Penyerahan dengan fasilitas dibebaskan PPN atau PPN dan PPnBM'],
	['09', 'Penyerahan Aktiva yang Menurut Tujuan Semula Tidak Diperjualbelikan'],
	['10', 'Penyerahan Lainnya']
];

const workbook = XLSX.utils.book_new();

const fakturSheet = XLSX.utils.aoa_to_sheet([
	['NPWP Penjual', null, 'xxxxxxxxxxxxxxxx'],
	[],
	[
		'Baris',
		'Tanggal Faktur',
		'Jenis Faktur',
		'Kode Transaksi',
		'Keterangan Tambahan',
		'Dokumen Pendukung',
		'Period Dok Pendukung',
		'Referensi',
		'Cap Fasilitas',
		'ID TKU Penjual',
		'NPWP/NIK Pembeli',
		'Jenis ID Pembeli',
		'Negara Pembeli',
		'Nomor Dokumen Pembeli',
		'Nama Pembeli',
		'Alamat Pembeli',
		'Email Pembeli',
		'ID TKU Pembeli'
	],
	[
		1,
		'27/08/2026',
		'Normal',
		'01',
		null,
		null,
		null,
		'Referensi contoh',
		null,
		'xxxxxxxxxxxxxxxx000000',
		'xxxxxxxxxxxxxxxx',
		'TIN',
		'IDN',
		'-',
		'-',
		'Contoh Alamat Pembeli',
		'-',
		'xxxxxxxxxxxxxxxx000000'
	],
	['END']
]);
XLSX.utils.book_append_sheet(workbook, fakturSheet, 'Faktur');

const detailSheet = XLSX.utils.aoa_to_sheet([
	[
		'Baris',
		'Barang/Jasa',
		'Kode Barang Jasa',
		'Nama Barang/Jasa',
		'Nama Satuan Ukur',
		'Harga Satuan',
		'Jumlah Barang Jasa',
		'Total Diskon',
		'DPP',
		'DPP Nilai Lain',
		'Tarif PPN',
		'PPN',
		'Tarif PPnBM',
		'PPnBM'
	],
	[1, 'A', '000000', 'Contoh Barang', 'UM.0001', 15000, 200, 100000, 2900000, 2900000, 12, 348000, 0, 0],
	['END']
]);
XLSX.utils.book_append_sheet(workbook, detailSheet, 'DetailFaktur');

const refSheet = XLSX.utils.aoa_to_sheet([
	['Kode', 'Keterangan'],
	['Barang/Jasa', 'A'],
	[null, 'Barang'],
	['', 'B'],
	[null, 'Jasa'],
	['Kode Transaksi', ''],
	...transactionCodes
]);
XLSX.utils.book_append_sheet(workbook, refSheet, 'REF');

const notesSheet = XLSX.utils.aoa_to_sheet([
	['Sheet', 'Kolom', 'Wajib', 'Keterangan'],
	['Faktur', 'Baris', 'Ya', 'Urut dari angka 1, sama dengan Baris pada sheet DetailFaktur'],
	['Faktur', 'Tanggal Faktur', 'Ya', 'Format DD/MM/YYYY'],
	['Faktur', 'Jenis Faktur', 'Ya', 'Selalu diisi: Normal'],
	['Faktur', 'Kode Transaksi', 'Ya', 'Lihat sheet REF, 2 digit (01-10)'],
	['Faktur', 'Keterangan Tambahan', 'Tidak', 'Wajib diisi untuk Kode Transaksi 07 atau 08, format "<kode> - <nama>"'],
	['Faktur', 'Referensi', 'Tidak', ''],
	['Faktur', 'NPWP/NIK Pembeli', 'Ya', ''],
	['Faktur', 'Alamat Pembeli', 'Tidak', "Isikan '-' jika tidak ada"],
	['DetailFaktur', 'Baris', 'Ya', 'Wajib diisi sesuai kolom Baris dari sheet Faktur'],
	['DetailFaktur', 'Barang/Jasa', 'Ya', 'Lihat sheet REF: A = Barang, B = Jasa'],
	['DetailFaktur', 'Kode Barang Jasa', 'Ya', 'Kode barang/jasa tanpa awalan A/B, contoh: 000000'],
	['DetailFaktur', 'Nama Barang/Jasa', 'Ya', ''],
	['DetailFaktur', 'Nama Satuan Ukur', 'Ya', 'Kode satuan ukur, contoh: UM.0001 (lihat pilihan pada form Buat Faktur)'],
	['DetailFaktur', 'Harga Satuan', 'Ya', 'Maks 2 digit di belakang koma'],
	['DetailFaktur', 'Jumlah Barang Jasa', 'Ya', ''],
	['DetailFaktur', 'Total Diskon', 'Ya', 'Isikan 0 jika tidak ada'],
	['DetailFaktur', 'DPP Nilai Lain', 'Ya', ''],
	['DetailFaktur', 'Tarif PPN', 'Ya', 'Ikut tarif yang berlaku'],
	['DetailFaktur', 'Tarif PPnBM', 'Ya', 'Isikan 0 jika tidak ada']
]);
XLSX.utils.book_append_sheet(workbook, notesSheet, 'Keterangan');

const file = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer', compression: true });
writeFileSync(fileURLToPath(outputFile), file);
