import { form, getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { bukti_potong_mp } from '$lib/server/db/schema';
import { error, redirect } from '@sveltejs/kit';

export const newEmpty = form(async () => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	const id = crypto.randomUUID();
	const today = new Date();

	await db.insert(bukti_potong_mp).values({
		id,
		npwpPemotong: activeNpwp,
		masaPajak: today.getMonth() + 1,
		tahun: today.getFullYear()
	});

	redirect(303, `/ebupot/mp/${id}`);
});
