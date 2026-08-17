import { getRequestEvent, query } from '$app/server';
import { db } from '$lib/server/db';
import { spt_pph_orang_pribadi } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { and, desc, eq } from 'drizzle-orm';
import * as v from 'valibot';

const ListSptPphOrangPribadiSchema = v.object({
	status: v.picklist(['konsep', 'tervalidasi', 'menunggu_pembayaran', 'dilaporkan'])
});

export const listSptPphOrangPribadi = query(ListSptPphOrangPribadiSchema, async ({ status }) => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	return db
		.select({
			id: spt_pph_orang_pribadi.id,
			tahunPajak: spt_pph_orang_pribadi.tahunPajak,
			pembetulanKe: spt_pph_orang_pribadi.pembetulanKe,
			statusSpt: spt_pph_orang_pribadi.statusSpt,
			statusDraft: spt_pph_orang_pribadi.statusDraft,
			pphKurangLebihBayar: spt_pph_orang_pribadi.pphKurangLebihBayar,
			tanggalPosting: spt_pph_orang_pribadi.tanggalPosting,
			tanggalDilaporkan: spt_pph_orang_pribadi.tanggalDilaporkan
		})
		.from(spt_pph_orang_pribadi)
		.where(
			and(eq(spt_pph_orang_pribadi.npwp, activeNpwp), eq(spt_pph_orang_pribadi.statusDraft, status))
		)
		.orderBy(desc(spt_pph_orang_pribadi.tahunPajak), desc(spt_pph_orang_pribadi.pembetulanKe));
});
