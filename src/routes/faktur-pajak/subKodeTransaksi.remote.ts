import { prerender } from '$app/server';
import { db } from '$lib/server/db';
import { sub_kode_transaksi_faktur_pajak } from '$lib/server/db/schema';
import { asc, eq } from 'drizzle-orm';

export const getSubKodeTransaksiFaktur = prerender(async () => {
	return db
		.select()
		.from(sub_kode_transaksi_faktur_pajak)
		.where(eq(sub_kode_transaksi_faktur_pajak.aktif, true))
		.orderBy(asc(sub_kode_transaksi_faktur_pajak.kode));
});
