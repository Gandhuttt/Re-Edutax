<script lang="ts">
	import StatusApplicationForm, { type StatusFormConfig } from '../pencabutan-pemungut-bea-meterai/StatusApplicationForm.svelte';

	const config: StatusFormConfig = {
		title: 'Pengaktifan Kembali Wajib Pajak Nonaktif',
		representativeLabel: 'Diisi oleh perwakilan Wajib Pajak?',
		representativeIdLabel: 'ID Penunjukan Wakil Wajib Pajak',
		representativeIdPlaceholder: '',
		representativeTaxIdLabel: 'NIK/NPWP Perwakilan',
		representativeDetailsPlaceholder: '',
		identityFields: [
			{ name: 'taxpayer-id', label: 'NIK/TIN', placeholder: 'NIK/NPWP Wajib Pajak', required: true, disabled: true },
			{ name: 'taxpayer-name', label: 'Nama Wajib Pajak', disabled: true },
			{ name: 'current-status', label: 'Status Saat Ini', value: 'Nonaktif', disabled: true },
			{ name: 'address', label: 'Alamat', type: 'textarea', rows: 2, disabled: true, full: true },
		],
		sections: [
			{
				title: 'Data Pengaktifan Kembali',
				fields: [
					{
						name: 'reason',
						label: 'Alasan Pengaktifan Kembali',
						type: 'select',
						required: true,
						options: [
							'Kembali melakukan kegiatan usaha atau pekerjaan bebas',
							'Kembali memenuhi persyaratan subjektif dan/atau objektif',
							'Kembali tinggal atau berada di Indonesia',
							'Alasan lainnya',
						],
					},
					{ name: 'active-start-date', label: 'Tanggal Mulai Aktif yang Diajukan', type: 'date', required: true },
					{ name: 'reason-explanation', label: 'Penjelasan Alasan', type: 'textarea', rows: 4, maxLength: 1000, placeholder: 'Jelaskan alasan pengaktifan kembali', required: true, full: true },
				],
			},
			{
				title: 'Dokumen Persyaratan',
				description: 'Unggah dokumen yang menunjukkan bahwa persyaratan sebagai Wajib Pajak aktif telah terpenuhi kembali.',
				fields: [
					{ name: 'supporting-document', label: 'Dokumen Pendukung', type: 'file', accept: '.pdf,.jpg,.jpeg,.png', help: 'Format PDF, JPG, JPEG, atau PNG.', required: true },
				],
			},
		],
		declaration: 'Dengan menyadari sepenuhnya segala akibat termasuk sanksi sesuai ketentuan yang berlaku, saya menyatakan bahwa data dan dokumen yang disampaikan adalah benar dan lengkap.',
		successMessage: 'Permohonan pengaktifan kembali telah disimpan.',
	};
</script>

<StatusApplicationForm {config} />
