import { form, getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { bukti_potong_bpa1 } from '$lib/server/db/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import * as v from 'valibot';

// Simulated Terbitkan, same as terbitkanBp21.remote.ts -- this app never
// calls the real Coretax issuance action.
const generateNomorPemotongan = () => {
	const random = crypto.getRandomValues(new Uint32Array(1))[0];
	return String(random).padStart(10, '0').slice(0, 10);
};

const TerbitkanBpa1Schema = v.object({ id: v.string() });

export const terbitkanBpa1 = form(TerbitkanBpa1Schema, async ({ id }) => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	const [existing] = await db
		.select({ id: bukti_potong_bpa1.id, status: bukti_potong_bpa1.status })
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

	if (existing.status !== 'SUBMITTED') {
		error(400, 'BPA1 harus di-submit terlebih dahulu sebelum diterbitkan');
	}

	await db
		.update(bukti_potong_bpa1)
		.set({ diterbitkan: true, nomorPemotongan: generateNomorPemotongan() })
		.where(eq(bukti_potong_bpa1.id, id));

	redirect(303, '/ebupot/bpa1');
});
