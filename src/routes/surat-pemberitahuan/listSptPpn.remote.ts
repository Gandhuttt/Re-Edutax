import { getRequestEvent, query } from '$app/server';
import { db } from '$lib/server/db';
import { spt_ppn, spt_ppn_penyerahan, spt_ppn_perolehan } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { and, desc, eq } from 'drizzle-orm';
import * as v from 'valibot';

const ListSptPpnSchema = v.object({
	status: v.picklist(['konsep', 'menunggu_pembayaran', 'dilaporkan'])
});

export const listSptPpn = query(ListSptPpnSchema, async ({ status }) => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	return db
		.select({
			id: spt_ppn.id,
			masaPajak: spt_ppn.masaPajak,
			tahun: spt_ppn.tahun,
			pembetulanKe: spt_ppn.pembetulanKe,
			status: spt_ppn.status,
			totalPpnKeluaran: spt_ppn_penyerahan.iAJumlahPpn,
			totalPpnMasukan: spt_ppn_perolehan.iiGPpn,
			ppnKurangLebihBayar: spt_ppn.iiiE,
			tanggalPosting: spt_ppn.tanggalPosting,
			tanggalDilaporkan: spt_ppn.tanggalDilaporkan
		})
		.from(spt_ppn)
		.leftJoin(spt_ppn_penyerahan, eq(spt_ppn_penyerahan.sptPpnId, spt_ppn.id))
		.leftJoin(spt_ppn_perolehan, eq(spt_ppn_perolehan.sptPpnId, spt_ppn.id))
		.where(and(eq(spt_ppn.npwp, activeNpwp), eq(spt_ppn.status, status)))
		.orderBy(desc(spt_ppn.tahun), desc(spt_ppn.masaPajak), desc(spt_ppn.pembetulanKe));
});
