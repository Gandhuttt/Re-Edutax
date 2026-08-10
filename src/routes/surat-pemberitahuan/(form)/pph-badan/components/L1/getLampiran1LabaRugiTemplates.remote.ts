import { prerender } from '$app/server';
import { db } from '$lib/server/db';
import { sektor_usaha_spt_pph_badan, spt_pph_badan_lampiran_1_akun } from '$lib/server/db/schema';
import { asc, eq } from 'drizzle-orm';

export const getLampiran1LabaRugiTemplates = prerender(async () => {
	const rows = await db
		.select({
			id: spt_pph_badan_lampiran_1_akun.id,
			nomorUrut: spt_pph_badan_lampiran_1_akun.nomorUrut,
			kode: spt_pph_badan_lampiran_1_akun.kode,
			namaAkun: spt_pph_badan_lampiran_1_akun.namaAkun,
			rowType: spt_pph_badan_lampiran_1_akun.rowType,
			classification: spt_pph_badan_lampiran_1_akun.classification,
			parentKode: spt_pph_badan_lampiran_1_akun.parentKode,
			sign: spt_pph_badan_lampiran_1_akun.sign,
			sektorUsahaKode: sektor_usaha_spt_pph_badan.kode,
			lampiranKode: sektor_usaha_spt_pph_badan.lampiran1Kode
		})
		.from(spt_pph_badan_lampiran_1_akun)
		.innerJoin(
			sektor_usaha_spt_pph_badan,
			eq(spt_pph_badan_lampiran_1_akun.sektorUsahaId, sektor_usaha_spt_pph_badan.id)
		)
		.orderBy(asc(spt_pph_badan_lampiran_1_akun.nomorUrut));

	return rows;
}, { dynamic: true });
