<script lang="ts">
	import ProfileDataTable from '../_components/ProfileDataTable.svelte';
	const columns = ['Nama Bank', 'Nomor Rekening', 'Jenis Rekening', 'Nama Pemilik', 'Rekening Utama', 'Tanggal Mulai', 'Tanggal Berakhir'];
	const rows = [['Bank Contoh', '0000000001', 'Giro', 'PT Contoh Nusantara', 'Ya', '15/01/2024', '-']];
</script>

<ProfileDataTable title="Detail Bank" data={{ columns, rows }} />
