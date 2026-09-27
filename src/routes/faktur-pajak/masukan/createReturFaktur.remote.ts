import { form, getRequestEvent } from '$app/server';
import { computeFakturAmounts, computeFakturLineAmounts } from '$lib/helpers/fakturAmounts';
import { isRealIsoDate, jsonRows, requiredString } from '$lib/helpers/valibot-schema';
import { db } from '$lib/server/db';
import {
	faktur_pajak,
	retur_faktur_pajak_masukan,
	retur_faktur_pajak_masukan_detail,
	transaksi_faktur_pajak
} from '$lib/server/db/schema';
import { error, invalid } from '@sveltejs/kit';
import { and, eq, ne } from 'drizzle-orm';
import * as v from 'valibot';
import { listFaktur } from './listFaktur.remote';

const ReturnLineSchema = v.object({
	transaksiFakturPajakId: requiredString('Baris transaksi'),
	jumlahDiretur: v.pipe(v.number(), v.integer(), v.minValue(1)),
	potonganDiretur: v.pipe(v.number(), v.integer(), v.minValue(0)),
	ppnDiretur: v.pipe(v.number(), v.integer(), v.minValue(0)),
	ppnbmDiretur: v.pipe(v.number(), v.integer(), v.minValue(0))
});

const CreateReturFakturSchema = v.object({
	id: requiredString('Faktur pajak masukan'),
	tanggalRetur: v.pipe(
		v.string(),
		v.isoDate('Tanggal retur tidak valid'),
		v.check(isRealIsoDate, 'Tanggal retur tidak valid')
	),
	details: jsonRows(ReturnLineSchema)
});

