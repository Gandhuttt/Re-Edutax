import { form, getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { bukti_potong_bpu } from '$lib/server/db/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import * as v from 'valibot';

const DeleteBpuSchema = v.object({ id: v.string() });

export const deleteBpu = form(DeleteBpuSchema, async ({ id }) => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	await db
		.delete(bukti_potong_bpu)
		.where(
			and(
				eq(bukti_potong_bpu.id, id),
				eq(bukti_potong_bpu.npwpPemotong, activeNpwp),
				eq(bukti_potong_bpu.diterbitkan, false)
			)
		);

	redirect(303, '/ebupot/bpu');
});
