import { form, getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { bukti_potong_bpa1 } from '$lib/server/db/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import * as v from 'valibot';

const DeleteBpa1Schema = v.object({ id: v.string() });

export const deleteBpa1 = form(DeleteBpa1Schema, async ({ id }) => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	await db
		.delete(bukti_potong_bpa1)
		.where(
			and(
				eq(bukti_potong_bpa1.id, id),
				eq(bukti_potong_bpa1.npwpPemotong, activeNpwp),
				eq(bukti_potong_bpa1.diterbitkan, false)
			)
		);

	redirect(303, '/ebupot/bpa1');
});
