import { objek_pajak_spt_pph_badan } from '../../schema';
import type { SeedContext } from '../context';
import { batchInsert } from '../helpers';

export const name = '008 lampiran 4 objek pajak PPh final reference data';

const objekPajakOptions = [
	'Penghasilan Sehubungan dengan Transaksi Penjualan Barang, Penyerahan Jasa, dan/atau Persewaan serta Penghasilan Lain Sehubungan dengan Penggunaan Harta yang Dilakukan Melalui Pihak Lain dalam Sistem Informasi Pengadaan Pemerintah',
	'Penghasilan yang Diterima atau Diperoleh Pedagang Dalam Negeri Penjualan Barang, Penyerahan Jasa, dan/atau Persewaan serta Penghasilan Lain Sehubungan dengan Penggunaan Harta yang Dilakukan Melalui Perdagangan Melalui Sistem Elektronik',
	'Penjualan BBM oleh Pertamina atau Anak Perusahaan Pertamina Kepada SPBU (Final)',
	'Penjualan BBM oleh Badan Usaha Selain Pertamina atau Anak Perusahaan Pertamina Kepada SPBU/Agen/Penyalur  (Final)',
	'Penjualan BBG oleh produsen/importir Kepada SPBU/Agen/Penyalur (Final)',
	'Penjualan BBM oleh Pertamina atau Anak Perusahaan Pertamina kepada Agen/Penyalur selain SPBU (Final)',
	'Penghasilan Sehubungan dengan Aset Kripto yang dipungut oleh Penyelenggara Perdagangan Melalui Sistem Elektronik yang Merupakan Pedagang Fisik Aset Kripto',
	'Penghasilan Sehubungan dengan Aset Kripto yang dipungut oleh Penyelenggara Perdagangan Melalui Sistem Elektronik yang Bukan Merupakan Pedagang Fisik Aset Kripto',
	'Penghasilan Sehubungan dengan Aset Kripto (Setor Sendiri)',
	'Bunga Obligasi, Surat Utang Negara, atau Obligasi Daerah yang Diterima Wajib Pajak Dalam Negeri dan Bentuk Usaha Tetap.',
	'Bunga Obligasi yang Diterima Wajib Pajak Dalam Negeri dan Bentuk Usaha Tetap yang diadministrasikan oleh BI',
	'Diskonto Surat Perbendaharaan Negara yang Diterima Wajib Pajak Dalam Negeri dan Bentuk Usaha Tetap',
	'Diskonto Surat Perbendaharaan Negara yang Diterima Wajib Pajak Penduduk/Berkedudukan di Luar Negeri',
	'Bunga Obligasi yang Diterima Wajib Pajak Dalam Negeri dan Bentuk Usaha Tetap',
	'Pengalihan Hak atas Tanah dan/atau Bangunan',
	'Pengalihan Rumah Sederhana dan Rumah Susun Sederhana yang Dilakukan oleh WP yang Usaha Pokoknya Mengalihkan Hak atas Tanah dan/atau Bangunan',
	'Pengalihan Hak atas Tanah dan/atau Bangunan kepada Pemerintah, BUMN yang Mendapat Penugasan Khusus dari Pemerintah, atau BUMD yang Mendapat Penugasan Khusus dari Kepala Daerah, sesuai UU mengenai Pengadaan Tanah bagi Pembangunan untuk Kepentingan Umum',
	'Persewaan Tanah dan/atau Bangunan',
	'Bunga Tabungan dan Bunga Deposito yang Ditempatkan di Dalam Negeri yang Dananya Bersumber Selain dari Devisa Hasil Ekspor (DHE)',
	'Bunga Deposito yang Ditempatkan di Dalam Negeri (mata uang IDR bersumber dari DHE tenor 1 bulan)',
	'Bunga Deposito yang Ditempatkan di Dalam Negeri (mata uang IDR bersumber dari DHE tenor 3 bulan)',
	'Bunga Deposito yang Ditempatkan di Dalam Negeri (mata uang IDR bersumber dari DHE tenor 6 bulan atau lebih)',
	'Bunga Deposito yang Ditempatkan di Dalam Negeri (mata uang USD bersumber dari DHE tenor 1 bulan)',
	'Bunga Deposito yang Ditempatkan di Dalam Negeri (mata uang USD bersumber dari DHE tenor 3 bulan)',
	'Bunga Deposito yang Ditempatkan di Dalam Negeri (mata uang USD bersumber dari DHE tenor 6 bulan)',
	'Bunga Deposito yang Ditempatkan di Dalam Negeri (mata uang USD bersumber dari DHE tenor lebih 6 bulan)',
	'Bunga Deposito/Tabungan yang Ditempatkan di Luar Negeri Melalui Bank yang Didirikan atau Bertempat Kedudukan di Indonesia atau Cabang Bank Luar Negeri di Indonesia',
	'Diskonto Sertifikat Bank Indonesia',
	'Jasa Giro',
	'Hadiah Undian',
	'Transaksi Penjualan Saham di Bursa Efek (Bukan Saham Pendiri)',
	'Transaksi Penjualan Saham di Bursa Efek (Saham Pendiri)',
	'Transaksi Penjualan Saham Milik Perusahaan Modal Ventura Tidak di Bursa Efek',
	'Jasa Konstruksi Berupa Jasa Perencanaan Konstruksi (Dengan Kualifikasi Usaha)',
	'Jasa Konstruksi Berupa Jasa Perencanaan Konstruksi (Tanpa Kualifikasi Usaha)',
	'Jasa Konstruksi Berupa Jasa Pelaksanaan Konstruksi (Kualifikasi Usaha Kecil)',
	'Jasa Konstruksi Berupa Jasa Pelaksanaan Konstruksi (Kualifikasi Usaha Menengah dan Besar)',
	'Jasa Konstruksi Berupa Jasa Pelaksanaan Konstruksi (Tanpa Kualifikasi Usaha)',
	'Jasa Konstruksi Berupa Jasa Pengawasan Konstruksi (Dengan Kualifikasi Usaha)',
	'Jasa Konstruksi Berupa Jasa Pengawasan Konstruksi (Tanpa Kualifikasi Usaha)',
	'Pekerjaan Konstruksi yang Dilakukan oleh Penyedia Jasa yang Memiliki Sertifikat Badan Usaha Kualifikasi Kecil atau Sertifikat Kompetensi Kerja untuk Usaha Orang Perseorangan',
	'Pekerjaan Konstruksi yang Dilakukan oleh Penyedia Jasa yang Tidak Memiliki Sertifikat Badan Usaha Atau Sertifikat Kompetensi Kerja untuk Usaha Orang Perseorangan',
	'Pekerjaan Konstruksi yang Dilakukan oleh Penyedia Jasa yang Memiliki Sertifikat Selain Sertifikat Badan Usaha Kualifikasi Kecil atau Sertifikat Kompetensi Kerja untuk Usaha Orang Perseorangan',
	'Pekerjaan Konstruksi Terintegrasi yang Dilakukan oleh Penyedia Jasa yang Memiliki Sertifikat Badan Usaha',
	'Pekerjaan Konstruksi Terintegrasi yang Dilakukan oleh Penyedia Jasa yang Tidak Memiliki Sertifikat Badan Usaha',
	'Jasa Konsultansi Konstruksi yang Dilakukan oleh Penyedia Jasa yang Memiliki Sertifikat Badan Usaha atau Sertifikat Kompetensi Kerja untuk Usaha Orang Perseorangan',
	'Jasa Konsultansi Konstruksi yang Dilakukan oleh Penyedia Jasa yang Tidak Memiliki Sertifikat Badan Usaha atau Sertifikat Kompetensi Kerja untuk Usaha Orang Perseorangan',
	'Imbalan yang Diterima/Diperoleh Sehubungan dengan Pengangkutan Orang dan/atau Barang Termasuk Penyewaan Kapal Laut Oleh Perusahaan Pelayaran Dalam Negeri',
	'Imbalan yang Dibayarkan/Terutang kepada Perusahaan Pelayaran Dalam Negeri',
	'Imbalan yang Dibayarkan/Terutang kepada Perusahaan Pelayaran dan/atau Penerbangan Luar Negeri Sehubungan dengan Pengangkutan Orang dan/atau Barang (Selain Berdasarkan Perjanjian Charter)',
	'Imbalan Charter Kapal Laut dan/atau Pesawat Udara yang Dibayarkan/ Terutang kepada Perusahaan Pelayaran dan/atau Penerbangan Luar Negeri  melalui BUT di Indonesia',
	'Penghasilan Wajib Pajak Luar Negeri yang Mempunyai Kantor Perwakilan Dagang di Indonesia',
	'Revaluasi atau penilaian kembali aset tetap',
	'Bunga Simpanan yang Dibayarkan oleh Koperasi kepada Anggota Wajib Pajak Orang Pribadi (bunga sampai dengan Rp240.000,00)',
	'Bunga Simpanan yang Dibayarkan oleh Koperasi kepada Anggota Wajib Pajak Orang Pribadi (bunga di atas Rp240.000,00)',
	'Dividen yang Diterima/Diperoleh Wajib Pajak Orang Pribadi Dalam Negeri',
	'Uplift Hulu Migas',
	'Participating Interest Eksplorasi Hulu Migas',
	'Participating Interest Eksploitasi Hulu Migas',
	'Transaksi dengan Wajib Pajak yang menggunakan tarif Peraturan Pemerintah Nomor 23 Tahun 2018',
	'Transaksi dengan Wajib Pajak yang menggunakan tarif Peraturan Pemerintah Nomor 55 Tahun 2022',
	'Penghasilan yang dikenakan pajak bersifat final sesuai Peraturan Pemerintah Nomor 23/55 (Disetor Sendiri)',
	'Perjanjian Pengikatan Jual Beli',
	'Penghasilan Wajib Pajak yang Melakukan Kegiatan Usaha Jasa Maklon (Contract Manufacturing) Internasional di Bidang Produksi Mainan Anak-Anak',
	'Penghasilan yang Diterima atau Diperoleh Sehubungan dengan Kerja Sama dengan Lembaga Pengelola Investasi (LPI)',
	'Penghasilan Final Lainnya'
] as const;

const slugify = (value: string) =>
	value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '_')
		.replace(/^_+|_+$/g, '');

const objekPajakId = (kode: string) => `objek-pajak-${kode}`;

export const run = async ({ db }: SeedContext) => {
	await batchInsert(
		db,
		objekPajakOptions.map((nama, index) => {
			const kode = slugify(nama);

			return db
				.insert(objek_pajak_spt_pph_badan)
				.values({
					id: objekPajakId(kode),
					kode,
					nama,
					nomorUrut: index + 1
				})
				.onConflictDoUpdate({
					target: objek_pajak_spt_pph_badan.kode,
					set: { nama, nomorUrut: index + 1, aktif: true }
				});
		})
	);

	console.log(`Seeded SPT PPh Badan references: ${objekPajakOptions.length} objek pajak PPh final`);

	return [];
};
