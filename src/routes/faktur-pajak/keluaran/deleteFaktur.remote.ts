import { form, getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { faktur_pajak } from '$lib/server/db/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import * as v from 'valibot';

const FakturIdSchema = v.object({
	id: v.string()
});

export const deleteFaktur = form(FakturIdSchema, async ({ id }) => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	await db
		.delete(faktur_pajak)
		.where(
			and(
				eq(faktur_pajak.id, id),
				eq(faktur_pajak.npwpPenjual, activeNpwp),
				eq(faktur_pajak.diupload, false)
			)
		);

	redirect(303, '/faktur-pajak/keluaran');
});