export const createReturFaktur = form(CreateReturFakturSchema, async (input, issue) => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;

	if (!activeNpwp) error(401, 'Belum login');

	const [invoice] = await db
		.select({
			id: faktur_pajak.id,
			tanggalFaktur: faktur_pajak.tanggalFaktur,
			uangMuka: faktur_pajak.uangMuka,
			pelunasan: faktur_pajak.pelunasan,
			nilaiUangMuka: faktur_pajak.nilaiUangMuka
		})
		.from(faktur_pajak)
		.where(
			and(
				eq(faktur_pajak.id, input.id),
				eq(faktur_pajak.npwpPembeli, activeNpwp),
				eq(faktur_pajak.diupload, true)
			)
		)
		.limit(1);

	if (!invoice) error(404, 'Faktur pajak masukan yang dapat diretur tidak ditemukan');
	if (input.tanggalRetur < invoice.tanggalFaktur) {
		invalid(issue.tanggalRetur('Tanggal retur tidak boleh sebelum tanggal faktur'));
	}
	if (input.details.length === 0) {
		invalid(issue.details('Pilih sedikitnya satu barang atau jasa yang diretur'));
	}

	const invoiceLines = await db
		.select({
			id: transaksi_faktur_pajak.id,
			kuantitas: transaksi_faktur_pajak.kuantitas,
			hargaSatuan: transaksi_faktur_pajak.hargaSatuan,
			hargaPotongan: transaksi_faktur_pajak.hargaPotongan,
			dppNilaiLain: transaksi_faktur_pajak.dppNilaiLain,
			tarifPpn: transaksi_faktur_pajak.tarifPpn,
			tarifPpnBm: transaksi_faktur_pajak.tarifPpnBm
		})
		.from(transaksi_faktur_pajak)
		.where(eq(transaksi_faktur_pajak.fakturPajakId, invoice.id));
	const invoiceLineById = new Map(invoiceLines.map((line) => [line.id, line]));
	const { gross, taxable } = computeFakturAmounts(invoiceLines, invoice);
	const paymentFactor = gross.dpp > 0 ? taxable.dpp / gross.dpp : 1;

	const previousDetails = await db
		.select({
			transaksiFakturPajakId: retur_faktur_pajak_masukan_detail.transaksiFakturPajakId,
			jumlahDiretur: retur_faktur_pajak_masukan_detail.jumlahDiretur,
			dppDiretur: retur_faktur_pajak_masukan_detail.dppDiretur,
			dppNilaiLainDiretur: retur_faktur_pajak_masukan_detail.dppNilaiLainDiretur,
			ppnDiretur: retur_faktur_pajak_masukan_detail.ppnDiretur,
			ppnbmDiretur: retur_faktur_pajak_masukan_detail.ppnbmDiretur
		})
		.from(retur_faktur_pajak_masukan_detail)
		.innerJoin(
			retur_faktur_pajak_masukan,
			eq(
				retur_faktur_pajak_masukan.id,
				retur_faktur_pajak_masukan_detail.returFakturPajakMasukanId
			)
		)
		.where(
			and(
				eq(retur_faktur_pajak_masukan.fakturPajakId, invoice.id),
				ne(retur_faktur_pajak_masukan.status, 'dibatalkan')
			)
		);
	const previouslyReturned = new Map<
		string,
		{ quantity: number; dpp: number; dppNilaiLain: number; ppn: number; ppnbm: number }
	>();
	for (const detail of previousDetails) {
		const current = previouslyReturned.get(detail.transaksiFakturPajakId) ?? {
			quantity: 0,
			dpp: 0,
			dppNilaiLain: 0,
			ppn: 0,
			ppnbm: 0
		};
		current.quantity += detail.jumlahDiretur;
		current.dpp += detail.dppDiretur;
		current.dppNilaiLain += detail.dppNilaiLainDiretur;
		current.ppn += detail.ppnDiretur;
		current.ppnbm += detail.ppnbmDiretur;
		previouslyReturned.set(detail.transaksiFakturPajakId, current);
	}

	const validatedDetails = input.details.map((detail, index) => {
		const original = invoiceLineById.get(detail.transaksiFakturPajakId);
		if (!original) invalid(issue.details(`Baris retur ke-${index + 1} tidak termasuk dalam faktur`));

		const previous = previouslyReturned.get(original.id) ?? {
			quantity: 0,
			dpp: 0,
			dppNilaiLain: 0,
			ppn: 0,
			ppnbm: 0
		};
		if (detail.jumlahDiretur + previous.quantity > original.kuantitas) {
			invalid(issue.details(`Jumlah retur ${index + 1} melebihi sisa kuantitas faktur`));
		}

		const beforeDiscount = detail.jumlahDiretur * original.hargaSatuan;
		if (detail.potonganDiretur > beforeDiscount) {
			invalid(issue.details(`Potongan retur ${index + 1} melebihi harga barang atau jasa`));
		}

		const grossOriginalAmounts = computeFakturLineAmounts(original);
		const originalAmounts = {
			dpp: Math.round(grossOriginalAmounts.dpp * paymentFactor),
			dppNilaiLain: Math.round(grossOriginalAmounts.dppNilaiLain * paymentFactor),
			ppn: Math.round(grossOriginalAmounts.ppn * paymentFactor),
			ppnbm: Math.round(grossOriginalAmounts.ppnbm * paymentFactor)
		};
		const dppDiretur = Math.round((beforeDiscount - detail.potonganDiretur) * paymentFactor);
		const dppNilaiLainDiretur =
			original.dppNilaiLain > 0
				? Math.round(
						originalAmounts.dppNilaiLain *
							(detail.jumlahDiretur / Math.max(1, original.kuantitas))
					)
				: 0;

		if (dppDiretur + previous.dpp > originalAmounts.dpp) {
			invalid(issue.details(`DPP retur ${index + 1} melebihi sisa nilai faktur`));
		}
		if (dppNilaiLainDiretur + previous.dppNilaiLain > originalAmounts.dppNilaiLain) {
			invalid(issue.details(`DPP nilai lain retur ${index + 1} melebihi sisa nilai faktur`));
		}
		if (detail.ppnDiretur + previous.ppn > originalAmounts.ppn) {
			invalid(issue.details(`PPN retur ${index + 1} melebihi sisa PPN faktur`));
		}
		if (detail.ppnbmDiretur + previous.ppnbm > originalAmounts.ppnbm) {
			invalid(issue.details(`PPnBM retur ${index + 1} melebihi sisa PPnBM faktur`));
		}

		return {
			transaksiFakturPajakId: original.id,
			jumlahDiretur: detail.jumlahDiretur,
			potonganDiretur: detail.potonganDiretur,
			dppDiretur,
			dppNilaiLainDiretur,
			gunakanDppNilaiLain: original.dppNilaiLain > 0,
			ppnDiretur: detail.ppnDiretur,
			ppnbmDiretur: detail.ppnbmDiretur
		};
	});

	const date = new Date(`${input.tanggalRetur}T00:00:00.000Z`);
	const returnId = crypto.randomUUID();
	const statements = [
		db.insert(retur_faktur_pajak_masukan).values({
			id: returnId,
			fakturPajakId: invoice.id,
			tanggalRetur: input.tanggalRetur,
			masaPajak: date.getUTCMonth() + 1,
			tahun: date.getUTCFullYear()
		}),
		...validatedDetails.map((detail) =>
			db.insert(retur_faktur_pajak_masukan_detail).values({
				returFakturPajakMasukanId: returnId,
				...detail
			})
		)
	];
	await db.batch(statements as [(typeof statements)[number], ...(typeof statements)[number][]]);
	await listFaktur().refresh();

	return { message: 'Konsep retur pajak masukan berhasil disimpan.', returnId };
});
