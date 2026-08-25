import { db } from '$lib/server/db';
import { spt_ppn, spt_ppn_penyerahan, spt_ppn_perolehan } from '$lib/server/db/schema';
import { and, eq } from 'drizzle-orm';
import { createEmptySptPpnFields } from '../createEmptySptPpnFields';

export async function getOrCreateSptPpnForPeriod(
	activeNpwp: string,
	nama = '',
	periodeBulan: number,
	periodeTahun: number
) {
	let [sptPpn] = await db
		.select()
		.from(spt_ppn)
		.where(
			and(
				eq(spt_ppn.npwp, activeNpwp),
				eq(spt_ppn.masaPajak, periodeBulan),
				eq(spt_ppn.tahun, periodeTahun),
				eq(spt_ppn.pembetulanKe, 0)
			)
		)
		.limit(1);

	if (!sptPpn) {
		const { penyerahan, perolehan, ...induk } = createEmptySptPpnFields({ nama });

		[sptPpn] = await db
			.insert(spt_ppn)
			.values({
				npwp: activeNpwp,
				masaPajak: periodeBulan,
				tahun: periodeTahun,
				pembetulanKe: 0,
				...induk
			})
			.returning();

		await db.insert(spt_ppn_penyerahan).values({ sptPpnId: sptPpn.id, ...penyerahan });
		await db.insert(spt_ppn_perolehan).values({ sptPpnId: sptPpn.id, ...perolehan });
	}

	return sptPpn;
}

export async function getOrCreateCurrentSptPpn(activeNpwp: string, nama = '') {
	const today = new Date();

	return getOrCreateSptPpnForPeriod(activeNpwp, nama, today.getMonth() + 1, today.getFullYear());
}
