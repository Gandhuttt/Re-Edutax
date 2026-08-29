import { form, getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { bukti_potong_bpu } from '$lib/server/db/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';

// Mirrors Coretax's Submit step (see docs/ui-reference/coretax/ebupot/NOTES.md):
// a distinct, non-issuing validation step between Simpan Konsep and Terbitkan.
// It doesn't take new input -- it validates whatever is currently saved and,
// if complete, flips status from SAVEDINVALID to SUBMITTED.
export const submitBpu = form(async () => {
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
		.from(bukti_potong_bpu)
		.where(
			and(
				eq(bukti_potong_bpu.id, id),
				eq(bukti_potong_bpu.npwpPemotong, activeNpwp),
				eq(bukti_potong_bpu.diterbitkan, false)
			)
		)
		.limit(1);

	if (!existing) {
		error(404, 'BPU draft tidak ditemukan');
	}

	const missing =
		!existing.nomorIdentitasWp ||
		!existing.namaPenerima ||
		!existing.kodeObjekPajakId ||
		!existing.fasilitasPajakId ||
		!existing.jenisDokumenId ||
		!existing.nomorDokumen ||
		!existing.tanggalDokumen ||
		existing.dasarPengenaanPajak <= 0;

	if (missing) {
		error(400, 'Data belum lengkap, tidak dapat di-submit');
	}

	await db
		.update(bukti_potong_bpu)
		.set({ status: 'SUBMITTED' })
		.where(eq(bukti_potong_bpu.id, id));

	redirect(303, '/ebupot/bpu');
});
