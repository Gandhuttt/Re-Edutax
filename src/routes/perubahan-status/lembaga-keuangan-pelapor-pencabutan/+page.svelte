<script lang="ts">
	import StatusApplicationForm, { type StatusFormConfig } from '../pencabutan-pemungut-bea-meterai/StatusApplicationForm.svelte';

	const config: StatusFormConfig = {
		title: 'Lembaga Keuangan Pelapor - Pencabutan',
		intro: 'Ajukan pencabutan status Lembaga Keuangan Pelapor karena penghentian kegiatan atau perubahan klasifikasi.',
		sections: [
			{
				title: 'Data Status Lembaga Keuangan Pelapor',
				fields: [
					{ name: 'reporter-category', label: 'Kategori Lembaga Keuangan', type: 'select', required: true, options: ['Lembaga Kustodian', 'Lembaga Simpanan', 'Entitas Investasi', 'Perusahaan Asuransi Tertentu', 'Lembaga Keuangan Lainnya'] },
					{ name: 'appointment-number', label: 'Nomor Penetapan', required: true, placeholder: 'Nomor penetapan lembaga pelapor' },
					{ name: 'appointment-date', label: 'Tanggal Penetapan', type: 'date', required: true },
					{ name: 'cessation-date', label: 'Tanggal Berhenti Kegiatan', type: 'date', required: true },
					{ name: 'reason', label: 'Alasan Pencabutan', type: 'textarea', required: true, full: true, placeholder: 'Jelaskan alasan pencabutan status lembaga pelapor' }
				]
			},
			{
				title: 'Dokumen Pendukung',
				fields: [{ name: 'supporting-document', label: 'Dokumen Pendukung Pencabutan', type: 'file', required: true, accept: '.pdf,.jpg,.jpeg,.png', help: 'Contoh: keputusan penghentian kegiatan atau perubahan izin.' }]
			}
		]
	};
</script>

<StatusApplicationForm {config} />
