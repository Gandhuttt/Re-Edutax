<script lang="ts">
	import StatusApplicationForm, { type StatusFormConfig } from '../pencabutan-pemungut-bea-meterai/StatusApplicationForm.svelte';

	const config: StatusFormConfig = {
		title: 'Penetapan Pemungut Bea Meterai',
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
				title: 'Data Pemungut Bea Meterai',
				fields: [
					{ name: 'business-unit-name', label: 'Nama Unit atau Tempat Kegiatan Usaha', required: true },
					{ name: 'collection-start-date', label: 'Tanggal Mulai Pemungutan', type: 'date', required: true },
					{
						name: 'document-type',
						label: 'Jenis Dokumen Terutang Bea Meterai',
						type: 'select',
						required: true,
						options: [
							'Dokumen perjanjian atau surat lainnya',
							'Dokumen transaksi surat berharga',
							'Dokumen lelang',
							'Dokumen transaksi keuangan',
							'Dokumen lainnya',
						],
					},
					{ name: 'monthly-document-count', label: 'Perkiraan Jumlah Dokumen per Bulan', type: 'number', min: '1', step: '1', required: true },
					{ name: 'document-mechanism', label: 'Mekanisme Pembuatan Dokumen', type: 'select', required: true, options: ['Dokumen Kertas', 'Dokumen Elektronik', 'Kertas dan Elektronik'] },
					{ name: 'collection-location', label: 'Lokasi Pemungutan', required: true },
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
				description: 'Unggah dokumen yang jelas dan dapat dibaca.',
				fields: [
					{ name: 'application-letter', label: 'Surat Permohonan Penetapan', type: 'file', accept: '.pdf', required: true, full: false },
					{ name: 'document-type-list', label: 'Daftar Jenis Dokumen', type: 'file', accept: '.pdf,.xls,.xlsx', required: true, full: false },
				],
			},
		],
		declaration: 'Saya menyatakan bahwa seluruh informasi dan dokumen yang disampaikan adalah benar, lengkap, dan dapat dipertanggungjawabkan.',
		successMessage: 'Permohonan penetapan pemungut Bea Meterai telah disimpan.',
	};
</script>

<StatusApplicationForm {config} />
