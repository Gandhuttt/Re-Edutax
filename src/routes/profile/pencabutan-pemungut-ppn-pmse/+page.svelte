<script lang="ts">
	import StatusApplicationForm, { type StatusFormConfig } from '../pencabutan-pemungut-bea-meterai/StatusApplicationForm.svelte';

	const config: StatusFormConfig = {
		title: 'Pencabutan Pemungut PPN PMSE Dalam Negeri',
		intro: 'Ajukan pencabutan status sebagai Pemungut PPN Perdagangan Melalui Sistem Elektronik dalam negeri.',
		sections: [
			{
				title: 'Data Pemungut PPN PMSE',
				fields: [
					{ name: 'appointment-number', label: 'Nomor Keputusan Penunjukan', required: true, placeholder: 'Nomor keputusan' },
					{ name: 'appointment-date', label: 'Tanggal Keputusan Penunjukan', type: 'date', required: true },
					{ name: 'platform-name', label: 'Nama Platform/Sistem Elektronik', required: true, placeholder: 'Nama platform yang terdaftar' },
					{ name: 'website', label: 'Alamat Situs atau Aplikasi', placeholder: 'https://contoh.id' },
					{ name: 'revocation-date', label: 'Tanggal Pencabutan yang Diusulkan', type: 'date', required: true },
					{ name: 'reason', label: 'Alasan Pencabutan', type: 'textarea', required: true, full: true, placeholder: 'Jelaskan alasan pengajuan pencabutan status' }
				]
			},
			{
				title: 'Dokumen Pendukung',
				fields: [{ name: 'supporting-document', label: 'Dokumen Pendukung', type: 'file', required: true, accept: '.pdf,.jpg,.jpeg,.png', help: 'Lampirkan dokumen yang mendukung penghentian atau perubahan kegiatan PMSE.' }]
			}
		]
	};
</script>

<StatusApplicationForm {config} />
