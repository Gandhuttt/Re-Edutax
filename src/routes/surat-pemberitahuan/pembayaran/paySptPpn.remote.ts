import { form, getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { spt_ppn } from '$lib/server/db/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import * as v from 'valibot';

const SptPpnIdSchema = v.object({
	id: v.string()
});

export const paySptPpn = form(SptPpnIdSchema, async ({ id }) => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	await db
		.update(spt_ppn)
		.set({
			status: 'dilaporkan',
			tanggalDilaporkan: new Date()
		})
		.where(
			and(
				eq(spt_ppn.id, id),
				eq(spt_ppn.npwp, activeNpwp),
				eq(spt_ppn.status, 'menunggu_pembayaran')
			)
		);

	redirect(303, '/surat-pemberitahuan/laporan');
});
