import { env } from '$env/dynamic/private';
import { eq, or } from 'drizzle-orm';
import { validasiNik } from '$lib/helpers/nik';
import { BERKAS, MAKS_BYTES_TOTAL, labelKelas } from '$lib/helpers/pendaftaran';
import { nextNpwpForBatch } from './batch';
import { db } from './db';
import { batch_peserta, npwp_terbit, pendaftaran, pendaftaran_kelas, user } from './db/schema';
import { createDriveFolder, deleteDriveFile, safeDriveName, uploadDriveFile, type DriveFolder } from './google/drive';
import { appendSheetsRow } from './google/sheets';
import { ensurePesertaAccount } from './peserta';
import { verifyTurnstile } from './turnstile';

/** A failure the registrant can act on; its message is shown to them verbatim. */
export class PendaftaranError extends Error {
	/** Form field the message belongs to, so the page can show it next to that field. */
	constructor(
		message: string,
		readonly field?: 'nik'
	) {
		super(message);
	}
}

export type DataPendaftaran = {
	email: string;
	nama: string;
	tahunLahir: number;
	telepon: string;
	pendidikan: string;
	bidangKeilmuan: string;
	pekerjaan: string;
	bidangUsaha: string;
	alamat: string;
	kota: string;
	provinsi: string;
	kelasKode: string;
	/** Only used when the class's batch numbers peserta by NIK. */
	nik?: string;
};

export type BerkasPendaftaran = { [Kunci in keyof typeof BERKAS]: File[] };

const KONFIGURASI_WAJIB = [
	'TURNSTILE_SITEKEY',
	'TURNSTILE_SECRET_KEY',
	'TURNSTILE_HOSTNAMES',
	// Sheets: the service account. Drive: the OAuth account that owns the uploaded files.
	'GOOGLE_SERVICE_ACCOUNT_JSON',
	'GOOGLE_SHEETS_ID',
	'GOOGLE_OAUTH_CLIENT_ID',
	'GOOGLE_OAUTH_CLIENT_SECRET',
	'GOOGLE_OAUTH_REFRESH_TOKEN',
	'GOOGLE_DRIVE_FOLDER_ID'
] as const;

/**
 * Master switch for self-registration. Fail closed: it is on only when PENDAFTARAN_AKTIF is
 * exactly "true", so a deployment that never set it (production, until the feature is released)
 * exposes nothing, no matter which other secrets happen to be present.
 */
export function pendaftaranDiaktifkan() {
	return env.PENDAFTARAN_AKTIF === 'true';
}

/** False until the switch is on and every secret the flow needs is set, so /daftar never offers a form that cannot succeed. */
export function pendaftaranTersedia() {
	return pendaftaranDiaktifkan() && KONFIGURASI_WAJIB.every((nama) => Boolean(env[nama]));
}

const MAKS_PERCOBAAN_NPWP = 5;
const UPLOAD_BERSAMAAN = 4;

const PESAN_AKUN_BELUM_SELESAI =
	'Pendaftaran Anda sudah kami terima, tetapi pembuatan akun belum selesai. Kirim ulang formulir ini untuk melanjutkan, atau hubungi admin.';

const FORMAT_BERKAS = [
	{ mime: 'application/pdf', ext: 'pdf', gambar: false, magic: [0x25, 0x50, 0x44, 0x46] },
	{ mime: 'image/jpeg', ext: 'jpg', gambar: true, magic: [0xff, 0xd8, 0xff] },
	{ mime: 'image/png', ext: 'png', gambar: true, magic: [0x89, 0x50, 0x4e, 0x47] }
] as const;

/** Identifies a file by its leading bytes; the browser-declared type and filename are never trusted. */
async function kenaliBerkas(file: File) {
	const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
	const cocok = FORMAT_BERKAS.find(({ magic }) => magic.every((byte, i) => head[i] === byte));

	if (cocok) return cocok;

	const isWebp =
		String.fromCharCode(...head.slice(0, 4)) === 'RIFF' &&
		String.fromCharCode(...head.slice(8, 12)) === 'WEBP';

	return isWebp ? { mime: 'image/webp', ext: 'webp', gambar: true } : null;
}

const formatWaktuWib = (waktu: Date) =>
	new Intl.DateTimeFormat('sv-SE', {
		timeZone: 'Asia/Jakarta',
		dateStyle: 'short',
		timeStyle: 'medium'
	}).format(waktu);

