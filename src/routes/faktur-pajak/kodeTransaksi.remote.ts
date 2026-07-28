import { prerender } from '$app/server';
import { db } from '$lib/server/db';
import { kode_transaksi_faktur_pajak } from '$lib/server/db/schema';
import { asc, eq } from 'drizzle-orm';

export const getKodeTransaksiFaktur = prerender(async () => {
	const rows = await db
		.select()
		.from(kode_transaksi_faktur_pajak)
		.where(eq(kode_transaksi_faktur_pajak.aktif, true))
		.orderBy(asc(kode_transaksi_faktur_pajak.kode));

	return rows.map((row) => ({
		id: row.id,
		key: row.kode,
		value: row.nama
	}));
});
