import { form } from '$app/server';
import { requireAdmin } from '$lib/server/admin';
import { nextBatchNumber } from '$lib/server/batch';
import { db } from '$lib/server/db';
import { batch_peserta } from '$lib/server/db/schema';
import { invalid } from '@sveltejs/kit';
import * as v from 'valibot';
import { listBatch } from './listBatch.remote';

/**
 * `nomor` is assigned by the system (highest so far + 1) and never chosen by the admin: it is
 * baked into every member's NPWP, and batches are never deleted, so the sequence only grows.
 */
const CreateBatchSchema = v.object({
	nama: v.optional(v.string(), ''),
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

export const createBatch = form(
	CreateBatchSchema,
	async ({ nama, polaEmail, passwordDefault }) => {
		requireAdmin();

		const nomor = await nextBatchNumber();

		if (!nomor) {
			invalid('Nomor batch sudah mencapai batas 999');
		}

		const namaBatch = nama.trim() || `Batch ${String(nomor).padStart(2, '0')}`;

		await db.insert(batch_peserta).values({ nomor, nama: namaBatch, polaEmail, passwordDefault });

		await listBatch().refresh();

		return { message: `${namaBatch} dibuat dengan nomor ${nomor}` };
	}
);
