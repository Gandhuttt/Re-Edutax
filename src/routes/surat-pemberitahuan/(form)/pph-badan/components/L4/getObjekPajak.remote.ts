import { prerender } from '$app/server';
import { db } from '$lib/server/db';
import { objek_pajak_spt_pph_badan } from '$lib/server/db/schema';
import { asc, eq } from 'drizzle-orm';

export const getObjekPajak = prerender(async () => {
	const rows = await db
		.select({
			id: objek_pajak_spt_pph_badan.id,
			kode: objek_pajak_spt_pph_badan.kode,
			nama: objek_pajak_spt_pph_badan.nama
		})
		.from(objek_pajak_spt_pph_badan)
		.where(eq(objek_pajak_spt_pph_badan.aktif, true))
		.orderBy(asc(objek_pajak_spt_pph_badan.nomorUrut));

	return rows.map((row) => ({
		id: row.id,
		value: row.kode,
		label: row.nama
	}));
}, { dynamic: true });
