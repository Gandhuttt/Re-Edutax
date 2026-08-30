import { form, getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { bukti_potong_bpa2 } from '$lib/server/db/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import * as v from 'valibot';

// Simulated Terbitkan, same as terbitkanBpa1.remote.ts -- this app never
// calls the real Coretax issuance action.
const generateNomorPemotongan = () => {
	const random = crypto.getRandomValues(new Uint32Array(1))[0];
	return String(random).padStart(10, '0').slice(0, 10);
};

const TerbitkanBpa2Schema = v.object({ id: v.string() });

export const terbitkanBpa2 = form(TerbitkanBpa2Schema, async ({ id }) => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	const [existing] = await db
		.select({ id: bukti_potong_bpa2.id, status: bukti_potong_bpa2.status })
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

	if (existing.status !== 'SUBMITTED') {
		error(400, 'BPA2 harus di-submit terlebih dahulu sebelum diterbitkan');
	}

	await db
		.update(bukti_potong_bpa2)
		.set({ diterbitkan: true, nomorPemotongan: generateNomorPemotongan() })
		.where(eq(bukti_potong_bpa2.id, id));

	redirect(303, '/ebupot/bpa2');
});
