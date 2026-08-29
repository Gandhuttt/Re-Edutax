import { getRequestEvent, query } from '$app/server';
import { db } from '$lib/server/db';
import { bukti_potong_bpu } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';

export const getBpu = query(async () => {
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
		.from(bukti_potong_bpu)
		.where(and(eq(bukti_potong_bpu.id, id), eq(bukti_potong_bpu.npwpPemotong, activeNpwp)))
		.limit(1);

	if (!row) {
		error(404, 'BPU tidak ditemukan');
	}

	return { ...row, canEdit: !row.diterbitkan };
});
