import { form, getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { bukti_potong_mp } from '$lib/server/db/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import * as v from 'valibot';

// Simulated Terbitkan, same as terbitkanBp21.remote.ts -- this app never
// calls the real Coretax issuance action.
const generateNomorPemotongan = () => {
	const random = crypto.getRandomValues(new Uint32Array(1))[0];
	return String(random).padStart(10, '0').slice(0, 10);
};

const TerbitkanMpSchema = v.object({ id: v.string() });

export const terbitkanMp = form(TerbitkanMpSchema, async ({ id }) => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	const [existing] = await db
		.select({ id: bukti_potong_mp.id, status: bukti_potong_mp.status })
		.from(bukti_potong_mp)
		.where(
			and(
				eq(bukti_potong_mp.id, id),
				eq(bukti_potong_mp.npwpPemotong, activeNpwp),
				eq(bukti_potong_mp.diterbitkan, false)
			)
		)
		.limit(1);

	if (!existing) {
		error(404, 'MP draft tidak ditemukan');
	}

	if (existing.status !== 'SUBMITTED') {
		error(400, 'MP harus di-submit terlebih dahulu sebelum diterbitkan');
	}

	await db
		.update(bukti_potong_mp)
		.set({ diterbitkan: true, nomorPemotongan: generateNomorPemotongan() })
		.where(eq(bukti_potong_mp.id, id));

	redirect(303, '/ebupot/mp');
});
