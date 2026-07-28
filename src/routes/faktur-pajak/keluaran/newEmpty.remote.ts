import { form, getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { faktur_pajak, kode_transaksi_faktur_pajak } from '$lib/server/db/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';

export const newEmpty = form(async () => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	const [kodeTransaksi] = await db
		.select({ id: kode_transaksi_faktur_pajak.id })
		.from(kode_transaksi_faktur_pajak)
		.where(and(eq(kode_transaksi_faktur_pajak.kode, 1), eq(kode_transaksi_faktur_pajak.aktif, true)))
		.limit(1);

	if (!kodeTransaksi) {
		error(500, 'Kode transaksi default belum tersedia');
	}

	const id = crypto.randomUUID();
	const today = new Date();
	const tanggalFaktur = today.toISOString().slice(0, 10);

	await db.insert(faktur_pajak).values({
		id,
		npwpPenjual: activeNpwp,
		npwpPembeli: '',
		kodeTransaksiId: kodeTransaksi.id,
		tanggalFaktur,
		masaPajak: today.getMonth() + 1,
		tahun: today.getFullYear()
	});

	redirect(303, `/faktur-pajak/${id}`);
});
