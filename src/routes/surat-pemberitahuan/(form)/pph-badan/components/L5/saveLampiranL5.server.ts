import { decimalInput, jsonRows, requiredString } from '$lib/helpers/valibot-schema';
import type { Transaction } from '$lib/server/db';
import {
	spt_pph_badan_lampiran_5_pp23_bulanan,
	spt_pph_badan_lampiran_5_pp23_dipotong_bulanan,
	spt_pph_badan_lampiran_5_tku
} from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';

export const L5Schema = v.object({
	l5a: jsonRows(
		v.object({
			nitku: requiredString('NI TKU'),
			nama: requiredString('Nama TKU'),
			alamat: v.optional(v.string(), ''),
			kelurahan: v.optional(v.string(), ''),
			kecamatan: v.optional(v.string(), ''),
			kabupaten: v.optional(v.string(), ''),
			provinsi: v.optional(v.string(), ''),
			bulanan: v.array(
				v.object({
					bulan: v.pipe(v.number('Bulan harus berupa angka'), v.integer(), v.minValue(1), v.maxValue(12)),
					jumlahPeredaranBruto: decimalInput('Peredaran bruto')
				})
			)
		})
	),
	l5bDipotong: jsonRows(
		v.object({
			bulan: v.pipe(v.number('Bulan harus berupa angka'), v.integer(), v.minValue(1), v.maxValue(12)),
			nilai: decimalInput('PPh dipotong/dipungut pihak lain')
		})
	)
});

type L5Input = v.InferOutput<typeof L5Schema>;

export async function saveLampiranL5(tx: Transaction, sptPphBadanId: string, input: L5Input) {
	const existingTku = await tx
		.select({ id: spt_pph_badan_lampiran_5_tku.id })
		.from(spt_pph_badan_lampiran_5_tku)
		.where(eq(spt_pph_badan_lampiran_5_tku.sptPphBadanId, sptPphBadanId));

	for (const row of existingTku) {
		await tx
			.delete(spt_pph_badan_lampiran_5_pp23_bulanan)
			.where(eq(spt_pph_badan_lampiran_5_pp23_bulanan.tkuId, row.id));
	}

	await tx.delete(spt_pph_badan_lampiran_5_tku).where(eq(spt_pph_badan_lampiran_5_tku.sptPphBadanId, sptPphBadanId));

	for (const row of input.l5a) {
		const [tku] = await tx
			.insert(spt_pph_badan_lampiran_5_tku)
			.values({
				sptPphBadanId,
				nitku: row.nitku,
				nama: row.nama,
				alamat: row.alamat,
				kelurahan: row.kelurahan,
				kecamatan: row.kecamatan,
				kabupaten: row.kabupaten,
				provinsi: row.provinsi
			})
			.returning({ id: spt_pph_badan_lampiran_5_tku.id });

		for (const bulanan of row.bulanan) {
			const jumlahPeredaranBruto = Number(bulanan.jumlahPeredaranBruto);
			const jumlahPphFinalTerutang = Math.round(jumlahPeredaranBruto * 0.005);

			await tx.insert(spt_pph_badan_lampiran_5_pp23_bulanan).values({
				tkuId: tku.id,
				bulan: bulanan.bulan,
				jumlahPeredaranBruto,
				jumlahPphFinalTerutang
			});
		}
	}

	await tx
		.delete(spt_pph_badan_lampiran_5_pp23_dipotong_bulanan)
		.where(eq(spt_pph_badan_lampiran_5_pp23_dipotong_bulanan.sptPphBadanId, sptPphBadanId));

	for (const row of input.l5bDipotong) {
		await tx.insert(spt_pph_badan_lampiran_5_pp23_dipotong_bulanan).values({
			sptPphBadanId,
			bulan: row.bulan,
			nilai: Number(row.nilai)
		});
	}
}
