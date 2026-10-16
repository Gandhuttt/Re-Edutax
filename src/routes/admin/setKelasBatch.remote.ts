import { form } from '$app/server';
import { KODE_KELAS, labelKelas } from '$lib/helpers/pendaftaran';
import { requireAdmin } from '$lib/server/admin';
import { db } from '$lib/server/db';
import { batch_peserta, pendaftaran_kelas } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';
import { listPendaftaran } from './listPendaftaran.remote';

const SetKelasBatchSchema = v.object({
	kode: v.picklist(KODE_KELAS, 'Kelas tidak dikenal'),
	// Empty closes the class: a class with no mapping row cannot be registered for.
	batchId: v.optional(v.string(), '')
});

export const setKelasBatch = form(SetKelasBatchSchema, async ({ kode, batchId }) => {
	requireAdmin();

	if (!batchId) {
		await db.delete(pendaftaran_kelas).where(eq(pendaftaran_kelas.kode, kode));
		await listPendaftaran().refresh();

		return { message: `${labelKelas(kode)} ditutup` };
	}

	const [batch] = await db
		.select({ nama: batch_peserta.nama })
		.from(batch_peserta)
		.where(eq(batch_peserta.id, batchId))
		.limit(1);

	if (!batch) {
		error(404, 'Batch tidak ditemukan');
	}

	await db
		.insert(pendaftaran_kelas)
		.values({ kode, batchId })
		.onConflictDoUpdate({ target: pendaftaran_kelas.kode, set: { batchId } });

	await listPendaftaran().refresh();

	return { message: `${labelKelas(kode)} dibuka untuk ${batch.nama}` };
});
