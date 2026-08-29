import { form, getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { bukti_potong_bp21 } from '$lib/server/db/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import * as v from 'valibot';

const DeleteBp21Schema = v.object({ id: v.string() });

export const deleteBp21 = form(DeleteBp21Schema, async ({ id }) => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	await db
		.delete(bukti_potong_bp21)
		.where(
			and(
				eq(bukti_potong_bp21.id, id),
				eq(bukti_potong_bp21.npwpPemotong, activeNpwp),
				eq(bukti_potong_bp21.diterbitkan, false)
			)
		);

	redirect(303, '/ebupot/bp21');
});
