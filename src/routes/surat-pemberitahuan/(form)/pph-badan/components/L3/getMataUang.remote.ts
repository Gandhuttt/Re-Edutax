import { prerender } from '$app/server';
import { db } from '$lib/server/db';
import { mata_uang_spt_pph_badan } from '$lib/server/db/schema';
import { asc, eq } from 'drizzle-orm';

export const getMataUang = prerender(async () => {
	const rows = await db
		.select({
			id: mata_uang_spt_pph_badan.id,
			kode: mata_uang_spt_pph_badan.kode,
			nama: mata_uang_spt_pph_badan.nama
		})
		.from(mata_uang_spt_pph_badan)
		.where(eq(mata_uang_spt_pph_badan.aktif, true))
		.orderBy(asc(mata_uang_spt_pph_badan.nama));

	return rows.map((row) => ({
		id: row.id,
		value: row.kode,
		label: row.nama
	}));
}, { dynamic: true });
