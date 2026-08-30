import { prerender } from '$app/server';
import { db } from '$lib/server/db';
import { kode_objek_pajak_pph } from '$lib/server/db/schema';
import { and, asc, eq } from 'drizzle-orm';

export const getObjekPajakBpa1 = prerender(
	async () => {
		const rows = await db
			.select()
			.from(kode_objek_pajak_pph)
			.where(and(eq(kode_objek_pajak_pph.jenisBuktiPotong, 'bpa1'), eq(kode_objek_pajak_pph.aktif, true)))
			.orderBy(asc(kode_objek_pajak_pph.kode));

		return rows;
	},
	{ dynamic: true }
);
