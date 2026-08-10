import { prerender } from '$app/server';
import { db } from '$lib/server/db';
import { sektor_usaha_spt_pph_badan } from '$lib/server/db/schema';
import { asc, eq } from 'drizzle-orm';

export const getSektorUsaha = prerender(async () => {
	const rows = await db
		.select({
			id: sektor_usaha_spt_pph_badan.id,
			kode: sektor_usaha_spt_pph_badan.kode,
			nama: sektor_usaha_spt_pph_badan.nama
		})
		.from(sektor_usaha_spt_pph_badan)
		.where(eq(sektor_usaha_spt_pph_badan.aktif, true))
		.orderBy(asc(sektor_usaha_spt_pph_badan.kode));

	return rows.map((row) => ({
		id: row.id,
		value: row.kode,
		label: row.nama
	}));
}, { dynamic: true });
