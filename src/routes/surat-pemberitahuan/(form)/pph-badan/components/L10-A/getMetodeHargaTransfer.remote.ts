import { prerender } from '$app/server';
import { db } from '$lib/server/db';
import { metode_penentuan_harga_transfer_spt_pph_badan } from '$lib/server/db/schema';
import { asc, eq } from 'drizzle-orm';

export const getMetodeHargaTransfer = prerender(async () => {
	const rows = await db
		.select({
			id: metode_penentuan_harga_transfer_spt_pph_badan.id,
			kode: metode_penentuan_harga_transfer_spt_pph_badan.kode,
			nama: metode_penentuan_harga_transfer_spt_pph_badan.nama
		})
		.from(metode_penentuan_harga_transfer_spt_pph_badan)
		.where(eq(metode_penentuan_harga_transfer_spt_pph_badan.aktif, true))
		.orderBy(asc(metode_penentuan_harga_transfer_spt_pph_badan.nomorUrut));

	return rows.map((row) => ({ id: row.id, value: row.kode, label: row.nama }));
}, { dynamic: true });
