import { form, getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { bukti_potong_mp } from '$lib/server/db/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import * as v from 'valibot';

const DeleteMpSchema = v.object({ id: v.string() });

export const deleteMp = form(DeleteMpSchema, async ({ id }) => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	await db
		.delete(bukti_potong_mp)
		.where(
			and(
				eq(bukti_potong_mp.id, id),
				eq(bukti_potong_mp.npwpPemotong, activeNpwp),
				eq(bukti_potong_mp.diterbitkan, false)
			)
		);

	redirect(303, '/ebupot/mp');
});
