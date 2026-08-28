import { form, getRequestEvent } from '$app/server';
import { db, type Statement } from '$lib/server/db';
import {
	faktur_pajak,
	informasi_tambahan_faktur_pajak,
	jenis_informasi_tambahan_faktur_pajak,
	jenis_item_transaksi_faktur,
	kode_item_transaksi_faktur,
	kode_transaksi_faktur_pajak,
	satuan_ukur_transaksi_faktur,
	transaksi_faktur_pajak
} from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { and, eq, isNull } from 'drizzle-orm';
import { parseFakturBulkXlsx } from './server/parseFakturBulkXlsx';
import { parseTaxInvoiceBulk } from './server/parseTaxInvoiceBulk';

// "Impor Data" for Faktur Keluaran, matching the two real Coretax e-Faktur
// bulk import formats: the TaxInvoiceBulk XML from Impor Data -> Unduh Format
// Data (see parseTaxInvoiceBulk), and the "Faktur"/"DetailFaktur" multi-sheet
// Excel template (see parseFakturBulkXlsx) -- dispatched by file extension.
// Imported invoices land as drafts, same as ones created via "Buat Faktur" --
// nomorFaktur stays empty until the user uploads them individually.
export const importFaktur = form('unchecked', async ({ file }) => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}
	if (!(file instanceof File)) {
		error(400, 'File wajib diunggah.');
	}

	const filename = file.name.toLowerCase();
	const { rows } = filename.endsWith('.xlsx') || filename.endsWith('.xls')
		? parseFakturBulkXlsx(await file.arrayBuffer(), activeNpwp)
		: parseTaxInvoiceBulk(await file.text(), activeNpwp);

	if (rows.length === 0) {
		return { fakturImported: 0 };
	}

	const kodeTransaksiRows = await db
		.select({ id: kode_transaksi_faktur_pajak.id, kode: kode_transaksi_faktur_pajak.kode })
		.from(kode_transaksi_faktur_pajak)
		.where(eq(kode_transaksi_faktur_pajak.aktif, true));
	const kodeTransaksiByKode = new Map(kodeTransaksiRows.map((row) => [row.kode, row]));

	const kodeItemRows = await db
		.select({ id: kode_item_transaksi_faktur.id, kode: kode_item_transaksi_faktur.kode })
		.from(kode_item_transaksi_faktur)
		.innerJoin(
			jenis_item_transaksi_faktur,
			eq(kode_item_transaksi_faktur.jenisItemId, jenis_item_transaksi_faktur.id)
		)
		.where(
			and(eq(kode_item_transaksi_faktur.aktif, true), eq(jenis_item_transaksi_faktur.aktif, true))
		);
	const kodeItemByKode = new Map(kodeItemRows.map((row) => [row.kode, row]));

	const satuanUkurRows = await db
		.select({ id: satuan_ukur_transaksi_faktur.id, kode: satuan_ukur_transaksi_faktur.kode })
		.from(satuan_ukur_transaksi_faktur)
		.where(eq(satuan_ukur_transaksi_faktur.aktif, true));
	const satuanUkurByKode = new Map(satuanUkurRows.map((row) => [row.kode, row]));

	const statements: Statement[] = [];

	for (const [index, row] of rows.entries()) {
		const kodeTransaksi = kodeTransaksiByKode.get(row.trxCode);
		if (!kodeTransaksi) {
			error(400, `Faktur ke-${index + 1}: TrxCode "${row.trxCode}" tidak dikenal.`);
		}

		for (const [goodIndex, good] of row.goodServices.entries()) {
			if (!kodeItemByKode.has(`${good.opt}${good.code}`)) {
				error(400, `Faktur ke-${index + 1}, barang/jasa ke-${goodIndex + 1}: Code "${good.code}" tidak dikenal.`);
			}
			if (!satuanUkurByKode.has(good.unit)) {
				error(400, `Faktur ke-${index + 1}, barang/jasa ke-${goodIndex + 1}: Unit "${good.unit}" tidak dikenal.`);
			}
		}

		let jenisInformasiTambahan: { id: string; butuhDokumenPendukung: boolean } | null = null;
		if ([7, 8].includes(row.trxCode)) {
			const addInfoKode = Number(row.addInfo);
			if (!row.addInfo || Number.isNaN(addInfoKode)) {
				error(400, `Faktur ke-${index + 1}: AddInfo wajib diisi kode informasi tambahan untuk TrxCode 07/08.`);
			}

			const [jenisRow] = await db
				.select({
					id: jenis_informasi_tambahan_faktur_pajak.id,
					butuhDokumenPendukung: jenis_informasi_tambahan_faktur_pajak.butuhDokumenPendukung
				})
				.from(jenis_informasi_tambahan_faktur_pajak)
				.where(
					and(
						eq(jenis_informasi_tambahan_faktur_pajak.kodeTransaksiId, kodeTransaksi.id),
						isNull(jenis_informasi_tambahan_faktur_pajak.subKodeTransaksiId),
						eq(jenis_informasi_tambahan_faktur_pajak.kode, addInfoKode),
						eq(jenis_informasi_tambahan_faktur_pajak.aktif, true)
					)
				)
				.limit(1);

			if (!jenisRow) {
				error(400, `Faktur ke-${index + 1}: AddInfo "${row.addInfo}" tidak dikenal untuk TrxCode ${row.trxCode}.`);
			}
			if (jenisRow.butuhDokumenPendukung && !row.customDoc) {
				error(400, `Faktur ke-${index + 1}: CustomDoc wajib diisi untuk kode informasi tambahan ini.`);
			}

			jenisInformasiTambahan = jenisRow;
		}

		const tanggal = new Date(`${row.taxInvoiceDate}T00:00:00.000Z`);
		const fakturId = crypto.randomUUID();

		statements.push(
			db.insert(faktur_pajak).values({
				id: fakturId,
				npwpPenjual: activeNpwp,
				npwpPembeli: row.buyerTin,
				kodeTransaksiId: kodeTransaksi.id,
				referensi: row.refDesc ?? '',
				alamat: row.buyerAdress ?? '',
				tanggalFaktur: row.taxInvoiceDate,
				masaPajak: tanggal.getUTCMonth() + 1,
				tahun: tanggal.getUTCFullYear()
			})
		);

		if (jenisInformasiTambahan) {
			statements.push(
				db.insert(informasi_tambahan_faktur_pajak).values({
					fakturPajakId: fakturId,
					jenisInformasiTambahanId: jenisInformasiTambahan.id,
					dokumenPendukung: row.customDoc
				})
			);
		}

		for (const good of row.goodServices) {
			const kodeItem = kodeItemByKode.get(`${good.opt}${good.code}`)!;
			const satuanUkur = satuanUkurByKode.get(good.unit)!;

			statements.push(
				db.insert(transaksi_faktur_pajak).values({
					fakturPajakId: fakturId,
					nama: good.name,
					kodeItemId: kodeItem.id,
					satuanUkurId: satuanUkur.id,
					kuantitas: good.qty,
					hargaSatuan: good.price,
					hargaPotongan: good.totalDiscount,
					dppNilaiLain: good.otherTaxBase,
					tarifPpn: good.vatRate,
					tarifPpnBm: good.stlgRate
				})
			);
		}
	}

	// D1 has no real multi-statement transaction over the Workers binding, only
	// db.batch() (every statement built upfront, no reading results back mid-batch).
	await db.batch(statements as [Statement, ...Statement[]]);

	return { fakturImported: rows.length };
});
