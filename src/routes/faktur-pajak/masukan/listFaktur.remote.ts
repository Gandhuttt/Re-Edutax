import { getRequestEvent, query } from '$app/server';
import { db } from '$lib/server/db';
import { faktur_pajak, kode_transaksi_faktur_pajak } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';

export const listFaktur = query(async () => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	const rows = await db
		.select({
			id: faktur_pajak.id,
			npwpPembeli: faktur_pajak.npwpPembeli,
			npwpPenjual: faktur_pajak.npwpPenjual,
			kodeTransaksi: kode_transaksi_faktur_pajak.kode,
			nomorFaktur: faktur_pajak.nomorFaktur,
			masaPajak: faktur_pajak.masaPajak,
			dikreditkan: faktur_pajak.dikreditkan,
			diupload: faktur_pajak.diupload
		})
		.from(faktur_pajak)
		.innerJoin(
			kode_transaksi_faktur_pajak,
			eq(faktur_pajak.kodeTransaksiId, kode_transaksi_faktur_pajak.id)
		)
		.where(and(eq(faktur_pajak.npwpPembeli, activeNpwp), eq(faktur_pajak.diupload, true)));

	return rows;
});
