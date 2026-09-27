import { computeFakturAmounts, type FakturAmounts } from '$lib/helpers/fakturAmounts';
import { db } from '$lib/server/db';
import {
	faktur_pajak,
	kode_transaksi_faktur_pajak,
	retur_faktur_pajak_masukan,
	retur_faktur_pajak_masukan_detail,
	spt_ppn_retail_invoice,
	transaksi_faktur_pajak
} from '$lib/server/db/schema';
import { and, eq, or } from 'drizzle-orm';

// Recomputes every induk field that is derived from posted faktur_pajak data
// (sections I, II and the top rows of III). Fields the user can edit by hand
// (III.H, IV, V.., IX, X) are left untouched by the caller, since this only
// returns the columns it actually recomputes.
export async function computePostedSptPpnFields({
	npwp,
	periodeBulan,
	periodeTahun
}: {
	npwp: string;
	periodeBulan: number;
	periodeTahun: number;
}) {
	const allTransactions = await db
		.select({
			fakturPajakId: faktur_pajak.id,
			kodeTransaksi: kode_transaksi_faktur_pajak.kode,
			npwpPenjual: faktur_pajak.npwpPenjual,
			npwpPembeli: faktur_pajak.npwpPembeli,
			dikreditkan: faktur_pajak.dikreditkan,
			uangMuka: faktur_pajak.uangMuka,
			pelunasan: faktur_pajak.pelunasan,
			nilaiUangMuka: faktur_pajak.nilaiUangMuka,
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
		.where(
			and(
				eq(faktur_pajak.diupload, true),
				or(
					eq(faktur_pajak.npwpPenjual, npwp),
					eq(faktur_pajak.npwpPembeli, npwp)
				),
				eq(faktur_pajak.masaPajak, periodeBulan),
				eq(faktur_pajak.tahun, periodeTahun)
			)
		);

	const invoiceGroups = new Map<
		string,
		{
			header: (typeof allTransactions)[number];
			lines: Array<{
				kuantitas: number;
				hargaSatuan: number;
				hargaPotongan: number;
				dppNilaiLain: number;
				tarifPpn: number;
				tarifPpnBm: number;
			}>;
		}
	>();
	for (const transaction of allTransactions) {
		const group = invoiceGroups.get(transaction.fakturPajakId) ?? {
			header: transaction,
			lines: []
		};
		group.lines.push(transaction);
		invoiceGroups.set(transaction.fakturPajakId, group);
	}
	const outputInvoices = [...invoiceGroups.values()].filter(
		(invoice) => invoice.header.npwpPenjual === npwp
	);
	const inputInvoices = [...invoiceGroups.values()].filter(
		(invoice) => invoice.header.npwpPembeli === npwp
	);

	const returnRows = await db
		.select({
			kodeTransaksi: kode_transaksi_faktur_pajak.kode,
			npwpPenjual: faktur_pajak.npwpPenjual,
			npwpPembeli: faktur_pajak.npwpPembeli,
			dikreditkan: faktur_pajak.dikreditkan,
			status: retur_faktur_pajak_masukan.status,
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
		.innerJoin(
			kode_transaksi_faktur_pajak,
			eq(kode_transaksi_faktur_pajak.id, faktur_pajak.kodeTransaksiId)
		)
		.where(
			and(
				eq(retur_faktur_pajak_masukan.masaPajak, periodeBulan),
				eq(retur_faktur_pajak_masukan.tahun, periodeTahun),
				eq(retur_faktur_pajak_masukan.status, 'diunggah'),
				or(
					eq(faktur_pajak.npwpPembeli, npwp),
					eq(faktur_pajak.npwpPenjual, npwp)
				)
			)
		);

	const retailInvoices = await db
		.select({
			trxCode: spt_ppn_retail_invoice.trxCode,
			taxBaseSellingPrice: spt_ppn_retail_invoice.taxBaseSellingPrice,
			otherTaxBaseSellingPrice: spt_ppn_retail_invoice.otherTaxBaseSellingPrice,
			vat: spt_ppn_retail_invoice.vat,
			stlg: spt_ppn_retail_invoice.stlg
		})
		.from(spt_ppn_retail_invoice)
		.where(
			and(
				eq(spt_ppn_retail_invoice.npwp, npwp),
				eq(spt_ppn_retail_invoice.masaPajak, periodeBulan),
				eq(spt_ppn_retail_invoice.tahun, periodeTahun)
			)
		);

	const IA2 = createBucket();
	const IA3 = createBucket();
	const IA4 = createBucket();
	const IA5 = createBucket();
	const IA6 = createBucket();
	const IA7 = createBucket();
	const IA8 = createBucket();
	const IA9 = createBucket();
	const IB = createBucket();

	for (const invoice of outputInvoices) {
		const target = getOutputBucket(invoice.header.kodeTransaksi, {
			IA2,
			IA3,
			IA4,
			IA6,
			IA7,
			IA8
		});
		if (target) {
			addAmounts(
				target,
				computeFakturAmounts(invoice.lines, invoice.header).taxable
			);
		}
	}

	for (const row of returnRows) {
		if (row.npwpPenjual !== npwp) continue;
		const target = getOutputBucket(row.kodeTransaksi, { IA2, IA3, IA4, IA6, IA7, IA8 });
		if (target) addAmounts(target, row, -1);
	}

	for (const invoice of retailInvoices) {
		const target =
			invoice.trxCode === 'Normal'
				? IA5
				: invoice.trxCode === '07' || invoice.trxCode === '08'
					? IA9
					: IB;

		target.dpp += invoice.taxBaseSellingPrice;
		target.dppNilaiLain += invoice.otherTaxBaseSellingPrice;
		target.ppn += invoice.vat;
		target.ppnbm += invoice.stlg;
	}

	const IAT = {
		dpp: IA2.dpp + IA3.dpp + IA4.dpp + IA5.dpp + IA6.dpp + IA7.dpp + IA8.dpp + IA9.dpp,
		ppn: IA2.ppn + IA3.ppn + IA4.ppn + IA5.ppn + IA6.ppn + IA7.ppn + IA8.ppn + IA9.ppn,
		ppnbm: IA2.ppnbm + IA3.ppnbm + IA4.ppnbm + IA5.ppnbm + IA6.ppnbm + IA7.ppnbm + IA8.ppnbm + IA9.ppnbm
	};

	const IIB = createBucket();
	const IIC = createBucket();
	const IID = createBucket();
	const IIH = createBucket();

	for (const invoice of inputInvoices) {
		const target = getInputBucket(invoice.header.kodeTransaksi, invoice.header.dikreditkan, {
			IIB,
			IIC,
			IID,
			IIH
		});
		if (target) {
			addAmounts(
				target,
				computeFakturAmounts(invoice.lines, invoice.header).taxable
			);
		}
	}

	for (const row of returnRows) {
		if (row.npwpPembeli !== npwp) continue;
		const target = getInputBucket(row.kodeTransaksi, row.dikreditkan, { IIB, IIC, IID, IIH });
		if (target) addAmounts(target, row, -1);
	}

	const IIG = {
		dpp: IIB.dpp + IIC.dpp + IID.dpp,
		ppn: IIB.ppn + IIC.ppn + IID.ppn
	};

	const IIIA = IA2.ppn + IA3.ppn + IA4.ppn + IA5.ppn;
	const IIIC = IIB.ppn + IIC.ppn + IID.ppn;
	const IIIE = IIIA - IIIC;

	return {
		penyerahan: {
			iA1: 0,
			iA2HargaJual: IA2.dpp,
			iA2DppNilaiLain: IA2.dppNilaiLain,
			iA2Ppn: IA2.ppn,
			iA2Ppnbm: IA2.ppnbm,
			iA3HargaJual: IA3.dpp,
			iA3DppNilaiLain: IA3.dppNilaiLain,
			iA3Ppn: IA3.ppn,
			iA3Ppnbm: IA3.ppnbm,
			iA4HargaJual: IA4.dpp,
			iA4Ppn: IA4.ppn,
			iA4Ppnbm: IA4.ppnbm,
			iA5HargaJual: IA5.dpp,
			iA5DppNilaiLain: IA5.dppNilaiLain,
			iA5Ppn: IA5.ppn,
			iA5Ppnbm: IA5.ppnbm,
			iA6HargaJual: IA6.dpp,
			iA6DppNilaiLain: IA6.dppNilaiLain,
			iA6Ppn: IA6.ppn,
			iA6Ppnbm: IA6.ppnbm,
			iA7HargaJual: IA7.dpp,
			iA7DppNilaiLain: IA7.dppNilaiLain,
			iA7Ppn: IA7.ppn,
			iA7Ppnbm: IA7.ppnbm,
			iA8HargaJual: IA8.dpp,
			iA8DppNilaiLain: IA8.dppNilaiLain,
			iA8Ppn: IA8.ppn,
			iA8Ppnbm: IA8.ppnbm,
			iA9HargaJual: IA9.dpp,
			iA9DppNilaiLain: IA9.dppNilaiLain,
			iA9Ppn: IA9.ppn,
			iA9Ppnbm: IA9.ppnbm,
			iAJumlahHargaJual: IAT.dpp,
			iAJumlahPpn: IAT.ppn,
			iAJumlahPpnbm: IAT.ppnbm,
			iB: IB.dpp,
			iC: IAT.dpp + IB.dpp
		},

		perolehan: {
			iiADpp: 0,
			iiAPpn: 0,
			iiAPpnbm: 0,
			iiBDpp: IIB.dpp,
			iiBDppNilaiLain: IIB.dppNilaiLain,
			iiBPpn: IIB.ppn,
			iiBPpnbm: IIB.ppnbm,
			iiCDpp: IIC.dpp,
			iiCPpn: IIC.ppn,
			iiCPpnbm: IIC.ppnbm,
			iiDDpp: IID.dpp,
			iiDDppNilaiLain: IID.dppNilaiLain,
			iiDPpn: IID.ppn,
			iiDPpnbm: IID.ppnbm,
			iiE: 0,
			iiF: 0,
			iiGDpp: IIG.dpp,
			iiGPpn: IIG.ppn,
			iiHDpp: IIH.dpp,
			iiHDppNilaiLain: IIH.dppNilaiLain,
			iiHPpn: IIH.ppn,
			iiHPpnbm: IIH.ppnbm,
			iiI: 0,
			iiJ: IIG.dpp + IIH.dpp
		},

		iiiA: IIIA,
		iiiB: 0,
		iiiC: IIIC,
		iiiD: 0,
		iiiE: IIIE,
		iiiF: 0,
		iiiG: 0
	};
}

type Bucket = FakturAmounts;

function createBucket(): Bucket {
	return {
		dpp: 0,
		dppNilaiLain: 0,
		ppn: 0,
		ppnbm: 0
	};
}

function addAmounts(bucket: Bucket, amounts: FakturAmounts, direction = 1) {
	bucket.dpp += amounts.dpp * direction;
	bucket.dppNilaiLain += amounts.dppNilaiLain * direction;
	bucket.ppn += amounts.ppn * direction;
	bucket.ppnbm += amounts.ppnbm * direction;
}

function getOutputBucket(
	kodeTransaksi: number,
	buckets: {
		IA2: Bucket;
		IA3: Bucket;
		IA4: Bucket;
		IA6: Bucket;
		IA7: Bucket;
		IA8: Bucket;
	}
) {
	if ([4, 5].includes(kodeTransaksi)) return buckets.IA2;
	if (kodeTransaksi === 6) return buckets.IA3;
	if ([1, 9, 10].includes(kodeTransaksi)) return buckets.IA4;
	if ([2, 3].includes(kodeTransaksi)) return buckets.IA6;
	if (kodeTransaksi === 7) return buckets.IA7;
	if (kodeTransaksi === 8) return buckets.IA8;
}

function getInputBucket(
	kodeTransaksi: number,
	dikreditkan: boolean,
	buckets: {
		IIB: Bucket;
		IIC: Bucket;
		IID: Bucket;
		IIH: Bucket;
	}
) {
	if (!dikreditkan || [6, 7, 8].includes(kodeTransaksi)) return buckets.IIH;
	if ([4, 5].includes(kodeTransaksi)) return buckets.IIB;
	if ([1, 9, 10].includes(kodeTransaksi)) return buckets.IIC;
	if ([2, 3].includes(kodeTransaksi)) return buckets.IID;
}
