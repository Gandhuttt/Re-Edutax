import { form, getRequestEvent } from '$app/server';
import { requiredString } from '$lib/helpers/valibot-schema';
import { db } from '$lib/server/db';
import { spt_pph_badan } from '$lib/server/db/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import * as v from 'valibot';

const SptPphBadanIdSchema = v.object({
	id: requiredString('SPT PPh Badan')
});

export const paySptPphBadan = form(SptPphBadanIdSchema, async ({ id }) => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	await db
		.update(spt_pph_badan)
		.set({
			statusDraft: 'dilaporkan',
			tanggalDilaporkan: new Date()
		})
		.where(
			and(
				eq(spt_pph_badan.id, id),
				eq(spt_pph_badan.npwp, activeNpwp),
				eq(spt_pph_badan.statusDraft, 'menunggu_pembayaran')
			)
		);

	redirect(303, '/surat-pemberitahuan/laporan');
});
