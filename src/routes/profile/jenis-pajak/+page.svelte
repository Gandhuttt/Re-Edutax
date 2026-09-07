<script lang="ts">
	import ProfileDataTable from '../_components/ProfileDataTable.svelte';

	const columns = ['Jenis Pajak', 'Tanggal Permohonan', 'Tanggal Mulai Transaksi', 'Tanggal Pendaftaran', 'Tanggal Pencabutan', 'Nomor Kasus', 'Alasan/Catatan'];
	const tabs = [
		{ label: 'Pendaftaran Tertunda', columns, rows: [['Pajak Contoh', '01/08/2026', '-', '-', '-', 'CASE-DEMO-001', 'Menunggu verifikasi']] },
		{ label: 'Terdaftar', columns, rows: [['Pajak Pertambahan Nilai', '15/01/2024', '01/02/2024', '01/02/2024', '-', 'CASE-DEMO-002', 'Terdaftar']] },
		{ label: 'Ditolak', columns, rows: [['Pajak Contoh', '10/01/2024', '-', '-', '-', 'CASE-DEMO-003', 'Data permohonan belum lengkap']] },
		{ label: 'Penarikan selama Proses', columns, rows: [['Pajak Contoh', '12/01/2024', '-', '-', '14/01/2024', 'CASE-DEMO-004', 'Permohonan ditarik oleh pemohon']] },
		{ label: 'Tidak Terdaftar', columns, rows: [] }
	];
</script>

<ProfileDataTable title="Jenis Pajak" {tabs} />
