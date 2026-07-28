import { prerender } from '$app/server';
import { db } from '$lib/server/db';
import { jenis_item_transaksi_faktur } from '$lib/server/db/schema';
import { asc, eq } from 'drizzle-orm';

export const getJenisItemTransaksiFaktur = prerender(async () => {
	return db
		.select()
		.from(jenis_item_transaksi_faktur)
		.where(eq(jenis_item_transaksi_faktur.aktif, true))
		.orderBy(asc(jenis_item_transaksi_faktur.kode));
});
