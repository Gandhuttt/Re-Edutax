import { form, getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { bukti_potong_bp21 } from '$lib/server/db/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import * as v from 'valibot';

// Simulated Terbitkan, same as terbitkanBpu.remote.ts -- this app never
// calls the real Coretax issuance action. Requires status SUBMITTED and
// assigns a Nomor Pemotongan. Usable both from the list (per-row action)
// and from the detail page via .for(id).
const generateNomorPemotongan = () => {
	const random = crypto.getRandomValues(new Uint32Array(1))[0];
	return String(random).padStart(10, '0').slice(0, 10);
};

const TerbitkanBp21Schema = v.object({ id: v.string() });

export const terbitkanBp21 = form(TerbitkanBp21Schema, async ({ id }) => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	const [existing] = await db
		.select({ id: bukti_potong_bp21.id, status: bukti_potong_bp21.status })
		.from(bukti_potong_bp21)
		.where(
			and(
				eq(bukti_potong_bp21.id, id),
				eq(bukti_potong_bp21.npwpPemotong, activeNpwp),
				eq(bukti_potong_bp21.diterbitkan, false)
			)
		)
		.limit(1);

	if (!existing) {
		error(404, 'BP21 draft tidak ditemukan');
	}

	if (existing.status !== 'SUBMITTED') {
		error(400, 'BP21 harus di-submit terlebih dahulu sebelum diterbitkan');
	}

	await db
		.update(bukti_potong_bp21)
		.set({ diterbitkan: true, nomorPemotongan: generateNomorPemotongan() })
		.where(eq(bukti_potong_bp21.id, id));

	redirect(303, '/ebupot/bp21');
});
