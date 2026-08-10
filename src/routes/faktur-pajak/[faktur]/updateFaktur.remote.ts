import { form, getRequestEvent } from '$app/server';
import { decimalString, digitsString, isRealIsoDate, requiredString } from '$lib/helpers/valibot-schema';
import { db } from '$lib/server/db';
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
import { error, redirect } from '@sveltejs/kit';
import { and, eq, isNull } from 'drizzle-orm';
import * as v from 'valibot';

const UpdateFakturSchema = v.object({
	dokumenTransaksi: v.object({
		uangMuka: v.optional(v.boolean()),
		pelunasan: v.optional(v.boolean()),
		kodeTransaksi: v.number(),
		tanggalFaktur: v.pipe(
			v.string(),
			v.isoDate('Tanggal faktur tidak valid'),
			v.check(isRealIsoDate, 'Tanggal faktur tidak valid')
		),
		referensi: v.optional(v.string(), ''),
		alamat: v.optional(v.string(), ''),
		kodeInformasiTambahan: v.optional(v.number()),
		dokumenPendukung: v.optional(v.string())
	}),
	informasiPembeli: v.object({
		npwpPembeli: v.optional(v.string(), '')
	}),
	transaksi: v.optional(
		v.array(
			v.object({
				nama: requiredString('Nama transaksi harus diisi'),
				kodeItem: requiredString('Kode item harus diisi'),
				satuanUkur: requiredString('Satuan ukur harus diisi'),
				kuantitas: digitsString('Kuantitas'),
				hargaSatuan: decimalString('Harga satuan'),
				hargaPotongan: decimalString('Harga potongan'),
				dppNilaiLain: decimalString('DPP nilai lain'),
				tarifPpn: digitsString('Tarif PPN'),
				tarifPpnBm: v.optional(digitsString('Tarif PPnBM'), '0')
			})
		),
		[]
	)
});

