// Shared by /daftar (form options, upload hints) and the server-side registration
// flow (validation), so the two cannot drift apart.

export const PENDIDIKAN = ['SMA/SMK', 'D3', 'S1', 'S2', 'S3'] as const;

export const PEKERJAAN = [
	'Mahasiswa',
	'Fresh graduate',
	'Pemilik usaha',
	'Pengelola usaha',
	'Staf/karyawan',
	'Lainnya'
] as const;

// `kode` is the stable key stored in pendaftaran_kelas / pendaftaran. The label is
// display text and may be reworded freely; never key anything off it.
export const KELAS_PENDAFTARAN = [
	{ kode: 'online-weekday', label: 'Brevet Pajak Online (Senin–Jumat, malam)' },
	{ kode: 'offline-purwokerto', label: 'Brevet Pajak Offline — Purwokerto (Senin–Jumat, malam)' },
	{ kode: 'offline-jakarta', label: 'Brevet Pajak Offline — Jakarta (Sabtu–Minggu)' },
	{ kode: 'online-weekend', label: 'Brevet Pajak Online (Sabtu–Minggu)' }
] as const;

export type KodeKelasPendaftaran = (typeof KELAS_PENDAFTARAN)[number]['kode'];

export const KODE_KELAS = KELAS_PENDAFTARAN.map((kelas) => kelas.kode) as [
	KodeKelasPendaftaran,
	...KodeKelasPendaftaran[]
];

export const labelKelas = (kode: string) =>
	KELAS_PENDAFTARAN.find((kelas) => kelas.kode === kode)?.label ?? kode;

export const MAKS_BYTES_PER_BERKAS = 10 * 1024 * 1024;
// Cap on the whole submission: SvelteKit buffers the multipart body in Worker memory
// (128 MB), and an uncapped 17 x 10 MB request would be 170 MB.
export const MAKS_BYTES_TOTAL = 30 * 1024 * 1024;

// Checked against the file's magic bytes server-side, not the client-declared type.
export const BERKAS_DITERIMA = 'image/jpeg,image/png,image/webp,application/pdf';
export const BERKAS_DITERIMA_GAMBAR = 'image/jpeg,image/png,image/webp';

export const BERKAS = {
	ktp: { label: 'Scan KTP', maks: 5, gambarSaja: false },
	pasFoto: { label: 'Pas foto berwarna', maks: 1, gambarSaja: true },
	ijazah: { label: 'Ijazah terakhir', maks: 5, gambarSaja: false },
	ktm: { label: 'KTM', maks: 5, gambarSaja: false },
	buktiPembayaran: { label: 'Bukti pembayaran', maks: 1, gambarSaja: false }
} as const;
