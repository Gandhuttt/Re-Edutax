import { prerender } from '$app/server';
import { db } from '$lib/server/db';
import { jenis_harta_spt_pph_badan } from '$lib/server/db/schema';
import { asc, eq } from 'drizzle-orm';

export const getJenisHarta = prerender(async () => {
	const rows = await db
		.select({
			id: jenis_harta_spt_pph_badan.id,
			kode: jenis_harta_spt_pph_badan.kode,
			nama: jenis_harta_spt_pph_badan.nama,
			kelompok: jenis_harta_spt_pph_badan.kelompok
		})
		.from(jenis_harta_spt_pph_badan)
		.where(eq(jenis_harta_spt_pph_badan.aktif, true))
		.orderBy(asc(jenis_harta_spt_pph_badan.nama));

	return rows.map((row) => ({
		id: row.id,
		value: row.kode,
		label: row.nama,
		kelompok: row.kelompok
	}));
}, { dynamic: true });
