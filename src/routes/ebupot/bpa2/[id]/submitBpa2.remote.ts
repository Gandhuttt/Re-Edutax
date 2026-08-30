import { form, getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { bukti_potong_bpa2 } from '$lib/server/db/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';

// Mirrors Coretax's Submit step, same as submitBpa1.remote.ts.
export const submitBpa2 = form(async () => {
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
		.from(bukti_potong_bpa2)
		.where(
			and(
				eq(bukti_potong_bpa2.id, id),
				eq(bukti_potong_bpa2.npwpPemotong, activeNpwp),
				eq(bukti_potong_bpa2.diterbitkan, false)
			)
		)
		.limit(1);

	if (!existing) {
		error(404, 'BPA2 draft tidak ditemukan');
	}

	const missing =
		!existing.nomorIdentitasWp ||
		!existing.nama ||
		!existing.nip ||
		!existing.pangkatGolongan ||
		!existing.statusPtkp ||
		!existing.posisi ||
		!existing.kodeObjekPajakId ||
		!existing.jenisPemotongan ||
		existing.penghasilanBruto <= 0;

	if (missing) {
		error(400, 'Data belum lengkap, tidak dapat di-submit');
	}

	await db
		.update(bukti_potong_bpa2)
		.set({ status: 'SUBMITTED' })
		.where(eq(bukti_potong_bpa2.id, id));

	redirect(303, '/ebupot/bpa2');
});
