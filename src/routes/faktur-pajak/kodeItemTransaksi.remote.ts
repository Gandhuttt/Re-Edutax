import { prerender } from '$app/server';
import { db } from '$lib/server/db';
import { jenis_item_transaksi_faktur, kode_item_transaksi_faktur } from '$lib/server/db/schema';
import { and, asc, eq } from 'drizzle-orm';

export const getKodeItemTransaksiFaktur = prerender(async () => {
	const rows = await db
		.select({
			id: kode_item_transaksi_faktur.id,
			jenisItemKode: jenis_item_transaksi_faktur.kode,
			kode: kode_item_transaksi_faktur.kode,
			namaIndonesia: kode_item_transaksi_faktur.namaIndonesia,
			namaInggris: kode_item_transaksi_faktur.namaInggris
		})
		.from(kode_item_transaksi_faktur)
		.innerJoin(
			jenis_item_transaksi_faktur,
			eq(kode_item_transaksi_faktur.jenisItemId, jenis_item_transaksi_faktur.id)
		)
		.where(and(eq(kode_item_transaksi_faktur.aktif, true), eq(jenis_item_transaksi_faktur.aktif, true)))
		.orderBy(asc(kode_item_transaksi_faktur.kode));

	return rows.map((row) => ({
		id: row.id,
		tipe: (row.jenisItemKode === 'jasa' ? 'Jasa' : 'Barang') as 'Jasa' | 'Barang',
		kodeItem: row.kode,
		labelIndonesia: row.namaIndonesia,
		labelInggris: row.namaInggris ?? ''
	}));
}, { dynamic: true });
