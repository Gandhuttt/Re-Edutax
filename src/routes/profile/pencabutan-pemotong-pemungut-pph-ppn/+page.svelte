<script lang="ts">
	import StatusApplicationForm, { type StatusFormConfig } from '../pencabutan-pemungut-bea-meterai/StatusApplicationForm.svelte';

	const config: StatusFormConfig = {
		title: 'Pencabutan Pemotong/Pemungut PPh atau PPN',
		intro: 'Ajukan pencabutan atas satu atau lebih penunjukan sebagai pemotong atau pemungut pajak.',
		sections: [
			{
				title: 'Data Status yang Dicabut',
				fields: [
					{ name: 'tax-role', label: 'Status yang Akan Dicabut', type: 'select', required: true, options: ['Pemotong PPh', 'Pemungut PPh', 'Pemungut PPN', 'Pemotong/Pemungut PPh dan Pemungut PPN'] },
					{ name: 'appointment-number', label: 'Nomor Keputusan Penunjukan', required: true, placeholder: 'Nomor keputusan' },
					{ name: 'appointment-date', label: 'Tanggal Keputusan Penunjukan', type: 'date', required: true },
					{ name: 'revocation-date', label: 'Tanggal Pencabutan yang Diusulkan', type: 'date', required: true },
					{ name: 'reason', label: 'Alasan Pencabutan', type: 'textarea', required: true, full: true, placeholder: 'Jelaskan perubahan keadaan yang mendasari pencabutan' }
				]
			},
			{
				title: 'Dokumen Pendukung',
				fields: [{ name: 'supporting-document', label: 'Dokumen Pendukung Pencabutan', type: 'file', required: true, accept: '.pdf,.jpg,.jpeg,.png' }]
			}
		]
	};
</script>

<StatusApplicationForm {config} />
