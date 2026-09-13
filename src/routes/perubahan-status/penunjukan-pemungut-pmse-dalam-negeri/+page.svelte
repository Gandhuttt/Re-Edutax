<script lang="ts">
	import StatusApplicationForm, { type StatusFormConfig } from '../pencabutan-pemungut-bea-meterai/StatusApplicationForm.svelte';

	const config: StatusFormConfig = {
		title: 'Penunjukan Pemungut PMSE Dalam Negeri',
		representativeLabel: 'Diisi oleh perwakilan Wajib Pajak?',
		representativeIdLabel: 'ID Penunjukan Wakil Wajib Pajak',
		representativeIdPlaceholder: '',
		representativeTaxIdLabel: 'NIK/NPWP Perwakilan',
		representativeDetailsPlaceholder: '',
		identityFields: [
			{ name: 'taxpayer-id', label: 'NIK/TIN', placeholder: 'NIK/NPWP Wajib Pajak', required: true, disabled: true },
			{ name: 'taxpayer-name', label: 'Nama Wajib Pajak', disabled: true },
			{ name: 'business-id', label: 'Nomor Induk Berusaha', inputMode: 'numeric' },
			{ name: 'address', label: 'Alamat', type: 'textarea', rows: 2, disabled: true, full: true },
		],
		sections: [
			{
				title: 'Data Perdagangan Melalui Sistem Elektronik',
				fields: [
					{ name: 'electronic-system-name', label: 'Nama Sistem Elektronik', required: true },
					{ name: 'business-model', label: 'Model Bisnis', type: 'select', required: true, options: ['Lokapasar (marketplace)', 'Ritel daring', 'Iklan baris daring', 'Platform berbagi', 'Lainnya'] },
					{ name: 'website', label: 'Alamat Situs Web atau Aplikasi', type: 'url', placeholder: 'https://', required: true, full: true },
					{ name: 'business-start-date', label: 'Tanggal Mulai Kegiatan PMSE', type: 'date', required: true },
					{ name: 'annual-indonesian-users', label: 'Jumlah Pengakses di Indonesia per Tahun', type: 'number', min: '0', step: '1', required: true },
					{ name: 'annual-indonesian-transaction-value', label: 'Nilai Transaksi dengan Pembeli Indonesia per Tahun (Rp)', type: 'number', min: '0', step: '1', required: true },
					{ name: 'annual-indonesian-transaction-count', label: 'Jumlah Transaksi dengan Pembeli Indonesia per Tahun', type: 'number', min: '0', step: '1', required: true },
					{ name: 'business-description', label: 'Uraian Kegiatan Usaha', type: 'textarea', rows: 3, maxLength: 1000, required: true, full: true },
				],
			},
			{
				title: 'Penanggung Jawab',
				fields: [
					{ name: 'officer-name', label: 'Nama Lengkap', required: true },
					{ name: 'officer-position', label: 'Jabatan', required: true },
					{ name: 'officer-phone', label: 'Nomor Telepon', type: 'tel', inputMode: 'tel', required: true },
					{ name: 'officer-email', label: 'Alamat Email', type: 'email', required: true },
				],
			},
			{
				title: 'Dokumen Persyaratan',
				description: 'Format PDF, JPG, JPEG, atau PNG.',
				fields: [
					{ name: 'application-letter', label: 'Surat Permohonan', type: 'file', accept: '.pdf', required: true, full: false },
					{ name: 'business-license', label: 'Dokumen Izin atau Profil Usaha', type: 'file', accept: '.pdf,.jpg,.jpeg,.png', required: true, full: false },
				],
			},
		],
		declaration: 'Saya menyatakan bahwa seluruh informasi dan dokumen yang disampaikan adalah benar, lengkap, dan dapat dipertanggungjawabkan.',
		successMessage: 'Permohonan penunjukan pemungut PMSE dalam negeri telah disimpan.',
	};
</script>

<StatusApplicationForm {config} />
