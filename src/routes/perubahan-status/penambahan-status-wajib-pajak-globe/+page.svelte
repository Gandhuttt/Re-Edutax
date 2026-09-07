<script lang="ts">
	import StatusApplicationForm, { type StatusFormConfig } from '../pencabutan-pemungut-bea-meterai/StatusApplicationForm.svelte';

	const config: StatusFormConfig = {
		title: 'Penambahan Status Sebagai Wajib Pajak GloBE',
		intro: 'Ajukan penambahan status Wajib Pajak untuk pemenuhan kewajiban pajak minimum global (GloBE).',
		sections: [
			{
				title: 'Informasi Grup Perusahaan Multinasional',
				fields: [
					{ name: 'group-name', label: 'Nama Grup Perusahaan', required: true, placeholder: 'Nama grup perusahaan multinasional' },
					{ name: 'fiscal-year', label: 'Tanggal Mulai Tahun Fiskal', type: 'date', required: true },
					{ name: 'entity-role', label: 'Peran Entitas dalam Grup', type: 'select', required: true, options: ['Entitas Induk Utama', 'Entitas Induk Antara', 'Entitas Induk yang Dimiliki Sebagian', 'Entitas Konstituen', 'Entitas Penyampai GIR'] },
					{ name: 'jurisdiction', label: 'Yurisdiksi Entitas Induk Utama', required: true, placeholder: 'Negara atau yurisdiksi' },
					{ name: 'parent-name', label: 'Nama Entitas Induk Utama', required: true },
					{ name: 'parent-tax-id', label: 'Nomor Identitas Pajak Entitas Induk', required: true, placeholder: 'TIN atau identitas pajak setempat' },
					{ name: 'consolidated-revenue', label: 'Pendapatan Konsolidasi Tahun Sebelumnya', type: 'number', required: true, help: 'Masukkan nilai dalam mata uang pelaporan grup.' },
					{ name: 'reporting-currency', label: 'Mata Uang Pelaporan', type: 'select', required: true, options: ['IDR', 'USD', 'EUR', 'SGD', 'JPY', 'Mata Uang Lainnya'] },
					{ name: 'group-description', label: 'Keterangan Tambahan', type: 'textarea', full: true, placeholder: 'Informasi tambahan mengenai struktur atau pelaporan grup' }
				]
			},
			{
				title: 'Dokumen Pendukung',
				fields: [{ name: 'supporting-document', label: 'Dokumen Struktur dan Pelaporan Grup', type: 'file', required: true, accept: '.pdf,.xlsx,.xls', help: 'Lampirkan dokumen yang menunjukkan struktur grup dan posisi entitas.' }]
			}
		]
	};
</script>

<StatusApplicationForm {config} />
