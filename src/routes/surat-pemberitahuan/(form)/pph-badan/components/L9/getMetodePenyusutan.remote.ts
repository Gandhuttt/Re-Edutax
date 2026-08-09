import { prerender } from '$app/server';
import { db } from '$lib/server/db';
import { metode_penyusutan_spt_pph_badan } from '$lib/server/db/schema';
import { asc, eq } from 'drizzle-orm';

export const getMetodePenyusutan = prerender(async () => {
	const rows = await db
		.select({
			id: metode_penyusutan_spt_pph_badan.id,
			kode: metode_penyusutan_spt_pph_badan.kode,
			nama: metode_penyusutan_spt_pph_badan.nama,
			jenis: metode_penyusutan_spt_pph_badan.jenis
		})
		.from(metode_penyusutan_spt_pph_badan)
		.where(eq(metode_penyusutan_spt_pph_badan.aktif, true))
		.orderBy(asc(metode_penyusutan_spt_pph_badan.nomorUrut));

	return rows.map((row) => ({
		id: row.id,
		value: row.kode,
		label: row.nama,
		jenis: row.jenis
	}));
});