/**
 * Sends one pendaftaran row to Google Sheets and records the outcome on the row itself, so a
 * failed send is visible (and re-sendable by an admin) instead of silently lost.
 */
export async function kirimPendaftaranKeSheets(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
	const [baris] = await db
		.select({ pendaftaran, batchNama: batch_peserta.nama })
		.from(pendaftaran)
		.innerJoin(batch_peserta, eq(batch_peserta.id, pendaftaran.batchId))
		.where(eq(pendaftaran.id, id))
		.limit(1);

	if (!baris) return { ok: false, error: 'Pendaftaran tidak ditemukan' };

	const { pendaftaran: p, batchNama } = baris;

	try {
		await appendSheetsRow([
			formatWaktuWib(p.createdAt),
			p.nama,
			p.email,
			String(p.tahunLahir),
			p.telepon,
			p.pendidikan,
			p.bidangKeilmuan,
			p.pekerjaan,
			p.bidangUsaha,
			p.alamat,
			p.kota,
			p.provinsi,
			labelKelas(p.kelasKode),
			batchNama,
			p.npwp,
			p.folderBerkasUrl
		]);
	} catch (error) {
		const pesan = error instanceof Error ? error.message : 'Gagal mengirim ke Google Sheets';
		console.error(`Pendaftaran ${id}: gagal mengirim ke Google Sheets`, error);
		await db
			.update(pendaftaran)
			.set({ sheetsError: pesan.slice(0, 500) })
			.where(eq(pendaftaran.id, id));

		return { ok: false, error: pesan };
	}

	await db
		.update(pendaftaran)
		.set({ sheetsSyncedAt: new Date(), sheetsError: null })
		.where(eq(pendaftaran.id, id));

	return { ok: true };
}

/**
 * Takes a saved pendaftaran to the end: login + profile, then `selesai`, then Sheets. Every
 * step is idempotent, so this is the single recovery path for a registration that failed
 * halfway; the registrant's resubmission and the admin's "Lanjutkan" both call it.
 *
 * The account steps and the Sheets step fail independently: Sheets being down never reports
 * the registration as failed, because the account exists and the row is re-sendable.
 */
export async function selesaikanPendaftaran(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
	const [baris] = await db
		.select({ pendaftaran, password: batch_peserta.passwordDefault })
		.from(pendaftaran)
		.innerJoin(batch_peserta, eq(batch_peserta.id, pendaftaran.batchId))
		.where(eq(pendaftaran.id, id))
		.limit(1);

	if (!baris) return { ok: false, error: 'Pendaftaran tidak ditemukan' };

	const { pendaftaran: p, password } = baris;

	if (p.status !== 'selesai') {
		try {
			await ensurePesertaAccount({
				npwp: p.npwp,
				nama: p.nama,
				email: p.email,
				password,
				batchId: p.batchId,
				nomorTelepon: p.telepon
			});
			await db.update(pendaftaran).set({ status: 'selesai', prosesError: null }).where(eq(pendaftaran.id, id));
		} catch (error) {
			// Drizzle wraps driver errors in "Failed query: <sql> params: <values>", and the values are
			// the registrant's personal data. Keep only the driver's own message in the stored reason
			// (shown on /admin); the full error goes to the server log above.
			const pesan =
				error instanceof Error
					? error.cause instanceof Error
						? error.cause.message
						: error.message
					: 'Gagal membuat akun';
			console.error(`Pendaftaran ${id}: akun belum selesai dibuat`, error);
			// Best effort: if the database itself is the problem this write fails too, and the row
			// simply stays `diproses` without a reason.
			await db
				.update(pendaftaran)
				.set({ prosesError: pesan.slice(0, 500) })
				.where(eq(pendaftaran.id, id))
				.catch(() => undefined);

			return { ok: false, error: pesan };
		}
	}

	if (!p.sheetsSyncedAt) {
		await kirimPendaftaranKeSheets(id);
	}

	return { ok: true };
}

/**
 * `urut` batches issue the NPWP. The number is written to the ledger here, before anything else
 * references it, and the ledger's primary key is what arbitrates two registrations racing for
 * the same number: the loser re-allocates.
 */
