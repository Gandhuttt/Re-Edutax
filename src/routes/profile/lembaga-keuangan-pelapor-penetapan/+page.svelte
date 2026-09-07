<script lang="ts">
	import StatusApplicationForm, { type StatusFormConfig } from '../pencabutan-pemungut-bea-meterai/StatusApplicationForm.svelte';

	const config: StatusFormConfig = {
		title: 'Lembaga Keuangan Pelapor - Penetapan',
		intro: 'Daftarkan lembaga untuk memperoleh status sebagai Lembaga Keuangan Pelapor.',
		sections: [
			{
				title: 'Profil Lembaga Keuangan',
				fields: [
					{ name: 'institution-category', label: 'Kategori Lembaga Keuangan', type: 'select', required: true, options: ['Lembaga Kustodian', 'Lembaga Simpanan', 'Entitas Investasi', 'Perusahaan Asuransi Tertentu', 'Lembaga Keuangan Lainnya'] },
					{ name: 'supervisor', label: 'Instansi Pengawas', type: 'select', required: true, options: ['Otoritas Jasa Keuangan', 'Bank Indonesia', 'Kementerian/Lembaga Lainnya'] },
					{ name: 'license-number', label: 'Nomor Izin Usaha', required: true, placeholder: 'Nomor izin usaha lembaga' },
					{ name: 'license-date', label: 'Tanggal Izin Usaha', type: 'date', required: true },
					{ name: 'giin', label: 'Global Intermediary Identification Number (GIIN)', placeholder: 'Jika telah memiliki GIIN' },
					{ name: 'reporting-start', label: 'Tanggal Mulai Pelaporan', type: 'date', required: true },
					{ name: 'business-description', label: 'Uraian Kegiatan Lembaga', type: 'textarea', required: true, full: true, placeholder: 'Jelaskan kegiatan jasa keuangan yang dijalankan' }
				]
			},
			{
				title: 'Penanggung Jawab Pelaporan',
				fields: [
					{ name: 'officer-name', label: 'Nama Penanggung Jawab', required: true },
					{ name: 'officer-position', label: 'Jabatan', required: true },
					{ name: 'officer-email', label: 'Alamat Email', type: 'email', required: true, placeholder: 'nama@contoh.id' },
					{ name: 'officer-phone', label: 'Nomor Telepon', required: true, placeholder: 'Nomor yang dapat dihubungi' }
				]
			},
			{
				title: 'Dokumen Pendukung',
				fields: [{ name: 'supporting-document', label: 'Dokumen Izin dan Penetapan', type: 'file', required: true, accept: '.pdf,.jpg,.jpeg,.png' }]
			}
		]
	};
</script>

<StatusApplicationForm {config} />
