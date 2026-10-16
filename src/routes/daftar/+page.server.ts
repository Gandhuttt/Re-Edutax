import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { batch_peserta, pendaftaran_kelas } from '$lib/server/db/schema';
import { pendaftaranDiaktifkan, pendaftaranTersedia } from '$lib/server/pendaftaran';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Checked first, before any query: a deployment that has not released registration answers 404.
	if (!pendaftaranDiaktifkan()) {
		error(404, 'Halaman tidak ditemukan');
	}

	const dibuka = await db
		.select({ kode: pendaftaran_kelas.kode, penomoran: batch_peserta.penomoran })
		.from(pendaftaran_kelas)
		.innerJoin(batch_peserta, eq(batch_peserta.id, pendaftaran_kelas.batchId));

	return {
		tersedia: pendaftaranTersedia(),
		turnstileSiteKey: env.TURNSTILE_SITEKEY ?? '',
		// `perluNik`: the class's batch uses the peserta's own NIK as NPWP, so the form asks for it.
		kelasDibuka: dibuka.map((kelas) => ({ kode: kelas.kode, perluNik: kelas.penomoran === 'nik' }))
	};
};
