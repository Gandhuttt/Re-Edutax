import { prerender } from '$app/server';
import { db } from '$lib/server/db';
import { jenis_dokumen_ebupot } from '$lib/server/db/schema';
import { asc, eq } from 'drizzle-orm';

export const getJenisDokumenEbupot = prerender(
	async () => {
		const rows = await db
			.select()
			.from(jenis_dokumen_ebupot)
			.where(eq(jenis_dokumen_ebupot.aktif, true))
			.orderBy(asc(jenis_dokumen_ebupot.nama));

		return rows;
	},
	{ dynamic: true }
);
