import { getRequestEvent, query } from '$app/server';
import { db } from '$lib/server/db';
import { bukti_potong_bp26 } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';

// Statuses after which a BP26 can never be edited again.
const terminalStatuses = ['DELETED', 'CANCELLED', 'AMENDED'];

export const getBp26 = query(async () => {
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
		.from(bukti_potong_bp26)
		.where(and(eq(bukti_potong_bp26.id, id), eq(bukti_potong_bp26.npwpPemotong, activeNpwp)))
		.limit(1);

	if (!row) {
		error(404, 'BP26 tidak ditemukan');
	}

	// History source: the issued BP26 this amendment replaces (same owner only).
	let sumberPembetulan: { id: string; nomorPemotongan: string | null; status: string } | null = null;
	if (row.pembetulanDariId) {
		const [source] = await db
			.select({
				id: bukti_potong_bp26.id,
				nomorPemotongan: bukti_potong_bp26.nomorPemotongan,
				status: bukti_potong_bp26.status
			})
			.from(bukti_potong_bp26)
			.where(
				and(
					eq(bukti_potong_bp26.id, row.pembetulanDariId),
					eq(bukti_potong_bp26.npwpPemotong, activeNpwp)
				)
			)
			.limit(1);
		sumberPembetulan = source ?? null;
	}

	return {
		...row,
		sumberPembetulan,
		terminal: terminalStatuses.includes(row.status),
		canEdit: !row.diterbitkan && !terminalStatuses.includes(row.status)
	};
});
