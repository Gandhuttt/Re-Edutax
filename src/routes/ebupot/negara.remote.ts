import { prerender } from '$app/server';
import { db } from '$lib/server/db';
import { negara_spt_pph_badan } from '$lib/server/db/schema';
import { asc, eq } from 'drizzle-orm';

// Reuses the country reference list already seeded for SPT PPh Badan
// Lampiran III.A/10A/10C -- it's a generic country list (255 rows), not
// actually SPT-Badan-specific data, so BP26's Negara Asal draws from the
// same table rather than duplicating it. See
// src/routes/surat-pemberitahuan/(form)/pph-badan/components/L2/getNegara.remote.ts
// for the identical pattern this mirrors.
export const getNegara = prerender(
	async () => {
		const rows = await db
			.select({
				id: negara_spt_pph_badan.id,
				kode: negara_spt_pph_badan.kode,
				nama: negara_spt_pph_badan.nama
			})
			.from(negara_spt_pph_badan)
			.where(eq(negara_spt_pph_badan.aktif, true))
			.orderBy(asc(negara_spt_pph_badan.nama));

		return rows.map((row) => ({ id: row.id, value: row.kode, label: row.nama }));
	},
	{ dynamic: true }
);
