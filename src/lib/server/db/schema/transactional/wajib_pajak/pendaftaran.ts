import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createdAt, updatedAt } from '$lib/server/db/helpers/timestamps';
import { batch_peserta } from './batch_peserta';

/**
 * Which batch each "Pilihan Kelas" on /daftar enrols into. A class with no row here is
 * closed for registration, so deleting the row is how an admin closes it. `kode` is the
 * key from KELAS_PENDAFTARAN, not a foreign key: the class list lives in code.
 */
export const pendaftaran_kelas = sqliteTable('pendaftaran_kelas', {
	kode: text('kode').primaryKey(),
	batchId: text('batch_id')
		.notNull()
		.references(() => batch_peserta.id),
	updatedAt: updatedAt()
});

/**
 * One row per self-registration, written *before* the account exists. `status` is the
 * recoverable stage: `diproses` means the intent and uploaded files are saved but the login
 * and profile may not be complete; `selesai` means the account is fully created. Every later
 * step is idempotent, so a resubmission (or an admin) resumes from `diproses` instead of being
 * blocked by a half-made account. `sheetsSyncedAt` tracks the Sheets row separately.
 *
 * `npwp` is the peserta's NIK for a `nik` batch, or the number issued from the ledger for an
 * `urut` batch.
 */
export const pendaftaran = sqliteTable('pendaftaran', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	// Stored lower-cased, same as the Better Auth user it creates.
	email: text('email').notNull().unique(),
	nama: text('nama').notNull(),
	tahunLahir: integer('tahun_lahir').notNull(),
	telepon: text('telepon').notNull(),
	pendidikan: text('pendidikan').notNull(),
	bidangKeilmuan: text('bidang_keilmuan').notNull().default(''),
	pekerjaan: text('pekerjaan').notNull(),
	bidangUsaha: text('bidang_usaha').notNull().default(''),
	alamat: text('alamat').notNull(),
	kota: text('kota').notNull(),
	provinsi: text('provinsi').notNull(),
	kelasKode: text('kelas_kode').notNull(),
	batchId: text('batch_id')
		.notNull()
		.references(() => batch_peserta.id),
	npwp: text('npwp').notNull().unique(),
	status: text('status', { enum: ['diproses', 'selesai'] })
		.notNull()
		.default('diproses'),
	prosesError: text('proses_error'),
	folderBerkasUrl: text('folder_berkas_url').notNull(),
	sheetsSyncedAt: integer('sheets_synced_at', { mode: 'timestamp_ms' }),
	sheetsError: text('sheets_error'),
	createdAt: createdAt()
});
