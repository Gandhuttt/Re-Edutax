import { form, getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { bukti_potong_bp26 } from '$lib/server/db/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import * as v from 'valibot';

// Simulated Terbitkan, same as terbitkanBp21.remote.ts -- this app never
// calls the real Coretax issuance action.
const generateNomorPemotongan = () => {
	const random = crypto.getRandomValues(new Uint32Array(1))[0];
	return String(random).padStart(10, '0').slice(0, 10);
};

const TerbitkanBp26Schema = v.object({ id: v.string() });

export const terbitkanBp26 = form(TerbitkanBp26Schema, async ({ id }) => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	const [existing] = await db
		.select({ id: bukti_potong_bp26.id, status: bukti_potong_bp26.status })
		.from(bukti_potong_bp26)
		.where(
			and(
				eq(bukti_potong_bp26.id, id),
				eq(bukti_potong_bp26.npwpPemotong, activeNpwp),
				eq(bukti_potong_bp26.diterbitkan, false)
			)
		)
		.limit(1);

	if (!existing) {
		error(404, 'BP26 draft tidak ditemukan');
	}

	if (existing.status !== 'SUBMITTED') {
		error(400, 'BP26 harus di-submit terlebih dahulu sebelum diterbitkan');
	}

	await db
		.update(bukti_potong_bp26)
		.set({ diterbitkan: true, nomorPemotongan: generateNomorPemotongan() })
		.where(eq(bukti_potong_bp26.id, id));

	redirect(303, '/ebupot/bp26');
});
