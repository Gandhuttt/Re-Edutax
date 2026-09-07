<script lang="ts">
	import ProfileDataTable from '../_components/ProfileDataTable.svelte';

	const columns = [
		'NITKU', 'Jenis TKU', 'Nama TKU', 'KLU TKU', 'Deskripsi KLU', 'NPWP/NIK PIC', 'Nama PIC', 'Detail Alamat', 'RT/RW', 'Provinsi', 'Kota/Kabupaten', 'Kecamatan', 'Kelurahan', 'Kode Wilayah', 'Kode Pos', 'Data Geometri', 'Lokasi Disewa', 'Tanggal Sewa Mulai', 'Tanggal Sewa Akhir', 'Tanggal Mulai', 'Tanggal Berakhir', 'Toko Eceran Pengembalian PPN', 'Zona Perdagangan Bebas', 'Kawasan Ekonomi Khusus', 'Tempat Penimbunan Berikat', 'Detail TPB', 'Nomor SK', 'Tanggal SK', 'Tanggal Akhir SK', 'Kantor Virtual', 'Alamat PPN', 'Kode KPP', 'Seksi Pengawasan'
	];
	const rows = [[
		'NITKU-DEMO-0001', 'Kantor Cabang', 'Unit Kegiatan Contoh', '62010', 'Aktivitas pemrograman komputer', '00.000.000.0-000.001', 'PIC Contoh', 'Jalan Contoh No. 10', '001/002', 'Jawa Barat', 'Kota Contoh', 'Kecamatan Contoh', 'Kelurahan Contoh', '32.71.01.1001', '40100', '-', 'Tidak', '-', '-', '15/01/2024', '-', 'Tidak', 'Tidak', 'Tidak', 'Tidak', '-', '-', '-', '-', 'Tidak', 'Sama dengan alamat TKU', 'KPP-DEMO', 'Seksi Pengawasan I'
	]];
</script>

<ProfileDataTable title="Tempat Kegiatan Usaha" data={{ columns, rows }} />
