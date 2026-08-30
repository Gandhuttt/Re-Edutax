import { getRequestEvent, query } from '$app/server';
import { db } from '$lib/server/db';
import { bukti_potong_bpa1 } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';

export const getBpa1 = query(async () => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;
	const id = event.params.id;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	if (!id) {
		error(400, 'Bad id');
	}

	const [row] = await db
		.select()
		.from(bukti_potong_bpa1)
		.where(and(eq(bukti_potong_bpa1.id, id), eq(bukti_potong_bpa1.npwpPemotong, activeNpwp)))
		.limit(1);

	if (!row) {
		error(404, 'BPA1 tidak ditemukan');
	}

	return { ...row, canEdit: !row.diterbitkan };
});
