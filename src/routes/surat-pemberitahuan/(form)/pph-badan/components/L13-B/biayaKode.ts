export const L13B_BIAYA_KODE = {
	FASILITAS_FISIK: 'FASILITAS_FISIK',
	INFRASTRUKTUR_PENGAJAR: 'INFRASTRUKTUR_PENGAJAR',
	BARANG_BAHAN: 'BARANG_BAHAN',
	HONORARIUM: 'HONORARIUM',
	SERTIFIKASI_LISTRIK_AIR_BAHAN_BAKAR: 'SERTIFIKASI_LISTRIK_AIR_BAHAN_BAKAR'
} as const;

export const L13B_BIAYA_NAMA: Record<string, string> = {
	[L13B_BIAYA_KODE.FASILITAS_FISIK]:
		'Biaya penyedia fasilitas fisik khusus berupa workshop atau tempat pelatihan sejenis lainnya terkait praktik kerja dan/atau pemagangan',
	[L13B_BIAYA_KODE.INFRASTRUKTUR_PENGAJAR]:
		'Biaya infrastruktur atau pengajar sebagai tenaga pembimbing pelaksanaan praktik kerja, pemagangan, dan/atau pembelajaran',
	[L13B_BIAYA_KODE.BARANG_BAHAN]:
		'Barang dan/atau bahan untuk keperluan pelaksanaan praktik kerja, pemagangan, dan/atau pembelajaran',
	[L13B_BIAYA_KODE.HONORARIUM]:
		'Honorarium atau pembayaran sejenis yang diberikan kepada peserta praktik kerja dan/atau pemagangan',
	[L13B_BIAYA_KODE.SERTIFIKASI_LISTRIK_AIR_BAHAN_BAKAR]:
		'Biaya sertifikasi serta biaya listrik, air, dan bahan bakar untuk pelaksanaan praktik kerja dan/atau pemagangan'
};

export const L13B_BIAYA_URUTAN: (keyof typeof L13B_BIAYA_KODE)[] = [
	'FASILITAS_FISIK',
	'INFRASTRUKTUR_PENGAJAR',
	'BARANG_BAHAN',
	'HONORARIUM',
	'SERTIFIKASI_LISTRIK_AIR_BAHAN_BAKAR'
];
