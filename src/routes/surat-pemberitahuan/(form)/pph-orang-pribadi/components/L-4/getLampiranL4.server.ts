import { db } from '$lib/server/db';
import { spt_pph_orang_pribadi_lampiran_4 } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

// Bagian A and B, flat one-row-per-SPT scalar form (see lampiran_4.ts). Only
// the manual-input columns are loaded; the derived fields for both sections
// are computed client-side from these via hitungLampiranL4 /
// hitungLampiranL4SectionB.
export async function getLampiranL4(sptId: string) {
	const row = await db
		.select()
		.from(spt_pph_orang_pribadi_lampiran_4)
		.where(eq(spt_pph_orang_pribadi_lampiran_4.sptPphOrangPribadiId, sptId))
		.limit(1)
		.then((rows) => rows[0] ?? null);

	return {
		penghasilanNeto: row?.penghasilanNeto ?? 0,
		kompensasiKerugian: row?.kompensasiKerugian ?? 0,
		zakatSumbangan: row?.zakatSumbangan ?? 0,
		ptkpStatus: row?.ptkpStatus ?? '',
		pengurangPphTerutang: row?.pengurangPphTerutang ?? 0,
		kreditPajak: row?.kreditPajak ?? 0,
		brutoWp: row?.brutoWp ?? 0,
		brutoSuamiIstri: row?.brutoSuamiIstri ?? 0,
		netoSuamiIstri: row?.netoSuamiIstri ?? 0,
		setelahDikurangiSuamiIstri: row?.setelahDikurangiSuamiIstri ?? 0,
		ptkpGabunganStatus: row?.ptkpGabunganStatus ?? '',
		namaSuamiIstri: row?.namaSuamiIstri ?? ''
	};
}
