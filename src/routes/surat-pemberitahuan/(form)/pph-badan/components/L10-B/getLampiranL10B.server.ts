import { db } from '$lib/server/db';
import { spt_pph_badan_lampiran_10b_pernyataan } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function getLampiranL10B(sptPphBadanId: string) {
	const [pernyataan] = await db
		.select({
			hubunganA: spt_pph_badan_lampiran_10b_pernyataan.hubunganA,
			hubunganB: spt_pph_badan_lampiran_10b_pernyataan.hubunganB,
			hubunganC: spt_pph_badan_lampiran_10b_pernyataan.hubunganC,
			hubunganD: spt_pph_badan_lampiran_10b_pernyataan.hubunganD,
			transaksiA: spt_pph_badan_lampiran_10b_pernyataan.transaksiA,
			transaksiB: spt_pph_badan_lampiran_10b_pernyataan.transaksiB,
			transaksiC: spt_pph_badan_lampiran_10b_pernyataan.transaksiC,
			dokumentasiA: spt_pph_badan_lampiran_10b_pernyataan.dokumentasiA,
			dokumentasiB: spt_pph_badan_lampiran_10b_pernyataan.dokumentasiB,
			dokumentasiC: spt_pph_badan_lampiran_10b_pernyataan.dokumentasiC,
			dokumentasiD: spt_pph_badan_lampiran_10b_pernyataan.dokumentasiD,
			dokumentasiE: spt_pph_badan_lampiran_10b_pernyataan.dokumentasiE,
			dokumenA: spt_pph_badan_lampiran_10b_pernyataan.dokumenA,
			dokumenB: spt_pph_badan_lampiran_10b_pernyataan.dokumenB,
			dokumenC: spt_pph_badan_lampiran_10b_pernyataan.dokumenC
		})
		.from(spt_pph_badan_lampiran_10b_pernyataan)
		.where(eq(spt_pph_badan_lampiran_10b_pernyataan.sptPphBadanId, sptPphBadanId));

	return {
		hubunganA: pernyataan?.hubunganA ?? null,
		hubunganB: pernyataan?.hubunganB ?? null,
		hubunganC: pernyataan?.hubunganC ?? null,
		hubunganD: pernyataan?.hubunganD ?? null,
		transaksiA: pernyataan?.transaksiA ?? null,
		transaksiB: pernyataan?.transaksiB ?? null,
		transaksiC: pernyataan?.transaksiC ?? null,
		dokumentasiA: pernyataan?.dokumentasiA ?? null,
		dokumentasiB: pernyataan?.dokumentasiB ?? null,
		dokumentasiC: pernyataan?.dokumentasiC ?? null,
		dokumentasiD: pernyataan?.dokumentasiD ?? null,
		dokumentasiE: pernyataan?.dokumentasiE ?? null,
		dokumenA: pernyataan?.dokumenA ?? null,
		dokumenB: pernyataan?.dokumenB ?? null,
		dokumenC: pernyataan?.dokumenC ?? null
	};
}