async function reservasiNpwpUrut(batchId: string, nama: string) {
	for (let percobaan = 0; percobaan < MAKS_PERCOBAAN_NPWP; percobaan++) {
		const alokasi = await nextNpwpForBatch(batchId);

		if (!alokasi) {
			throw new PendaftaranError('Kuota kelas ini sudah penuh. Hubungi admin.');
		}

		try {
			await db.insert(npwp_terbit).values({ ...alokasi, namaPertama: nama, batchId });

			return alokasi.npwp;
		} catch (error) {
			const [diambil] = await db
				.select({ npwp: npwp_terbit.npwp })
				.from(npwp_terbit)
				.where(eq(npwp_terbit.npwp, alokasi.npwp))
				.limit(1);

			if (!diambil) throw error;
		}
	}

	throw new PendaftaranError('Pendaftaran sedang ramai. Coba lagi sebentar lagi.');
}

type Kontrol = { turnstileToken: unknown; remoteIp: string | undefined };

export type HasilPendaftaran = {
	/** The NPWP is the registrant's own NIK (a `nik` batch) rather than an issued number. */
	pakaiNik: boolean;
};

/**
 * Self-registration. Order matters:
 *   1. Turnstile, then everything that can be rejected cheaply (class closed, NIK invalid,
 *      already registered, bad files) before any side effect.
 *   2. Drive upload *before* anything is persisted, so a Drive failure leaves nothing behind
 *      and the registrant can simply resubmit.
 *   3. The pendaftaran row, written *before* the account. From here on a failure at any later
 *      step leaves a `diproses` row that `selesaikanPendaftaran` can finish, instead of a
 *      half-made account that blocks the email with nothing to resume from.
 *   4. selesaikanPendaftaran: login, profile, `selesai`, Sheets.
 *
 * Which NPWP the account gets depends on the batch's `penomoran`: the registrant's own NIK for
 * a `nik` batch, an issued number for an `urut` batch.
 *
 * Returns whether the NPWP is the registrant's own NIK, for the confirmation message.
 */
