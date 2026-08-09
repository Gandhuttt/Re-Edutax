import { db } from '$lib/server/db';
import { spt_pph_badan_lampiran_6_komponen } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { L6_KODE } from './saveLampiranL6.server';

export async function getLampiranL6(sptPphBadanId: string) {
	const komponen = await db
		.select({
			kode: spt_pph_badan_lampiran_6_komponen.kode,
			nilai: spt_pph_badan_lampiran_6_komponen.nilai
		})
		.from(spt_pph_badan_lampiran_6_komponen)
		.where(eq(spt_pph_badan_lampiran_6_komponen.sptPphBadanId, sptPphBadanId));

	const nilaiByKode = new Map(komponen.map((row) => [row.kode, row.nilai]));

	return {
		dasarAngsuran: nilaiByKode.get(L6_KODE.DASAR_ANGSURAN) ?? 0,
		kompensasiKerugian: nilaiByKode.get(L6_KODE.KOMPENSASI_KERUGIAN) ?? 0,
		penghasilanKenaPajak: nilaiByKode.get(L6_KODE.PENGHASILAN_KENA_PAJAK) ?? 0,
		pphTerutang: nilaiByKode.get(L6_KODE.PPH_TERUTANG) ?? 0,
		kreditPajakTahunLalu: nilaiByKode.get(L6_KODE.KREDIT_PAJAK_TAHUN_LALU) ?? 0,
		pphDibayarSendiri: nilaiByKode.get(L6_KODE.PPH_DIBAYAR_SENDIRI) ?? 0,
		angsuranPph25: nilaiByKode.get(L6_KODE.ANGSURAN_PPH_25) ?? 0
	};
}
