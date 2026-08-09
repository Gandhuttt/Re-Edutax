import { decimalInput, jsonRows, requiredString } from '$lib/helpers/valibot-schema';
import { db } from '$lib/server/db';
import type { Transaction } from '$lib/server/db';
import {
	bentuk_hubungan_istimewa_spt_pph_badan,
	jenis_transaksi_hubungan_istimewa_spt_pph_badan,
	metode_penentuan_harga_transfer_spt_pph_badan,
	spt_pph_badan_lampiran_10a_transaksi
} from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import * as v from 'valibot';
import { getNegaraId } from '../../getNegaraId.server';

export const L10ASchema = v.object({
	l10a: jsonRows(
		v.object({
			nama: requiredString('Nama'),
			npwpTin: v.optional(v.string(), ''),
			negara: v.optional(v.string(), ''),
			bentukHubungan: requiredString('Bentuk hubungan'),
			kegiatanUsaha: v.optional(v.string(), ''),
			jenisTransaksi: requiredString('Jenis transaksi'),
			nilaiTransaksi: v.optional(decimalInput('Nilai transaksi'), 0),
			metodePenentuanHargaTransfer: requiredString('Metode penentuan harga transfer'),
			alasanPenggunaanMetode: v.optional(v.string(), '')
		})
	)
});

type L10AInput = v.InferOutput<typeof L10ASchema>;

async function getBentukHubunganId(kode: string) {
	const [row] = await db
		.select({ id: bentuk_hubungan_istimewa_spt_pph_badan.id })
		.from(bentuk_hubungan_istimewa_spt_pph_badan)
		.where(and(eq(bentuk_hubungan_istimewa_spt_pph_badan.kode, kode), eq(bentuk_hubungan_istimewa_spt_pph_badan.aktif, true)))
		.limit(1);

	if (!row) {
		error(400, 'Bentuk hubungan tidak valid');
	}

	return row.id;
}

async function getJenisTransaksiId(kode: string) {
	const [row] = await db
		.select({ id: jenis_transaksi_hubungan_istimewa_spt_pph_badan.id })
		.from(jenis_transaksi_hubungan_istimewa_spt_pph_badan)
		.where(
			and(
				eq(jenis_transaksi_hubungan_istimewa_spt_pph_badan.kode, kode),
				eq(jenis_transaksi_hubungan_istimewa_spt_pph_badan.aktif, true)
			)
		)
		.limit(1);

	if (!row) {
		error(400, 'Jenis transaksi tidak valid');
	}

	return row.id;
}

async function getMetodeHargaTransferId(kode: string) {
	const [row] = await db
		.select({ id: metode_penentuan_harga_transfer_spt_pph_badan.id })
		.from(metode_penentuan_harga_transfer_spt_pph_badan)
		.where(
			and(
				eq(metode_penentuan_harga_transfer_spt_pph_badan.kode, kode),
				eq(metode_penentuan_harga_transfer_spt_pph_badan.aktif, true)
			)
		)
		.limit(1);

	if (!row) {
		error(400, 'Metode penentuan harga transfer tidak valid');
	}

	return row.id;
}

export async function saveLampiranL10A(tx: Transaction, sptPphBadanId: string, input: L10AInput) {
	await tx
		.delete(spt_pph_badan_lampiran_10a_transaksi)
		.where(eq(spt_pph_badan_lampiran_10a_transaksi.sptPphBadanId, sptPphBadanId));

	for (const [index, row] of input.l10a.entries()) {
		const negaraId = row.negara ? await getNegaraId(row.negara) : null;
		const bentukHubunganId = await getBentukHubunganId(row.bentukHubungan);
		const jenisTransaksiId = await getJenisTransaksiId(row.jenisTransaksi);
		const metodePenentuanHargaTransferId = await getMetodeHargaTransferId(row.metodePenentuanHargaTransfer);

		await tx.insert(spt_pph_badan_lampiran_10a_transaksi).values({
			sptPphBadanId,
			nomorUrut: index + 1,
			nama: row.nama,
			npwpTin: row.npwpTin,
			negaraId,
			bentukHubunganId,
			kegiatanUsaha: row.kegiatanUsaha,
			jenisTransaksiId,
			nilaiTransaksi: Number(row.nilaiTransaksi),
			metodePenentuanHargaTransferId,
			alasanPenggunaanMetode: row.alasanPenggunaanMetode
		});
	}
}
