import { form, getRequestEvent } from '$app/server';
import {
	BERKAS,
	KODE_KELAS,
	MAKS_BYTES_PER_BERKAS,
	PEKERJAAN,
	PENDIDIKAN
} from '$lib/helpers/pendaftaran';
import {
	PendaftaranError,
	daftarkanPeserta,
	pendaftaranDiaktifkan,
	type HasilPendaftaran
} from '$lib/server/pendaftaran';
import { error, invalid } from '@sveltejs/kit';
import * as v from 'valibot';

const teks = (label: string, maks: number) =>
	v.pipe(
		v.string(),
		v.trim(),
		v.nonEmpty(`${label} harus diisi`),
		v.maxLength(maks, `${label} maksimal ${maks} karakter`)
	);

const teksOpsional = (label: string, maks: number) =>
	v.optional(
		v.pipe(v.string(), v.trim(), v.maxLength(maks, `${label} maksimal ${maks} karakter`)),
		''
	);

const berkasTunggal = (label: string) =>
	v.pipe(
		v.file(`${label} wajib diunggah`),
		v.maxSize(MAKS_BYTES_PER_BERKAS, `${label} maksimal 10 MB`),
		v.transform((file) => [file])
	);

const berkasBanyak = (label: string, maks: number, wajib: boolean) =>
	v.pipe(
		v.array(
			v.pipe(
				v.file(`${label} harus berupa berkas`),
				v.maxSize(MAKS_BYTES_PER_BERKAS, `${label} maksimal 10 MB per berkas`)
			)
		),
		v.minLength(wajib ? 1 : 0, `${label} wajib diunggah`),
		v.maxLength(maks, `${label} maksimal ${maks} berkas`)
	);

const DaftarSchema = v.object({
	email: v.pipe(
		v.string(),
		v.trim(),
		v.toLowerCase(),
		v.nonEmpty('Email harus diisi'),
		v.email('Email tidak valid'),
		v.maxLength(254, 'Email terlalu panjang')
	),
	nama: teks('Nama', 120),
	tahunLahir: v.pipe(
		v.string(),
		v.regex(/^\d{4}$/, 'Tahun lahir harus 4 angka, contoh: 1998'),
		v.transform(Number),
		v.minValue(1920, 'Tahun lahir tidak valid'),
		v.check((tahun) => tahun <= new Date().getFullYear() - 10, 'Tahun lahir tidak valid')
	),
	telepon: v.pipe(
		teks('Nomor telepon/HP', 20),
		v.regex(/^\+?[\d\s-]{8,20}$/, 'Nomor telepon/HP tidak valid')
	),
	pendidikan: v.picklist(PENDIDIKAN, 'Pilih pendidikan terakhir'),
	bidangKeilmuan: teksOpsional('Bidang keilmuan', 120),
	pekerjaan: v.picklist(PEKERJAAN, 'Pilih pekerjaan saat ini'),
	bidangUsaha: teksOpsional('Bidang usaha/industri', 120),
	alamat: teks('Alamat domisili', 500),
	kota: teks('Kota/kabupaten', 100),
	provinsi: teks('Provinsi', 100),
	kelasKode: v.picklist(KODE_KELAS, 'Pilih kelas'),
	// Required only for classes whose batch numbers peserta by NIK; the server decides which.
	nik: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(16, 'NIK harus 16 digit angka')), ''),
	ktp: berkasBanyak(BERKAS.ktp.label, BERKAS.ktp.maks, true),
	pasFoto: v.optional(berkasTunggal(BERKAS.pasFoto.label)),
	ijazah: berkasBanyak(BERKAS.ijazah.label, BERKAS.ijazah.maks, false),
	ktm: berkasBanyak(BERKAS.ktm.label, BERKAS.ktm.maks, false),
	buktiPembayaran: berkasTunggal(BERKAS.buktiPembayaran.label),
	turnstileToken: v.optional(v.string(), '')
});

export const daftar = form(DaftarSchema, async (input, issue) => {
	const { turnstileToken, ktp, pasFoto, ijazah, ktm, buktiPembayaran, nik, ...data } = input;
	// Closed deployments must not run anything for this endpoint, even though the remote function
	// is bundled and addressable. 404, not an error message: the feature does not exist for them.
	if (!pendaftaranDiaktifkan()) {
		error(404, 'Tidak ditemukan');
	}

	const event = getRequestEvent();

	let remoteIp: string | undefined;

	try {
		remoteIp = event.getClientAddress();
	} catch {
		remoteIp = undefined;
	}

	let hasil: HasilPendaftaran;

	try {
		hasil = await daftarkanPeserta(
			{ ...data, nik: nik || undefined },
			{ ktp, pasFoto: pasFoto ?? [], ijazah, ktm, buktiPembayaran },
			{ turnstileToken, remoteIp }
		);
	} catch (error) {
		if (error instanceof PendaftaranError) {
			invalid(error.field === 'nik' ? issue.nik(error.message) : error.message);
		}

		throw error;
	}

	return { nama: data.nama, pakaiNik: hasil.pakaiNik };
});
