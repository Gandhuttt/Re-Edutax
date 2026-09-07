<script lang="ts">
	import ProfileDataTable from '../_components/ProfileDataTable.svelte';

	const tabs = [
		{ label: 'Nomor Identifikasi Eksternal', columns: ['Tipe', 'Nomor Identifikasi', 'Tanggal Mulai', 'Tanggal Berakhir'], rows: [['Nomor Registrasi Contoh', 'REG-DEMO-0001', '15/01/2024', '-']] },
		{ label: 'Sertifikat Digital', columns: ['Jenis Sertifikat Digital', 'ID Penandatangan', 'Status Kepemilikan', 'Tanggal Mulai', 'Tanggal Berakhir'], rows: [['Sertifikat Elektronik', 'SIGNER-DEMO-01', 'Dimiliki', '15/01/2024', '15/01/2026']] }
	];
	const history = { label: 'Riwayat', columns: ['Jenis Data', 'Nomor/ID', 'Perubahan', 'Tanggal Perubahan'], rows: [['Nomor Identifikasi Eksternal', 'REG-DEMO-0001', 'Data dibuat', '15/01/2024']] };
</script>

<ProfileDataTable title="Nomor Identifikasi Eksternal" {tabs} {history} />
