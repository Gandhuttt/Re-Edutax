<script lang="ts">
	import StatusApplicationForm, { type StatusFormConfig } from '../pencabutan-pemungut-bea-meterai/StatusApplicationForm.svelte';

	const config: StatusFormConfig = {
		title: 'Penunjukan Pemotong/Pemungut PPh atau PPN',
		intro: 'Ajukan penunjukan sebagai pemotong atau pemungut Pajak Penghasilan dan/atau Pajak Pertambahan Nilai.',
		sections: [
			{
				title: 'Data Penunjukan',
				fields: [
					{ name: 'tax-role', label: 'Jenis Penunjukan', type: 'select', required: true, options: ['Pemotong PPh', 'Pemungut PPh', 'Pemungut PPN', 'Pemotong/Pemungut PPh dan Pemungut PPN'] },
					{ name: 'tax-type', label: 'Jenis Pajak', type: 'select', required: true, options: ['PPh Pasal 21/26', 'PPh Pasal 22', 'PPh Pasal 23/26', 'PPh Pasal 4 ayat (2)', 'PPN', 'PPh dan PPN'] },
					{ name: 'effective-date', label: 'Tanggal Mulai yang Diusulkan', type: 'date', required: true },
					{ name: 'legal-basis', label: 'Dasar Penunjukan', required: true, placeholder: 'Peraturan, kontrak, atau dasar lainnya' },
					{ name: 'business-activity', label: 'Kegiatan Usaha Terkait', type: 'textarea', required: true, full: true, placeholder: 'Jelaskan kegiatan usaha yang mendasari penunjukan' },
					{ name: 'location', label: 'Lokasi/Unit Usaha', type: 'textarea', required: true, full: true, placeholder: 'Alamat lokasi atau unit usaha terkait' }
				]
			},
			{
				title: 'Dokumen Pendukung',
				fields: [{ name: 'supporting-document', label: 'Dokumen Dasar Penunjukan', type: 'file', required: true, accept: '.pdf,.jpg,.jpeg,.png', help: 'Unggah dokumen yang menunjukkan pemenuhan persyaratan penunjukan.' }]
			}
		]
	};
</script>

<StatusApplicationForm {config} />
