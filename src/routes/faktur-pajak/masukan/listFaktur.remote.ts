import { getRequestEvent, query } from '$app/server';
import { computeFakturAmounts, computeFakturLineAmounts } from '$lib/helpers/fakturAmounts';
import { db } from '$lib/server/db';
import {
	faktur_pajak,
	jenis_item_transaksi_faktur,
	kode_item_transaksi_faktur,
	kode_transaksi_faktur_pajak,
	retur_faktur_pajak_masukan,
	retur_faktur_pajak_masukan_detail,
	satuan_ukur_transaksi_faktur,
	transaksi_faktur_pajak,
	wajib_pajak
} from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { and, eq, ne } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';

export const listFaktur = query(async () => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;

	if (!activeNpwp) error(401, 'Belum login');

	const penjual = alias(wajib_pajak, 'penjual');
	const invoices = await db
		.select({
			id: faktur_pajak.id,
			npwpPembeli: faktur_pajak.npwpPembeli,
			npwpPenjual: faktur_pajak.npwpPenjual,
			namaPenjual: penjual.nama,
			kodeTransaksi: kode_transaksi_faktur_pajak.kode,
			nomorFaktur: faktur_pajak.nomorFaktur,
			tanggalFaktur: faktur_pajak.tanggalFaktur,
			masaPajak: faktur_pajak.masaPajak,
			tahun: faktur_pajak.tahun,
			uangMuka: faktur_pajak.uangMuka,
			pelunasan: faktur_pajak.pelunasan,
			nilaiUangMuka: faktur_pajak.nilaiUangMuka,
			dikreditkan: faktur_pajak.dikreditkan,
			diupload: faktur_pajak.diupload
		})
		.from(faktur_pajak)
		.innerJoin(
			kode_transaksi_faktur_pajak,
			eq(faktur_pajak.kodeTransaksiId, kode_transaksi_faktur_pajak.id)
		)
		.leftJoin(penjual, eq(faktur_pajak.npwpPenjual, penjual.npwp))
		.where(and(eq(faktur_pajak.npwpPembeli, activeNpwp), eq(faktur_pajak.diupload, true)));

	const invoiceLines = await db
		.select({
			id: transaksi_faktur_pajak.id,
			fakturPajakId: transaksi_faktur_pajak.fakturPajakId,
			tipe: jenis_item_transaksi_faktur.kode,
			nama: transaksi_faktur_pajak.nama,
			kodeItem: kode_item_transaksi_faktur.kode,
			satuanUkur: satuan_ukur_transaksi_faktur.kode,
			kuantitas: transaksi_faktur_pajak.kuantitas,
			hargaSatuan: transaksi_faktur_pajak.hargaSatuan,
			hargaPotongan: transaksi_faktur_pajak.hargaPotongan,
			dppNilaiLain: transaksi_faktur_pajak.dppNilaiLain,
			tarifPpn: transaksi_faktur_pajak.tarifPpn,
			tarifPpnBm: transaksi_faktur_pajak.tarifPpnBm
		})
		.from(transaksi_faktur_pajak)
		.innerJoin(faktur_pajak, eq(faktur_pajak.id, transaksi_faktur_pajak.fakturPajakId))
		.innerJoin(
			kode_item_transaksi_faktur,
			eq(kode_item_transaksi_faktur.id, transaksi_faktur_pajak.kodeItemId)
		)
		.innerJoin(
			jenis_item_transaksi_faktur,
			eq(jenis_item_transaksi_faktur.id, kode_item_transaksi_faktur.jenisItemId)
		)
		.innerJoin(
			satuan_ukur_transaksi_faktur,
			eq(satuan_ukur_transaksi_faktur.id, transaksi_faktur_pajak.satuanUkurId)
		)
		.where(and(eq(faktur_pajak.npwpPembeli, activeNpwp), eq(faktur_pajak.diupload, true)));

	const returns = await db
		.select({
			id: retur_faktur_pajak_masukan.id,
			fakturPajakId: retur_faktur_pajak_masukan.fakturPajakId,
			tanggalRetur: retur_faktur_pajak_masukan.tanggalRetur,
			status: retur_faktur_pajak_masukan.status
		})
		.from(retur_faktur_pajak_masukan)
		.innerJoin(faktur_pajak, eq(faktur_pajak.id, retur_faktur_pajak_masukan.fakturPajakId))
		.where(eq(faktur_pajak.npwpPembeli, activeNpwp));
	const returnedLines = await db
		.select({
			transaksiFakturPajakId: retur_faktur_pajak_masukan_detail.transaksiFakturPajakId,
			jumlahDiretur: retur_faktur_pajak_masukan_detail.jumlahDiretur
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
		.where(
			and(
				eq(faktur_pajak.npwpPembeli, activeNpwp),
				ne(retur_faktur_pajak_masukan.status, 'dibatalkan')
			)
		);

	const returnedQuantityByLine = new Map<string, number>();
	for (const row of returnedLines) {
		returnedQuantityByLine.set(
			row.transaksiFakturPajakId,
			(returnedQuantityByLine.get(row.transaksiFakturPajakId) ?? 0) + row.jumlahDiretur
		);
	}

	return invoices.map((invoice) => {
		const lines = invoiceLines.filter((line) => line.fakturPajakId === invoice.id);
		const { gross, taxable } = computeFakturAmounts(lines, invoice);
		const paymentFactor = gross.dpp > 0 ? taxable.dpp / gross.dpp : 1;
		const invoiceReturns = returns.filter((row) => row.fakturPajakId === invoice.id);

		return {
			...invoice,
			totals: taxable,
			transactions: lines.map((line) => {
				const grossLine = computeFakturLineAmounts(line);
				return {
					...line,
					amounts: {
						dpp: Math.round(grossLine.dpp * paymentFactor),
						dppNilaiLain: Math.round(grossLine.dppNilaiLain * paymentFactor),
						ppn: Math.round(grossLine.ppn * paymentFactor),
						ppnbm: Math.round(grossLine.ppnbm * paymentFactor)
					},
					returnedQuantity: returnedQuantityByLine.get(line.id) ?? 0,
					availableQuantity: Math.max(
						0,
						line.kuantitas - (returnedQuantityByLine.get(line.id) ?? 0)
					)
				};
			}),
			returnCount: invoiceReturns.length,
			lastReturnDate: invoiceReturns
				.map((row) => row.tanggalRetur)
				.sort((left, right) => right.localeCompare(left))[0] ?? null
		};
	});
});
