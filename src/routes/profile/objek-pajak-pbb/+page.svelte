<script lang="ts">
	import ProfileDataTable from '../_components/ProfileDataTable.svelte';

	const columns = ['NOP', 'Nama Objek Pajak', 'Sektor', 'Jenis/Subsektor', 'Tipe Bumi', 'Rincian', 'Status Kegiatan', 'Instansi Pemberi Izin', 'Luas Objek Pajak', 'NIB', 'Tanggal NIB', 'Nomor/Tanggal Izin Objek', 'Detail Alamat', 'Provinsi', 'Kota/Kabupaten', 'Kecamatan', 'Kelurahan', 'Kode Wilayah', 'Kode Pos', 'Data Geometri', 'Tanggal Pendaftaran/Pencabutan', 'Kode KPP', 'Seksi Pengawasan'];
	const rows = [['32.71.000.000.000-0000.0', 'Objek Pajak Contoh', 'Perkotaan', 'Bangunan usaha', 'Tanah', 'Bangunan satu lantai', 'Aktif', 'Dinas Perizinan Daerah', '120 m²', 'NIB-DEMO-0001', '15/01/2024', 'IZIN-DEMO-01 / 15/01/2024', 'Jalan Contoh No. 10', 'Jawa Barat', 'Kota Contoh', 'Kecamatan Contoh', 'Kelurahan Contoh', '32.71.01.1001', '40100', '-', '15/01/2024 / -', 'KPP-DEMO', 'Seksi Pengawasan I']];
</script>

<ProfileDataTable title="Objek Pajak PBB" data={{ columns, rows }} />
