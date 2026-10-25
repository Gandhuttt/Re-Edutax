import { getRequestEvent, query } from '$app/server';
import { db } from '$lib/server/db';
import { spt_pph_badan, spt_pph_orang_pribadi, spt_ppn, spt_pph_2126 } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';

// The periods of the normal SPT (pembetulan_ke = 0) the taxpayer already holds, whatever
// their status. The "Buat SPT" dialog counts them to say how many exist before another
// one is opened for the same period.
export const listPeriodeSpt = query(async () => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	const [pph2126, ppn, badan, orangPribadi] = await Promise.all([
		db
			.select({ masaPajak: spt_pph_2126.masaPajak, tahun: spt_pph_2126.tahun })
			.from(spt_pph_2126)
			.where(and(eq(spt_pph_2126.npwpPemotong, activeNpwp), eq(spt_pph_2126.pembetulanKe, 0))),
		db
			.select({ masaPajak: spt_ppn.masaPajak, tahun: spt_ppn.tahun })
			.from(spt_ppn)
			.where(and(eq(spt_ppn.npwp, activeNpwp), eq(spt_ppn.pembetulanKe, 0))),
		db
			.select({ tahun: spt_pph_badan.tahunPajak })
			.from(spt_pph_badan)
			.where(and(eq(spt_pph_badan.npwp, activeNpwp), eq(spt_pph_badan.pembetulanKe, 0))),
		db
			.select({ tahun: spt_pph_orang_pribadi.tahunPajak })
			.from(spt_pph_orang_pribadi)
			.where(
				and(eq(spt_pph_orang_pribadi.npwp, activeNpwp), eq(spt_pph_orang_pribadi.pembetulanKe, 0))
			)
	]);

	return { pph2126, ppn, badan, orangPribadi };
});
