import { form } from '$app/server';
import { validasiNik } from '$lib/helpers/nik';
import { serialFromLoneNpwp, urutFromNpwp } from '$lib/helpers/npwp';
import { npwpPattern } from '$lib/helpers/username';
import { db } from '$lib/server/db';
import { batch_peserta } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '$lib/server/admin';
import { nextNpwpForBatch, nextNpwpForLone } from '$lib/server/batch';
import { createPesertaAccount } from '$lib/server/peserta';
import { invalid } from '@sveltejs/kit';
import * as v from 'valibot';
import { listBatch } from './listBatch.remote';
import { listPeserta } from './listPeserta.remote';

const CreatePesertaSchema = v.object({
	// Empty means a lone peserta, numbered outside the reserved batch digits.
	batchId: v.optional(v.string(), ''),
	nama: v.pipe(v.string(), v.nonEmpty('Nama harus diisi')),
	email: v.pipe(v.string(), v.nonEmpty('Email harus diisi'), v.email('Email tidak valid')),
	_password: v.pipe(
		v.string(),
		v.nonEmpty('Password harus diisi'),
		v.minLength(3, 'Password minimal 3 karakter')
	),
	// Optional override; blank lets the batch (or the lone population) allocate the number.
	npwp: v.optional(
		v.union([
			v.literal(''),
			v.pipe(v.string(), v.regex(npwpPattern, 'NPWP harus berisi 15 sampai 16 digit'))
		]),
		''
	)
});

export const createPeserta = form(
	CreatePesertaSchema,
	async ({ batchId, nama, email, _password, npwp }) => {
		const { headers } = requireAdmin();

		const [batch] = batchId
			? await db
					.select({ penomoran: batch_peserta.penomoran })
					.from(batch_peserta)
					.where(eq(batch_peserta.id, batchId))
					.limit(1)
			: [];

		if (batchId && !batch) {
			invalid('Batch tidak ditemukan');
		}

		let alokasi: { npwp: string; urut: number | null } | null;

		if (batch?.penomoran === 'nik') {
			// A NIK batch issues no numbers: the NPWP is the peserta's own NIK, typed here.
			const pesanNik = npwp ? validasiNik(npwp) : 'NIK peserta harus diisi untuk batch ini';

			if (pesanNik) {
				invalid(pesanNik);
			}

			alokasi = { npwp, urut: null };
		} else if (npwp) {
			const urut = batchId ? urutFromNpwp(npwp) : serialFromLoneNpwp(npwp);

			if (Number.isNaN(urut)) {
				invalid('NPWP tidak sesuai format penomoran peserta');
			}

			alokasi = { npwp, urut };
		} else {
			alokasi = batchId ? await nextNpwpForBatch(batchId) : await nextNpwpForLone();
		}

		if (!alokasi) {
			invalid(
				batchId
					? 'Batch ini sudah penuh (99 peserta). Buat batch baru.'
					: 'Nomor peserta tanpa batch sudah habis.'
			);
		}

		const result = await createPesertaAccount(headers, {
			npwp: alokasi.npwp,
			urut: alokasi.urut,
			nama,
			email,
			password: _password,
			batchId: batchId || null
		});

		if (!result.ok) {
			invalid(result.message);
		}

		await listPeserta().refresh();
		await listBatch().refresh();

		return { message: `Peserta ${nama} (${alokasi.npwp}) berhasil dibuat` };
	}
);
