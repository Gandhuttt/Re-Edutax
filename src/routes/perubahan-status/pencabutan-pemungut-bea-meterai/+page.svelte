<script lang="ts">
	import StatusApplicationForm, { type StatusFormConfig } from './StatusApplicationForm.svelte';

	const config: StatusFormConfig = {
		title: 'Pencabutan Pemungut Bea Meterai',
		intro: 'Gunakan formulir ini untuk mengajukan pencabutan status sebagai Pemungut Bea Meterai.',
		sections: [
			{
				title: 'Data Pencabutan Pemungut Bea Meterai',
				description: 'Lengkapi data penetapan yang akan dicabut dan alasan pencabutannya.',
				fields: [
					{ name: 'appointment-number', label: 'Nomor Keputusan Penetapan', required: true, placeholder: 'Nomor keputusan' },
					{ name: 'appointment-date', label: 'Tanggal Keputusan Penetapan', type: 'date', required: true },
					{ name: 'revocation-date', label: 'Tanggal Pencabutan yang Diusulkan', type: 'date', required: true },
					{ name: 'collector-type', label: 'Jenis Pemungut', type: 'select', required: true, options: ['Produsen Dokumen', 'Pihak yang Memfasilitasi Pemakaian Meterai Elektronik', 'Pemungut Lainnya'] },
					{ name: 'reason', label: 'Alasan Pencabutan', type: 'textarea', required: true, full: true, placeholder: 'Jelaskan alasan pengajuan pencabutan' }
				]
			},
			{
				title: 'Dokumen Pendukung',
				fields: [{ name: 'supporting-document', label: 'Dokumen Pendukung Pencabutan', type: 'file', required: true, accept: '.pdf,.jpg,.jpeg,.png', help: 'Format PDF, JPG, JPEG, atau PNG.' }]
			}
		]
	};
</script>

<StatusApplicationForm {config} />