export async function daftarkanPeserta(
	data: DataPendaftaran,
	berkas: BerkasPendaftaran,
	kontrol: Kontrol
): Promise<HasilPendaftaran> {
	if (!pendaftaranTersedia()) {
		throw new PendaftaranError('Pendaftaran belum dibuka.');
	}

	if (!(await verifyTurnstile(kontrol.turnstileToken, kontrol.remoteIp, 'daftar'))) {
		throw new PendaftaranError('Verifikasi keamanan gagal. Muat ulang halaman lalu coba lagi.');
	}

	const [kelas] = await db
		.select({
			batchId: pendaftaran_kelas.batchId,
			penomoran: batch_peserta.penomoran
		})
		.from(pendaftaran_kelas)
		.innerJoin(batch_peserta, eq(batch_peserta.id, pendaftaran_kelas.batchId))
		.where(eq(pendaftaran_kelas.kode, data.kelasKode))
		.limit(1);

	if (!kelas) {
		throw new PendaftaranError('Pendaftaran untuk kelas ini belum dibuka.');
	}

	const pakaiNik = kelas.penomoran === 'nik';
	const nik = pakaiNik ? data.nik : undefined;

	if (pakaiNik) {
		const pesanNik = nik ? validasiNik(nik, data.tahunLahir) : 'NIK wajib diisi';

		if (pesanNik) throw new PendaftaranError(pesanNik, 'nik');
	}

	const pesanTerdaftar = pakaiNik
		? 'Email atau NIK ini sudah terdaftar. Hubungi admin bila Anda belum menerima password.'
		: 'Email ini sudah terdaftar. Hubungi admin bila Anda belum menerima NPWP dan password.';

	const tercatat = await db
		.select()
		.from(pendaftaran)
		.where(nik ? or(eq(pendaftaran.email, data.email), eq(pendaftaran.npwp, nik)) : eq(pendaftaran.email, data.email));

	if (tercatat.length > 0) {
		// The same person coming back for a registration that never finished: resume it.
		const [sebelumnya] = tercatat;
		const lanjutan =
			tercatat.length === 1 &&
			sebelumnya.status === 'diproses' &&
			sebelumnya.email === data.email &&
			sebelumnya.batchId === kelas.batchId &&
			(!nik || sebelumnya.npwp === nik);

		if (!lanjutan) throw new PendaftaranError(pesanTerdaftar);

		const hasil = await selesaikanPendaftaran(sebelumnya.id);

		if (!hasil.ok) throw new PendaftaranError(PESAN_AKUN_BELUM_SELESAI);

		return { pakaiNik };
	}

	const [emailTerpakai] = await db.select({ id: user.id }).from(user).where(eq(user.email, data.email)).limit(1);
	const [nikTerpakai] = nik
		? await db.select({ id: user.id }).from(user).where(eq(user.username, nik)).limit(1)
		: [];

	if (emailTerpakai || nikTerpakai) {
		throw new PendaftaranError(pesanTerdaftar);
	}

	let totalBytes = 0;
	const unggahan: { nama: string; file: File; mime: string }[] = [];

	for (const kunci of Object.keys(BERKAS) as (keyof typeof BERKAS)[]) {
		const { label, gambarSaja } = BERKAS[kunci];

		for (const [urutan, file] of berkas[kunci].entries()) {
			const format = await kenaliBerkas(file);

			if (!format || (gambarSaja && !format.gambar)) {
				throw new PendaftaranError(
					`${label} harus berupa ${gambarSaja ? 'gambar JPG, PNG, atau WEBP' : 'JPG, PNG, WEBP, atau PDF'}.`
				);
			}

			totalBytes += file.size;
			unggahan.push({ nama: `${label} ${urutan + 1}.${format.ext}`, file, mime: format.mime });
		}
	}

	if (totalBytes > MAKS_BYTES_TOTAL) {
		throw new PendaftaranError(
			`Total ukuran berkas maksimal ${MAKS_BYTES_TOTAL / 1024 / 1024} MB. Perkecil ukuran berkas Anda.`
		);
	}

	let folder: DriveFolder;

	try {
		folder = await createDriveFolder(
			`${new Date().toISOString().slice(0, 10)} - ${safeDriveName(data.nama)}`,
			env.GOOGLE_DRIVE_FOLDER_ID!
		);
	} catch (error) {
		// Most likely the OAuth refresh token was revoked or expired (invalid_grant); the cause is in
		// the log, the registrant only needs to know nothing was saved.
		console.error('Pendaftaran: gagal membuat folder berkas di Google Drive', error);
		throw new PendaftaranError('Berkas gagal diunggah. Coba lagi beberapa saat lagi.');
	}
	// Rollback is a permanent files.delete of a folder this app created, owned by the connected
	// Google account, so it needs no extra role. If it still fails (token revoked mid-flight,
	// Drive outage) the registrant's uploads (KTP etc.) are left behind, so it must be loud: the
	// folder URL is logged for manual removal.
	const hapusFolder = () =>
		deleteDriveFile(folder.id).catch((error) => {
			console.error(`Pendaftaran: folder berkas gagal dihapus setelah rollback, hapus manual: ${folder.url}`, error);
		});

	const antrean = [...unggahan];
	// allSettled, not all: the folder is deleted on failure, which must not race uploads still in flight.
	const hasilUnggah = await Promise.allSettled(
		Array.from({ length: UPLOAD_BERSAMAAN }, async () => {
			for (let item = antrean.shift(); item; item = antrean.shift()) {
				try {
					await uploadDriveFile(folder.id, item.nama, item.file, item.mime);
				} catch (error) {
					antrean.length = 0;
					throw error;
				}
			}
		})
	);
	const gagalUnggah = hasilUnggah.find((hasil) => hasil.status === 'rejected');

	if (gagalUnggah) {
		await hapusFolder();
		console.error('Pendaftaran: gagal mengunggah berkas ke Google Drive', gagalUnggah.reason);
		throw new PendaftaranError('Berkas gagal diunggah. Coba lagi beberapa saat lagi.');
	}

	let id: string;

	try {
		const npwp = nik ?? (await reservasiNpwpUrut(kelas.batchId, data.nama));
		const { nik: _nik, ...isian } = data;

		[{ id }] = await db
			.insert(pendaftaran)
			.values({ ...isian, batchId: kelas.batchId, npwp, folderBerkasUrl: folder.url })
			.returning({ id: pendaftaran.id });
	} catch (error) {
		await hapusFolder();

		if (error instanceof PendaftaranError) throw error;

		// The unique indexes on email and npwp arbitrate two registrations racing each other.
		const [bentrok] = await db
			.select({ id: pendaftaran.id })
			.from(pendaftaran)
			.where(nik ? or(eq(pendaftaran.email, data.email), eq(pendaftaran.npwp, nik)) : eq(pendaftaran.email, data.email))
			.limit(1);

		if (bentrok) throw new PendaftaranError(pesanTerdaftar);

		console.error('Pendaftaran: gagal menyimpan pendaftaran', error);
		throw new PendaftaranError('Pendaftaran gagal diproses. Coba lagi atau hubungi admin.');
	}

	const hasil = await selesaikanPendaftaran(id);

	if (!hasil.ok) throw new PendaftaranError(PESAN_AKUN_BELUM_SELESAI);

	return { pakaiNik };
}
