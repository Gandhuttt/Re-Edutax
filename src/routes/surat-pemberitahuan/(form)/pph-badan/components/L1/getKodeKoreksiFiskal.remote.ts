import { prerender } from '$app/server';
import { db } from '$lib/server/db';
import { kode_koreksi_fiskal_spt_pph_badan } from '$lib/server/db/schema';
import { asc, eq } from 'drizzle-orm';

export const getKodeKoreksiFiskal = prerender(async () => {
	const rows = await db
		.select({
			kode: kode_koreksi_fiskal_spt_pph_badan.kode,
			nama: kode_koreksi_fiskal_spt_pph_badan.nama,
			jenis: kode_koreksi_fiskal_spt_pph_badan.jenis
		})
		.from(kode_koreksi_fiskal_spt_pph_badan)
		.where(eq(kode_koreksi_fiskal_spt_pph_badan.aktif, true))
		.orderBy(asc(kode_koreksi_fiskal_spt_pph_badan.jenis), asc(kode_koreksi_fiskal_spt_pph_badan.kode));

	return rows.map((row) => ({
		value: row.kode,
		label: row.nama,
		group: row.jenis === 'positif' ? 'Penyesuaian Fiskal Positif' : 'Penyesuaian Fiskal Negatif'
	}));
});
