import { getRequestEvent, query } from '$app/server';
import { db } from '$lib/server/db';
import {
	faktur_pajak,
	retur_faktur_pajak_masukan,
	retur_faktur_pajak_masukan_detail,
	wajib_pajak
} from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';

export const listReturFakturMasukan = query(async () => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;
	if (!activeNpwp) error(401, 'Belum login');

	const penjual = alias(wajib_pajak, 'penjual');
	const records = await db
		.select({
			id: retur_faktur_pajak_masukan.id,
			fakturPajakId: retur_faktur_pajak_masukan.fakturPajakId,
			nomorRetur: retur_faktur_pajak_masukan.nomorRetur,
			tanggalRetur: retur_faktur_pajak_masukan.tanggalRetur,
			masaPajak: retur_faktur_pajak_masukan.masaPajak,
			tahun: retur_faktur_pajak_masukan.tahun,
			status: retur_faktur_pajak_masukan.status,
			nomorFaktur: faktur_pajak.nomorFaktur,
			dikreditkan: faktur_pajak.dikreditkan,
			npwpPenjual: faktur_pajak.npwpPenjual,
			namaPenjual: penjual.nama
		})
		.from(retur_faktur_pajak_masukan)
		.innerJoin(faktur_pajak, eq(faktur_pajak.id, retur_faktur_pajak_masukan.fakturPajakId))
		.leftJoin(penjual, eq(penjual.npwp, faktur_pajak.npwpPenjual))
		.where(eq(faktur_pajak.npwpPembeli, activeNpwp));

	const details = await db
		.select({
			returnId: retur_faktur_pajak_masukan_detail.returFakturPajakMasukanId,
			dpp: retur_faktur_pajak_masukan_detail.dppDiretur,
			dppNilaiLain: retur_faktur_pajak_masukan_detail.dppNilaiLainDiretur,
			ppn: retur_faktur_pajak_masukan_detail.ppnDiretur,
			ppnbm: retur_faktur_pajak_masukan_detail.ppnbmDiretur
		})
		.from(retur_faktur_pajak_masukan_detail)
		.innerJoin(
			retur_faktur_pajak_masukan,
			eq(
				retur_faktur_pajak_masukan.id,
				retur_faktur_pajak_masukan_detail.returFakturPajakMasukanId
			)
		)
		.innerJoin(faktur_pajak, eq(faktur_pajak.id, retur_faktur_pajak_masukan.fakturPajakId))
		.where(eq(faktur_pajak.npwpPembeli, activeNpwp));

	return records.map((record) => ({
		...record,
		totals: details
			.filter((detail) => detail.returnId === record.id)
			.reduce(
				(total, detail) => ({
					dpp: total.dpp + detail.dpp,
					dppNilaiLain: total.dppNilaiLain + detail.dppNilaiLain,
					ppn: total.ppn + detail.ppn,
					ppnbm: total.ppnbm + detail.ppnbm
				}),
				{ dpp: 0, dppNilaiLain: 0, ppn: 0, ppnbm: 0 }
			)
	}));
});
