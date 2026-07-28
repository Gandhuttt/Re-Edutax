import { db } from '$lib/server/db';
import { spt_ppn } from '$lib/server/db/schema';
import { and, eq } from 'drizzle-orm';
import { createEmptySptPpnBlob } from './createEmptySptPpnBlob';
import { summarizeSptPpnBlob } from './summarizeSptPpnBlob.server';

export async function getOrCreateCurrentSptPpn(activeNpwp: string, nama = '') {
	const today = new Date();
	const periodeBulan = today.getMonth() + 1;
	const periodeTahun = today.getFullYear();

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
		const blob = createEmptySptPpnBlob({
			periodeBulan,
			periodeTahun,
			nama
		});

		[sptPpn] = await db
			.insert(spt_ppn)
			.values({
				npwp: activeNpwp,
				masaPajak: periodeBulan,
				tahun: periodeTahun,
				pembetulanKe: 0,
				blob,
				...summarizeSptPpnBlob(blob)
			})
			.returning();
	}

	return sptPpn;
}
