import type { SptPpnBlob } from '$lib/schemas/surat-pemberitahuan/spt-ppn';
import { db } from '$lib/server/db';
import {
	faktur_pajak,
	kode_transaksi_faktur_pajak,
	transaksi_faktur_pajak
} from '$lib/server/db/schema';
import { and, eq, or } from 'drizzle-orm';

export async function createPostedSptPpnBlob({
	npwp,
	periodeBulan,
	periodeTahun,
	existingBlob
}: {
	npwp: string;
	periodeBulan: number;
	periodeTahun: number;
	existingBlob: SptPpnBlob;
}): Promise<SptPpnBlob> {
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

	const IA2 = createBucket();
	const IA3 = createBucket();
	const IA4 = createBucket();
	const IA5 = createBucket();
	const IA6 = createBucket();
	const IA7 = createBucket();
	const IA8 = createBucket();

	for (const transaction of outputTransactions) {
		const target = getOutputBucket(transaction.kodeTransaksi, { IA2, IA3, IA4, IA6, IA7, IA8 });

		if (target) {
			addTransaction(target, transaction);
		}
	}

	const IAT = {
		dpp: IA2.dpp + IA3.dpp + IA4.dpp + IA5.dpp + IA6.dpp + IA7.dpp + IA8.dpp,
		ppn: IA2.ppn + IA3.ppn + IA4.ppn + IA5.ppn + IA6.ppn + IA7.ppn + IA8.ppn,
		ppnbm: IA2.ppnbm + IA3.ppnbm + IA4.ppnbm + IA5.ppnbm + IA6.ppnbm + IA7.ppnbm + IA8.ppnbm
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

	const IIIA = IA2.ppn + IA3.ppn + IA4.ppn;
	const IIIC = IIB.ppn + IIC.ppn + IID.ppn;
	const IIIE = IIIA - IIIC;

	return {
		...existingBlob,
		periodeBulan,
		periodeTahun,
		I: {
			A: [
				0,
				[IA2.dpp, IA2.dppNilaiLain, IA2.ppn, IA2.ppnbm],
				[IA3.dpp, IA3.dppNilaiLain, IA3.ppn, IA3.ppnbm],
				[IA4.dpp, IA4.ppn, IA4.ppnbm],
				[IA5.dpp, IA5.dppNilaiLain, IA5.ppn, IA5.ppnbm],
				[IA6.dpp, IA6.dppNilaiLain, IA6.ppn, IA6.ppnbm],
				[IA7.dpp, IA7.dppNilaiLain, IA7.ppn, IA7.ppnbm],
				[IA8.dpp, IA8.dppNilaiLain, IA8.ppn, IA8.ppnbm],
				[0, 0, 0, 0],
				[IAT.dpp, IAT.ppn, IAT.ppnbm]
			],
			B: 0,
			C: IAT.dpp
		},
		II: [
			[0, 0, 0],
			[IIB.dpp, IIB.dppNilaiLain, IIB.ppn, IIB.ppnbm],
			[IIC.dpp, IIC.ppn, IIC.ppnbm],
			[IID.dpp, IID.dppNilaiLain, IID.ppn, IID.ppnbm],
			0,
			0,
			[IIG.dpp, IIG.ppn],
			[0, 0, 0, 0],
			0,
			IIG.dpp
		],
		III: [IIIA, 0, IIIC, 0, IIIE, 0, 0, existingBlob.III[7]]
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
	const dpp = Math.max(0, transaction.kuantitas * transaction.hargaSatuan - transaction.hargaPotongan);
	const ppnBase = transaction.dppNilaiLain > 0 ? transaction.dppNilaiLain : dpp;

	bucket.dpp += dpp;
	bucket.dppNilaiLain += transaction.dppNilaiLain;
	bucket.ppn += Math.round((ppnBase * transaction.tarifPpn) / 100);
	bucket.ppnbm += Math.round((dpp * transaction.tarifPpnBm) / 100);
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
