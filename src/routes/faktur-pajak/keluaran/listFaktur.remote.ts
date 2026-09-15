import { getRequestEvent, query } from '$app/server';
import { db } from '$lib/server/db';
import {
	faktur_pajak,
	kode_transaksi_faktur_pajak,
	transaksi_faktur_pajak,
	wajib_pajak
} from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { eq, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';

export const listFaktur = query(async () => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	const pembeli = alias(wajib_pajak, 'pembeli');
	const dppPerItem = sql<number>`max(
		0,
		${transaksi_faktur_pajak.kuantitas} * ${transaksi_faktur_pajak.hargaSatuan}
			- ${transaksi_faktur_pajak.hargaPotongan}
	)`;

	const rows = await db
		.select({
			id: faktur_pajak.id,
			npwpPembeli: faktur_pajak.npwpPembeli,
			namaPembeli: sql<string>`coalesce(${pembeli.nama}, '')`,
			npwpPenjual: faktur_pajak.npwpPenjual,
			kodeTransaksi: kode_transaksi_faktur_pajak.kode,
			nomorFaktur: faktur_pajak.nomorFaktur,
			tanggalFaktur: faktur_pajak.tanggalFaktur,
			masaPajak: faktur_pajak.masaPajak,
			tahun: faktur_pajak.tahun,
			referensi: faktur_pajak.referensi,
			dpp: sql<number>`coalesce(sum(${dppPerItem}), 0)`.mapWith(Number),
			dppNilaiLain:
				sql<number>`coalesce(sum(${transaksi_faktur_pajak.dppNilaiLain}), 0)`.mapWith(Number),
			ppn: sql<number>`coalesce(
				sum(
					round(
						(case
							when ${transaksi_faktur_pajak.dppNilaiLain} > 0
								then ${transaksi_faktur_pajak.dppNilaiLain}
							else ${dppPerItem}
						end) * ${transaksi_faktur_pajak.tarifPpn} / 100.0
					)
				),
				0
			)`.mapWith(Number),
			ppnbm: sql<number>`coalesce(
				sum(
					round(
						${dppPerItem} * ${transaksi_faktur_pajak.tarifPpnBm} / 100.0
					)
				),
				0
			)`.mapWith(Number),
			dikreditkan: faktur_pajak.dikreditkan,
			diupload: faktur_pajak.diupload
		})
		.from(faktur_pajak)
		.innerJoin(
			kode_transaksi_faktur_pajak,
			eq(faktur_pajak.kodeTransaksiId, kode_transaksi_faktur_pajak.id)
		)
		.leftJoin(
			transaksi_faktur_pajak,
			eq(faktur_pajak.id, transaksi_faktur_pajak.fakturPajakId)
		)
		.leftJoin(pembeli, eq(faktur_pajak.npwpPembeli, pembeli.npwp))
		.where(eq(faktur_pajak.npwpPenjual, activeNpwp))
		.groupBy(
			faktur_pajak.id,
			faktur_pajak.npwpPembeli,
			pembeli.nama,
			faktur_pajak.npwpPenjual,
			kode_transaksi_faktur_pajak.kode,
			faktur_pajak.nomorFaktur,
			faktur_pajak.tanggalFaktur,
			faktur_pajak.masaPajak,
			faktur_pajak.tahun,
			faktur_pajak.referensi,
			faktur_pajak.dikreditkan,
			faktur_pajak.diupload
		);

	return rows;
});
