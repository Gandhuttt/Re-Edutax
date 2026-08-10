import { form, getRequestEvent } from '$app/server';
import { requiredString } from '$lib/helpers/valibot-schema';
import { db } from '$lib/server/db';
import { spt_pph_badan } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import * as v from 'valibot';

const DeleteSptPphBadanSchema = v.object({
	id: requiredString('SPT PPh Badan')
});

export const deleteSptPphBadan = form(DeleteSptPphBadanSchema, async ({ id }) => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	const [existing] = await db
		.select({ statusDraft: spt_pph_badan.statusDraft })
		.from(spt_pph_badan)
		.where(and(eq(spt_pph_badan.id, id), eq(spt_pph_badan.npwp, activeNpwp)))
		.limit(1);

	if (!existing) {
		error(404, 'SPT PPh Badan tidak ditemukan');
	}

	if (existing.statusDraft !== 'konsep') {
		error(400, 'Hanya SPT berstatus konsep yang dapat dihapus');
	}

	await db.delete(spt_pph_badan).where(eq(spt_pph_badan.id, id));
});
