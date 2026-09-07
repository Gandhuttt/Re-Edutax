<script lang="ts">
	import ProfileDataTable from '../_components/ProfileDataTable.svelte';
	const columns = ['Nomor KK', 'Anggota sesuai NIK', 'Nama', 'Tanggal Lahir', 'Hubungan', 'Pekerjaan', 'Status Unit Perpajakan', 'Status PTKP', 'Data Dukcapil', 'Tanggal Berakhir'];
	const rows = [['0000000000000000', '0000000000000000', 'Anggota Keluarga Contoh', '01/01/1990', 'Kepala Keluarga', 'Pegawai Swasta', 'Kepala Unit', 'K/0', 'Sesuai', '-']];
</script>

<ProfileDataTable title="Data Unit Keluarga" data={{ columns, rows }} />
