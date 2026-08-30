import { form, getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { bukti_potong_bpa1 } from '$lib/server/db/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';

// Mirrors Coretax's Submit step, same as submitBp21.remote.ts.
export const submitBpa1 = form(async () => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;
	const id = event.params.id;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	if (!id) {
		error(400, 'Bad id');
	}

	const [existing] = await db
		.select()
		.from(bukti_potong_bpa1)
		.where(
			and(
				eq(bukti_potong_bpa1.id, id),
				eq(bukti_potong_bpa1.npwpPemotong, activeNpwp),
				eq(bukti_potong_bpa1.diterbitkan, false)
			)
		)
		.limit(1);

	if (!existing) {
		error(404, 'BPA1 draft tidak ditemukan');
	}

	const missing =
		!existing.nomorIdentitasWp ||
		!existing.nama ||
		!existing.statusPtkp ||
		!existing.jabatan ||
		!existing.kodeObjekPajakId ||
		!existing.fasilitasPajakId ||
		!existing.jenisPemotongan ||
		!existing.jenisDokumenId ||
		!existing.nomorDokumen ||
		!existing.tanggalDokumen ||
		existing.penghasilanBruto <= 0;

	if (missing) {
		error(400, 'Data belum lengkap, tidak dapat di-submit');
	}

	await db
		.update(bukti_potong_bpa1)
		.set({ status: 'SUBMITTED' })
		.where(eq(bukti_potong_bpa1.id, id));

	redirect(303, '/ebupot/bpa1');
});
