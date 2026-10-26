import { getRequestEvent, query } from '$app/server';
import { MP_EDITABLE_STATUSES } from '$lib/helpers/mp-parity';
import { db } from '$lib/server/db';
import { bukti_potong_mp } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';

export const getMp = query(async () => {
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
		.from(bukti_potong_mp)
		.where(and(eq(bukti_potong_mp.id, id), eq(bukti_potong_mp.npwpPemotong, activeNpwp)))
		.limit(1);

	if (!row) {
		error(404, 'MP tidak ditemukan');
	}

	// Origin of a correction (pembetulan): only link to a row the same owner can open.
	let pembetulanDari: { id: string; nomorPemotongan: string | null } | null = null;
	if (row.pembetulanDariId) {
		const [origin] = await db
			.select({ id: bukti_potong_mp.id, nomorPemotongan: bukti_potong_mp.nomorPemotongan })
			.from(bukti_potong_mp)
			.where(and(eq(bukti_potong_mp.id, row.pembetulanDariId), eq(bukti_potong_mp.npwpPemotong, activeNpwp)))
			.limit(1);
		pembetulanDari = origin ?? null;
	}

	return {
		...row,
		canEdit: !row.diterbitkan && MP_EDITABLE_STATUSES.includes(row.status),
		pembetulanDari
	};
});
