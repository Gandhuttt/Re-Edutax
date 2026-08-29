import { prerender } from '$app/server';
import { db } from '$lib/server/db';
import { fasilitas_pajak_ebupot } from '$lib/server/db/schema';
import { asc, eq } from 'drizzle-orm';

export const getFasilitasPajak = prerender(
	async () => {
		const rows = await db
			.select()
			.from(fasilitas_pajak_ebupot)
			.where(eq(fasilitas_pajak_ebupot.aktif, true))
			.orderBy(asc(fasilitas_pajak_ebupot.kode));

		return rows;
	},
	{ dynamic: true }
);