export const updateFaktur = form(UpdateFakturSchema, async (input) => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;
	const fakturId = event.params.faktur;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	if (!fakturId) {
		error(400, 'Bad faktur id');
	}

	const [existingFaktur] = await db
		.select({ id: faktur_pajak.id })
		.from(faktur_pajak)
		.where(
			and(
				eq(faktur_pajak.id, fakturId),
				eq(faktur_pajak.npwpPenjual, activeNpwp),
				eq(faktur_pajak.diupload, false)
			)
		)
		.limit(1);

	if (!existingFaktur) {
		error(404, 'Faktur draft tidak ditemukan');
	}

	const [kodeTransaksi] = await db
		.select({ id: kode_transaksi_faktur_pajak.id, kode: kode_transaksi_faktur_pajak.kode })
		.from(kode_transaksi_faktur_pajak)
		.where(
			and(
				eq(kode_transaksi_faktur_pajak.kode, Number(input.dokumenTransaksi.kodeTransaksi)),
				eq(kode_transaksi_faktur_pajak.aktif, true)
			)
		)
		.limit(1);

	if (!kodeTransaksi) {
		error(400, 'Kode transaksi tidak valid');
	}

	const tanggalFaktur = input.dokumenTransaksi.tanggalFaktur;
	const tanggal = new Date(`${tanggalFaktur}T00:00:00.000Z`);
	const isAdditionalInfoCode = [7, 8].includes(kodeTransaksi.kode);
	let jenisInformasiTambahan: {
		id: string;
		butuhDokumenPendukung: boolean;
	} | null = null;

	if (isAdditionalInfoCode) {
		if (input.dokumenTransaksi.kodeInformasiTambahan === undefined) {
			error(400, 'Informasi tambahan harus dipilih');
		}

		const [row] = await db
			.select({
				id: jenis_informasi_tambahan_faktur_pajak.id,
				butuhDokumenPendukung: jenis_informasi_tambahan_faktur_pajak.butuhDokumenPendukung
			})
			.from(jenis_informasi_tambahan_faktur_pajak)
			.where(
				and(
					eq(jenis_informasi_tambahan_faktur_pajak.kodeTransaksiId, kodeTransaksi.id),
					isNull(jenis_informasi_tambahan_faktur_pajak.subKodeTransaksiId),
					eq(
						jenis_informasi_tambahan_faktur_pajak.kode,
						Number(input.dokumenTransaksi.kodeInformasiTambahan)
					),
					eq(jenis_informasi_tambahan_faktur_pajak.aktif, true)
				)
			)
			.limit(1);

		if (!row) {
			error(400, 'Informasi tambahan tidak valid');
		}

		if (row.butuhDokumenPendukung && !input.dokumenTransaksi.dokumenPendukung?.trim()) {
			error(400, 'Dokumen pendukung harus diisi');
		}

		jenisInformasiTambahan = row;
	}

	const validatedTransaksi = await Promise.all(
		input.transaksi.map(async (transaksi, index) => {
			const [[kodeItem], [satuanUkur]] = await Promise.all([
				db
					.select({
						id: kode_item_transaksi_faktur.id,
						jenisItemId: kode_item_transaksi_faktur.jenisItemId
					})
					.from(kode_item_transaksi_faktur)
					.innerJoin(
						jenis_item_transaksi_faktur,
						eq(kode_item_transaksi_faktur.jenisItemId, jenis_item_transaksi_faktur.id)
					)
					.where(
						and(
							eq(kode_item_transaksi_faktur.kode, transaksi.kodeItem),
							eq(kode_item_transaksi_faktur.aktif, true),
							eq(jenis_item_transaksi_faktur.aktif, true)
						)
					)
					.limit(1),
				db
					.select({ id: satuan_ukur_transaksi_faktur.id })
					.from(satuan_ukur_transaksi_faktur)
					.where(
						and(
							eq(satuan_ukur_transaksi_faktur.kode, transaksi.satuanUkur),
							eq(satuan_ukur_transaksi_faktur.aktif, true)
						)
					)
					.limit(1)
			]);

			if (!kodeItem) {
				error(400, `Kode item transaksi ke-${index + 1} tidak valid`);
			}

			if (!satuanUkur) {
				error(400, `Satuan ukur transaksi ke-${index + 1} tidak valid`);
			}

			return {
				nama: transaksi.nama,
				kodeItemId: kodeItem.id,
				satuanUkurId: satuanUkur.id,
				kuantitas: Number(transaksi.kuantitas),
				hargaSatuan: Number(transaksi.hargaSatuan),
				hargaPotongan: Number(transaksi.hargaPotongan),
				dppNilaiLain: Number(transaksi.dppNilaiLain),
				tarifPpn: Number(transaksi.tarifPpn),
				tarifPpnBm: Number(transaksi.tarifPpnBm)
			};
		})
	);

	// D1 has no real multi-statement transaction over the Workers binding, only db.batch()
	// (which requires every statement to be built upfront, no reading results back mid-batch).
	const statements = [
		db
			.update(faktur_pajak)
			.set({
				uangMuka: Boolean(input.dokumenTransaksi.uangMuka),
				pelunasan: Boolean(input.dokumenTransaksi.pelunasan),
				kodeTransaksiId: kodeTransaksi.id,
				tanggalFaktur,
				masaPajak: tanggal.getUTCMonth() + 1,
				tahun: tanggal.getUTCFullYear(),
				referensi: input.dokumenTransaksi.referensi ?? '',
				alamat: input.dokumenTransaksi.alamat ?? '',
				npwpPembeli: input.informasiPembeli.npwpPembeli ?? ''
			})
			.where(eq(faktur_pajak.id, fakturId)),
		db
			.delete(informasi_tambahan_faktur_pajak)
			.where(eq(informasi_tambahan_faktur_pajak.fakturPajakId, fakturId)),
		...(jenisInformasiTambahan
			? [
					db.insert(informasi_tambahan_faktur_pajak).values({
						fakturPajakId: fakturId,
						jenisInformasiTambahanId: jenisInformasiTambahan.id,
						dokumenPendukung: input.dokumenTransaksi.dokumenPendukung?.trim() || null
					})
				]
			: []),
		db.delete(transaksi_faktur_pajak).where(eq(transaksi_faktur_pajak.fakturPajakId, fakturId)),
		...validatedTransaksi.map((transaksi) =>
			db.insert(transaksi_faktur_pajak).values({
				fakturPajakId: fakturId,
				...transaksi
			})
		)
	];
	await db.batch(statements as [(typeof statements)[number], ...(typeof statements)[number][]]);

	redirect(303, '/faktur-pajak/keluaran');
});
