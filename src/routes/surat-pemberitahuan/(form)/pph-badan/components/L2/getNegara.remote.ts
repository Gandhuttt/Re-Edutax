import { prerender } from '$app/server';
import { db } from '$lib/server/db';
import { negara_spt_pph_badan } from '$lib/server/db/schema';
import { asc, eq } from 'drizzle-orm';

export const getNegara = prerender(async () => {
	const rows = await db
		.select({
			id: negara_spt_pph_badan.id,
			kode: negara_spt_pph_badan.kode,
			nama: negara_spt_pph_badan.nama
		})
		.from(negara_spt_pph_badan)
		.where(eq(negara_spt_pph_badan.aktif, true))
		.orderBy(asc(negara_spt_pph_badan.nama));

	return rows.map((row) => ({
		id: row.id,
		value: row.kode,
		label: row.nama
	}));
}, { dynamic: true });
