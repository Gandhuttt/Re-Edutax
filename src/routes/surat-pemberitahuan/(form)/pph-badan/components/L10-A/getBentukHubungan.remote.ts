import { prerender } from '$app/server';
import { db } from '$lib/server/db';
import { bentuk_hubungan_istimewa_spt_pph_badan } from '$lib/server/db/schema';
import { asc, eq } from 'drizzle-orm';

export const getBentukHubungan = prerender(async () => {
	const rows = await db
		.select({
			id: bentuk_hubungan_istimewa_spt_pph_badan.id,
			kode: bentuk_hubungan_istimewa_spt_pph_badan.kode,
			nama: bentuk_hubungan_istimewa_spt_pph_badan.nama
		})
		.from(bentuk_hubungan_istimewa_spt_pph_badan)
		.where(eq(bentuk_hubungan_istimewa_spt_pph_badan.aktif, true))
		.orderBy(asc(bentuk_hubungan_istimewa_spt_pph_badan.nomorUrut));

	return rows.map((row) => ({ id: row.id, value: row.kode, label: row.nama }));
}, { dynamic: true });
