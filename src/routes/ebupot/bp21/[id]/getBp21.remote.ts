import { getRequestEvent, query } from '$app/server';
import { db } from '$lib/server/db';
import { bukti_potong_bp21 } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';

// Unissued rows in these statuses can still be edited; DELETED/CANCELLED/AMENDED are terminal.
const editableStatuses = ['NORMAL', 'SAVEDINVALID', 'SUBMITTED', 'AMENDMENT'];

export const getBp21 = query(async () => {
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
		.from(bukti_potong_bp21)
		.where(and(eq(bukti_potong_bp21.id, id), eq(bukti_potong_bp21.npwpPemotong, activeNpwp)))
		.limit(1);

	if (!row) {
		error(404, 'BP21 tidak ditemukan');
	}

	// Origin of a correction (pembetulan): only link to a row the same owner can open.
	let pembetulanDari: { id: string; nomorPemotongan: string | null } | null = null;
	if (row.pembetulanDariId) {
		const [origin] = await db
			.select({ id: bukti_potong_bp21.id, nomorPemotongan: bukti_potong_bp21.nomorPemotongan })
			.from(bukti_potong_bp21)
			.where(
				and(
					eq(bukti_potong_bp21.id, row.pembetulanDariId),
					eq(bukti_potong_bp21.npwpPemotong, activeNpwp)
				)
			)
			.limit(1);
		pembetulanDari = origin ?? null;
	}

	return {
		...row,
		canEdit: !row.diterbitkan && editableStatuses.includes(row.status),
		pembetulanDari
	};
});
