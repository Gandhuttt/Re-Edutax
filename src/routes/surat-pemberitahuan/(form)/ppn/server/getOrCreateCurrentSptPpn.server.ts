import { db } from '$lib/server/db';
import { spt_ppn, spt_ppn_penyerahan, spt_ppn_perolehan } from '$lib/server/db/schema';
import { createEmptySptPpnFields } from '../createEmptySptPpnFields';

export async function createSptPpnForPractice(
	activeNpwp: string,
	nama = '',
	periodeBulan: number,
	periodeTahun: number
) {
	const { penyerahan, perolehan, ...induk } = createEmptySptPpnFields({ nama });
	const id = crypto.randomUUID();
	await db.batch([
		db.insert(spt_ppn).values({
			id,
			npwp: activeNpwp,
			masaPajak: periodeBulan,
			tahun: periodeTahun,
			pembetulanKe: 0,
			...induk
		}),
		db.insert(spt_ppn_penyerahan).values({ sptPpnId: id, ...penyerahan }),
		db.insert(spt_ppn_perolehan).values({ sptPpnId: id, ...perolehan })
	]);

	return { id };
}
