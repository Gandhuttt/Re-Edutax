import { form, getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { bukti_potong_bpa2 } from '$lib/server/db/schema';
import { error, redirect } from '@sveltejs/kit';

export const newEmpty = form(async () => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	const id = crypto.randomUUID();
	const today = new Date();

	await db.insert(bukti_potong_bpa2).values({
		id,
		npwpPemotong: activeNpwp,
		masaPajakAwal: 1,
		tahunAwal: today.getFullYear(),
		masaPajakAkhir: today.getMonth() + 1,
		tahunAkhir: today.getFullYear()
	});

	redirect(303, `/ebupot/bpa2/${id}`);
});
