import { prerender } from '$app/server';
import { db } from '$lib/server/db';
import { jenis_item_transaksi_faktur, satuan_ukur_transaksi_faktur } from '$lib/server/db/schema';
import { asc, eq } from 'drizzle-orm';

export const getSatuanUkurTransaksiFaktur = prerender(async () => {
	const rows = await db
		.select({
			id: satuan_ukur_transaksi_faktur.id,
			jenisItemId: satuan_ukur_transaksi_faktur.jenisItemId,
			jenisItemKode: jenis_item_transaksi_faktur.kode,
			kode: satuan_ukur_transaksi_faktur.kode,
			nama: satuan_ukur_transaksi_faktur.nama
		})
		.from(satuan_ukur_transaksi_faktur)
		.leftJoin(
			jenis_item_transaksi_faktur,
			eq(satuan_ukur_transaksi_faktur.jenisItemId, jenis_item_transaksi_faktur.id)
		)
		.where(eq(satuan_ukur_transaksi_faktur.aktif, true))
		.orderBy(asc(satuan_ukur_transaksi_faktur.kode));

	return rows.map((row) => ({
		id: row.id,
		jenisItemId: row.jenisItemId,
		tipe: row.jenisItemKode === 'jasa' ? 1 : 0,
		index: row.kode,
		label: row.nama
	}));
}, { dynamic: true });
