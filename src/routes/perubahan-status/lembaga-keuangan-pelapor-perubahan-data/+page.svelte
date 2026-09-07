<script lang="ts">
	import StatusApplicationForm, { type StatusFormConfig } from '../pencabutan-pemungut-bea-meterai/StatusApplicationForm.svelte';

	const config: StatusFormConfig = {
		title: 'Lembaga Keuangan Pelapor - Perubahan Data',
		intro: 'Laporkan perubahan data terdaftar dari Lembaga Keuangan Pelapor.',
		sections: [
			{
				title: 'Data Perubahan',
				fields: [
					{ name: 'change-type', label: 'Jenis Data yang Diubah', type: 'select', required: true, options: ['Kategori Lembaga Keuangan', 'Instansi Pengawas', 'Nomor Izin Usaha', 'GIIN', 'Penanggung Jawab Pelaporan', 'Alamat atau Kontak', 'Data Lainnya'] },
					{ name: 'effective-date', label: 'Tanggal Efektif Perubahan', type: 'date', required: true },
					{ name: 'previous-data', label: 'Data Sebelum Perubahan', type: 'textarea', required: true, full: true, placeholder: 'Tuliskan data yang saat ini terdaftar' },
					{ name: 'new-data', label: 'Data Setelah Perubahan', type: 'textarea', required: true, full: true, placeholder: 'Tuliskan data terbaru' },
					{ name: 'explanation', label: 'Penjelasan Perubahan', type: 'textarea', required: true, full: true, placeholder: 'Jelaskan latar belakang perubahan data' }
				]
			},
			{
				title: 'Dokumen Pendukung',
				fields: [{ name: 'supporting-document', label: 'Dokumen Bukti Perubahan', type: 'file', required: true, accept: '.pdf,.jpg,.jpeg,.png' }]
			}
		]
	};
</script>

<StatusApplicationForm {config} />
