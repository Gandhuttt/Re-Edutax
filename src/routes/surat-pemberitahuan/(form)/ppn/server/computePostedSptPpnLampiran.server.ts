import { db } from '$lib/server/db';
import {
	faktur_pajak,
	kode_transaksi_faktur_pajak,
	transaksi_faktur_pajak,
	wajib_pajak
} from '$lib/server/db/schema';
import { alias } from 'drizzle-orm/sqlite-core';
import { and, eq, or } from 'drizzle-orm';
import { computeFakturLineAmounts } from './computeFakturLineAmounts';

type LampiranRow = {
	fakturPajakId: string;
	npwpLawanTransaksi: string;
	namaLawanTransaksi: string | null;
	nomorFaktur: string;
	tanggalFaktur: string;
	kodeTransaksi: number;
	hargaJual: number;
	dppNilaiLain: number;
	ppn: number;
	ppnbm: number;
};

type LampiranCRow = {
	fakturPajakId: string;
	npwpPenjual: string;
	namaPenjual: string | null;
	npwpPembeli: string;
	namaPembeli: string | null;
	nomorFaktur: string;
	tanggalFaktur: string;
	kodeTransaksi: number;
	hargaJual: number;
	dppNilaiLain: number;
	ppn: number;
	ppnbm: number;
};

// Snapshots A-2 (domestic output, kode 1/9/10), B-2 (domestic input, kode
// 1/9/10) and C (Pemungut PPN, kode 2/3) as one row per faktur_pajak, for
// persisting at "Posting SPT" time -- mirrors computePostedSptPpnFields, but
// grouped by invoice instead of by running kode-transaksi bucket total.
export async function computePostedSptPpnLampiran({
	npwp,
	periodeBulan,
	periodeTahun
}: {
	npwp: string;
	periodeBulan: number;
	periodeTahun: number;
}) {
	const penjual = alias(wajib_pajak, 'penjual');
	const pembeli = alias(wajib_pajak, 'pembeli');

	const rows = await db
		.select({
			fakturPajakId: faktur_pajak.id,
			npwpPenjual: faktur_pajak.npwpPenjual,
			npwpPembeli: faktur_pajak.npwpPembeli,
			namaPenjual: penjual.nama,
			namaPembeli: pembeli.nama,
			dikreditkan: faktur_pajak.dikreditkan,
			nomorFaktur: faktur_pajak.nomorFaktur,
			tanggalFaktur: faktur_pajak.tanggalFaktur,
			kodeTransaksi: kode_transaksi_faktur_pajak.kode,
			kuantitas: transaksi_faktur_pajak.kuantitas,
			hargaSatuan: transaksi_faktur_pajak.hargaSatuan,
			hargaPotongan: transaksi_faktur_pajak.hargaPotongan,
			dppNilaiLain: transaksi_faktur_pajak.dppNilaiLain,
			tarifPpn: transaksi_faktur_pajak.tarifPpn,
			tarifPpnBm: transaksi_faktur_pajak.tarifPpnBm
		})
		.from(faktur_pajak)
		.innerJoin(transaksi_faktur_pajak, eq(transaksi_faktur_pajak.fakturPajakId, faktur_pajak.id))
		.innerJoin(
			kode_transaksi_faktur_pajak,
			eq(faktur_pajak.kodeTransaksiId, kode_transaksi_faktur_pajak.id)
		)
		.leftJoin(penjual, eq(penjual.npwp, faktur_pajak.npwpPenjual))
		.leftJoin(pembeli, eq(pembeli.npwp, faktur_pajak.npwpPembeli))
		.where(
			and(
				eq(faktur_pajak.diupload, true),
				or(
					eq(faktur_pajak.npwpPenjual, npwp),
					and(eq(faktur_pajak.npwpPembeli, npwp), eq(faktur_pajak.dikreditkan, true))
				),
				eq(faktur_pajak.masaPajak, periodeBulan),
				eq(faktur_pajak.tahun, periodeTahun)
			)
		);

	const invoices = new Map<string, (typeof rows)[number] & { amounts: ReturnType<typeof computeFakturLineAmounts> }>();

	for (const row of rows) {
		const amounts = computeFakturLineAmounts(row);
		const existing = invoices.get(row.fakturPajakId);

		if (existing) {
			existing.amounts.dpp += amounts.dpp;
			existing.amounts.dppNilaiLain += amounts.dppNilaiLain;
			existing.amounts.ppn += amounts.ppn;
			existing.amounts.ppnbm += amounts.ppnbm;
		} else {
			invoices.set(row.fakturPajakId, { ...row, amounts });
		}
	}

	const a2: LampiranRow[] = [];
	const b2: LampiranRow[] = [];
	const c: LampiranCRow[] = [];

	for (const invoice of invoices.values()) {
		const isSeller = invoice.npwpPenjual === npwp;
		const isCreditedBuyer = invoice.npwpPembeli === npwp && invoice.dikreditkan;

		if ([1, 9, 10].includes(invoice.kodeTransaksi) && isSeller) {
			a2.push({
				fakturPajakId: invoice.fakturPajakId,
				npwpLawanTransaksi: invoice.npwpPembeli ?? '',
				namaLawanTransaksi: invoice.namaPembeli,
				nomorFaktur: invoice.nomorFaktur ?? '',
				tanggalFaktur: invoice.tanggalFaktur,
				kodeTransaksi: invoice.kodeTransaksi,
				hargaJual: invoice.amounts.dpp,
				dppNilaiLain: invoice.amounts.dppNilaiLain,
				ppn: invoice.amounts.ppn,
				ppnbm: invoice.amounts.ppnbm
			});
		}

		if ([1, 9, 10].includes(invoice.kodeTransaksi) && isCreditedBuyer) {
			b2.push({
				fakturPajakId: invoice.fakturPajakId,
				npwpLawanTransaksi: invoice.npwpPenjual,
				namaLawanTransaksi: invoice.namaPenjual,
				nomorFaktur: invoice.nomorFaktur ?? '',
				tanggalFaktur: invoice.tanggalFaktur,
				kodeTransaksi: invoice.kodeTransaksi,
				hargaJual: invoice.amounts.dpp,
				dppNilaiLain: invoice.amounts.dppNilaiLain,
				ppn: invoice.amounts.ppn,
				ppnbm: invoice.amounts.ppnbm
			});
		}

		if ([2, 3].includes(invoice.kodeTransaksi) && (isSeller || isCreditedBuyer)) {
			c.push({
				fakturPajakId: invoice.fakturPajakId,
				npwpPenjual: invoice.npwpPenjual,
				namaPenjual: invoice.namaPenjual,
				npwpPembeli: invoice.npwpPembeli ?? '',
				namaPembeli: invoice.namaPembeli,
				nomorFaktur: invoice.nomorFaktur ?? '',
				tanggalFaktur: invoice.tanggalFaktur,
				kodeTransaksi: invoice.kodeTransaksi,
				hargaJual: invoice.amounts.dpp,
				dppNilaiLain: invoice.amounts.dppNilaiLain,
				ppn: invoice.amounts.ppn,
				ppnbm: invoice.amounts.ppnbm
			});
		}
	}

	return { a2, b2, c };
}
