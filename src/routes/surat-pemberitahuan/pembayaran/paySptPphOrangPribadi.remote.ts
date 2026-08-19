import { form, getRequestEvent } from '$app/server';
import { requiredString } from '$lib/helpers/valibot-schema';
import { db } from '$lib/server/db';
import { spt_pph_orang_pribadi } from '$lib/server/db/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import * as v from 'valibot';

const SptPphOrangPribadiIdSchema = v.object({
	id: requiredString('SPT PPh Orang Pribadi')
});

export const paySptPphOrangPribadi = form(SptPphOrangPribadiIdSchema, async ({ id }) => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	await db
		.update(spt_pph_orang_pribadi)
		.set({
			statusDraft: 'dilaporkan',
			tanggalDilaporkan: new Date()
		})
		.where(
			and(
				eq(spt_pph_orang_pribadi.id, id),
				eq(spt_pph_orang_pribadi.npwp, activeNpwp),
				eq(spt_pph_orang_pribadi.statusDraft, 'menunggu_pembayaran')
			)
		);

	redirect(303, '/surat-pemberitahuan/laporan');
});
