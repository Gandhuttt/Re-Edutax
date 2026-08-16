import { form } from '$app/server';
import { requiredString } from '$lib/helpers/valibot-schema';
import { requireAdmin } from '$lib/server/admin';
import { nextNpwpForBatch } from '$lib/server/batch';
import { db } from '$lib/server/db';
import { batch_peserta } from '$lib/server/db/schema';
import { createPesertaAccount, type CreatePesertaResult } from '$lib/server/peserta';
import { error, invalid } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';
import { listBatch } from './listBatch.remote';
import { listPeserta } from './listPeserta.remote';

const CreatePesertaBatchSchema = v.object({
	batchId: requiredString('Batch'),
	daftarNama: v.pipe(v.string(), v.nonEmpty('Daftar nama harus diisi'))
});

/**
 * Bulk enrolment: the batch supplies the numbering, the email pattern and the default
 * password, so the admin only pastes a list of names.
 */
export const createPesertaBatch = form(
	CreatePesertaBatchSchema,
	async ({ batchId, daftarNama }) => {
		const { headers } = requireAdmin();

		const [batch] = await db
			.select()
			.from(batch_peserta)
			.where(eq(batch_peserta.id, batchId))
			.limit(1);

		if (!batch) {
			error(404, 'Batch tidak ditemukan');
		}

		const nama = daftarNama
			.split(/\r?\n/)
			.map((line) => line.trim())
			.filter(Boolean);

		if (nama.length === 0) {
			invalid('Daftar nama harus diisi');
		}

		const hasil: CreatePesertaResult[] = [];

		for (const namaPeserta of nama) {
			// Allocated one at a time so each issued number is visible to the next allocation.
			const alokasi = await nextNpwpForBatch(batchId);

			if (!alokasi) {
				hasil.push({
					npwp: '',
					nama: namaPeserta,
					ok: false,
					message: `Batch ${batch.nama} sudah penuh (99 peserta)`
				});
				continue;
			}

			hasil.push(
				await createPesertaAccount(headers, {
					npwp: alokasi.npwp,
					urut: alokasi.urut,
					nama: namaPeserta,
					// `{n}` follows the issued number, not the member count — a retired number is
					// never replayed, so the email can never collide with a deleted peserta's.
					email: batch.polaEmail.replaceAll('{n}', String(alokasi.urut)),
					password: batch.passwordDefault,
					batchId
				})
			);
		}

		await listPeserta().refresh();
		await listBatch().refresh();

		const berhasil = hasil.filter((row) => row.ok).length;

		return {
			message: `${berhasil} dari ${hasil.length} peserta ditambahkan ke ${batch.nama}`,
			hasil
		};
	}
);
