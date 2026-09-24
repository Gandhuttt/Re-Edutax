import { form, getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { bukti_potong_bpa1, fasilitas_pajak_ebupot } from '$lib/server/db/schema';
import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const newEmpty = form(async () => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	const id = crypto.randomUUID();
	const today = new Date();
	const [defaultFacility] = await db
		.select({ id: fasilitas_pajak_ebupot.id })
		.from(fasilitas_pajak_ebupot)
		.where(eq(fasilitas_pajak_ebupot.kode, '9'))
		.limit(1);

	if (!defaultFacility) {
		error(500, 'Fasilitas Tanpa Fasilitas tidak tersedia');
	}

	await db.insert(bukti_potong_bpa1).values({
		id,
		npwpPemotong: activeNpwp,
		masaPajakAwal: 1,
		tahunAwal: today.getFullYear(),
		masaPajakAkhir: today.getMonth() + 1,
		tahunAkhir: today.getFullYear(),
		fasilitasPajakId: defaultFacility.id,
	});

	redirect(303, `/ebupot/bpa1/${id}`);
});
