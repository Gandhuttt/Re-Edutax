import { query } from '$app/server';
import { labelKelas } from '$lib/helpers/pendaftaran';
import { pendaftaranDiaktifkan } from '$lib/server/pendaftaran';
import { requireAdmin } from '$lib/server/admin';
import { db } from '$lib/server/db';
import { batch_peserta, pendaftaran, pendaftaran_kelas } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';

const MAKS_BARIS = 100;

export const listPendaftaran = query(async () => {
	requireAdmin();

	const [pemetaan, terbaru] = await Promise.all([
		db.select().from(pendaftaran_kelas),
		db
			.select({
				id: pendaftaran.id,
				nama: pendaftaran.nama,
				email: pendaftaran.email,
				npwp: pendaftaran.npwp,
				kelasKode: pendaftaran.kelasKode,
				folderBerkasUrl: pendaftaran.folderBerkasUrl,
				status: pendaftaran.status,
				prosesError: pendaftaran.prosesError,
				sheetsSyncedAt: pendaftaran.sheetsSyncedAt,
				sheetsError: pendaftaran.sheetsError,
				createdAt: pendaftaran.createdAt,
				batchNama: batch_peserta.nama
			})
			.from(pendaftaran)
			.innerJoin(batch_peserta, eq(batch_peserta.id, pendaftaran.batchId))
			.orderBy(desc(pendaftaran.createdAt))
			.limit(MAKS_BARIS)
	]);

	return {
		// Lets the admin page hide this whole section on a deployment that has not released registration.
		aktif: pendaftaranDiaktifkan(),
		// Class -> batch id; a class missing here is closed.
		batchPerKelas: Object.fromEntries(pemetaan.map((row) => [row.kode, row.batchId])),
		pendaftaran: terbaru.map((row) => ({ ...row, kelasLabel: labelKelas(row.kelasKode) }))
	};
});
