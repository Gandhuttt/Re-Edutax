import { db } from '$lib/server/db';
import {
	faktur_pajak,
	kode_transaksi_faktur_pajak,
	spt_ppn_retail_invoice,
	transaksi_faktur_pajak
} from '$lib/server/db/schema';
import { and, eq, or } from 'drizzle-orm';
import { computeFakturLineAmounts } from './computeFakturLineAmounts';

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
			kodeTransaksi: kode_transaksi_faktur_pajak.kode,
			npwpPenjual: faktur_pajak.npwpPenjual,
			npwpPembeli: faktur_pajak.npwpPembeli,
			dikreditkan: faktur_pajak.dikreditkan,
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
					and(eq(faktur_pajak.npwpPembeli, npwp), eq(faktur_pajak.dikreditkan, true))
				),
				eq(faktur_pajak.masaPajak, periodeBulan),
				eq(faktur_pajak.tahun, periodeTahun)
			)
		);

	const outputTransactions = allTransactions.filter((transaction) => transaction.npwpPenjual === npwp);
	const inputTransactions = allTransactions.filter((transaction) => transaction.npwpPembeli === npwp);

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

	for (const transaction of outputTransactions) {
		const target = getOutputBucket(transaction.kodeTransaksi, { IA2, IA3, IA4, IA6, IA7, IA8 });

		if (target) {
			addTransaction(target, transaction);
		}
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

	for (const transaction of inputTransactions) {
		const target = getInputBucket(transaction.kodeTransaksi, { IIB, IIC, IID });

		if (target) {
			addTransaction(target, transaction);
		}
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
			iiHDpp: 0,
			iiHDppNilaiLain: 0,
			iiHPpn: 0,
			iiHPpnbm: 0,
			iiI: 0,
			iiJ: IIG.dpp
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

function createBucket() {
	return {
		dpp: 0,
		dppNilaiLain: 0,
		ppn: 0,
		ppnbm: 0
	};
}

function addTransaction(
	bucket: ReturnType<typeof createBucket>,
	transaction: {
		kuantitas: number;
		hargaSatuan: number;
		hargaPotongan: number;
		dppNilaiLain: number;
		tarifPpn: number;
		tarifPpnBm: number;
	}
) {
	const amounts = computeFakturLineAmounts(transaction);

	bucket.dpp += amounts.dpp;
	bucket.dppNilaiLain += amounts.dppNilaiLain;
	bucket.ppn += amounts.ppn;
	bucket.ppnbm += amounts.ppnbm;
}

function getOutputBucket(
	kodeTransaksi: number,
	buckets: {
		IA2: ReturnType<typeof createBucket>;
		IA3: ReturnType<typeof createBucket>;
		IA4: ReturnType<typeof createBucket>;
		IA6: ReturnType<typeof createBucket>;
		IA7: ReturnType<typeof createBucket>;
		IA8: ReturnType<typeof createBucket>;
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
	buckets: {
		IIB: ReturnType<typeof createBucket>;
		IIC: ReturnType<typeof createBucket>;
		IID: ReturnType<typeof createBucket>;
	}
) {
	if ([4, 5].includes(kodeTransaksi)) return buckets.IIB;
	if ([1, 9, 10].includes(kodeTransaksi)) return buckets.IIC;
	if ([2, 3].includes(kodeTransaksi)) return buckets.IID;
}
