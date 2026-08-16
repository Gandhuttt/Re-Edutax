import { form } from '$app/server';
import { requiredString } from '$lib/helpers/valibot-schema';
import { requireAdmin } from '$lib/server/admin';
import { db } from '$lib/server/db';
import { batch_peserta } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';
import { listBatch } from './listBatch.remote';

/**
 * `nomor` is intentionally not editable — it is baked into every member's NPWP, so changing
 * it would desynchronise the batch from the numbers already handed out.
 */
const UpdateBatchSchema = v.object({
	id: requiredString('Batch'),
	nama: v.pipe(v.string(), v.nonEmpty('Nama batch harus diisi')),
	polaEmail: v.pipe(
		v.string(),
		v.nonEmpty('Pola email harus diisi'),
		v.includes('{n}', 'Pola email harus memuat {n} sebagai nomor urut peserta')
	),
	passwordDefault: v.pipe(
		v.string(),
		v.nonEmpty('Password default harus diisi'),
		v.minLength(3, 'Password minimal 3 karakter')
	)
});

export const updateBatch = form(
	UpdateBatchSchema,
	async ({ id, nama, polaEmail, passwordDefault }) => {
		requireAdmin();

		const [batch] = await db
			.select({ id: batch_peserta.id })
			.from(batch_peserta)
			.where(eq(batch_peserta.id, id))
			.limit(1);

		if (!batch) {
			error(404, 'Batch tidak ditemukan');
		}

		await db
			.update(batch_peserta)
			.set({ nama, polaEmail, passwordDefault })
			.where(eq(batch_peserta.id, id));

		await listBatch().refresh();

		return { message: `Batch ${nama} diperbarui` };
	}
);
