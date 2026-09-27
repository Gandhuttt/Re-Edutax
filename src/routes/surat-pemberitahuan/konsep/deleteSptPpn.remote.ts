import { form, getRequestEvent } from '$app/server';
import { requiredString } from '$lib/helpers/valibot-schema';
import { db } from '$lib/server/db';
import { spt_ppn } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import * as v from 'valibot';

const DeleteSptPpnSchema = v.object({ id: requiredString('SPT Masa PPN') });

export const deleteSptPpn = form(DeleteSptPpnSchema, async ({ id }) => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;
	if (!activeNpwp) error(401, 'Belum login');

	const [record] = await db
		.select({ status: spt_ppn.status })
		.from(spt_ppn)
		.where(and(eq(spt_ppn.id, id), eq(spt_ppn.npwp, activeNpwp)))
		.limit(1);

	if (!record) error(404, 'SPT Masa PPN tidak ditemukan');
	if (record.status !== 'konsep') error(400, 'Hanya SPT berstatus konsep yang dapat dihapus');

	await db.delete(spt_ppn).where(eq(spt_ppn.id, id));
});
