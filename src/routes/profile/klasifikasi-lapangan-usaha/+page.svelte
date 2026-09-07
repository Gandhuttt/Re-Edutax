<script lang="ts">
	import ProfileDataTable from '../_components/ProfileDataTable.svelte';
	const columns = ['Kode KLU', 'Deskripsi TKU', 'Tanggal Mulai', 'Tanggal Berakhir'];
	const rows = [['62010', 'Aktivitas pemrograman komputer untuk unit kegiatan usaha contoh', '15/01/2024', '-']];
</script>

<ProfileDataTable title="Klasifikasi Lapangan Usaha" data={{ columns, rows }} />
