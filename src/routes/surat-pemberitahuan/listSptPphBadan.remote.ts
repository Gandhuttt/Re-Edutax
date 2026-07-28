import { getRequestEvent, query } from '$app/server';
import { db } from '$lib/server/db';
import { spt_pph_badan } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { and, desc, eq } from 'drizzle-orm';
import * as v from 'valibot';

const ListSptPphBadanSchema = v.object({
	status: v.picklist(['konsep', 'tervalidasi', 'menunggu_pembayaran', 'dilaporkan'])
});

export const listSptPphBadan = query(ListSptPphBadanSchema, async ({ status }) => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	return db
		.select({
			id: spt_pph_badan.id,
			tahunPajak: spt_pph_badan.tahunPajak,
			pembetulanKe: spt_pph_badan.pembetulanKe,
			statusSpt: spt_pph_badan.statusSpt,
			statusDraft: spt_pph_badan.statusDraft,
			pphKurangLebihBayar: spt_pph_badan.pphKurangLebihBayar,
			tanggalPosting: spt_pph_badan.tanggalPosting,
			tanggalDilaporkan: spt_pph_badan.tanggalDilaporkan
		})
		.from(spt_pph_badan)
		.where(and(eq(spt_pph_badan.npwp, activeNpwp), eq(spt_pph_badan.statusDraft, status)))
		.orderBy(desc(spt_pph_badan.tahunPajak), desc(spt_pph_badan.pembetulanKe));
});
