import { decimalInput, jsonRows, requiredString } from '$lib/helpers/valibot-schema';
import { db, type Statement } from '$lib/server/db';
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

export async function saveLampiranL5(sptPphBadanId: string, input: L5Input): Promise<Statement[]> {
	// Deleting tku rows cascades to their pp23_bulanan children, so no separate child delete is needed.
	const statements: Statement[] = [
		db.delete(spt_pph_badan_lampiran_5_tku).where(eq(spt_pph_badan_lampiran_5_tku.sptPphBadanId, sptPphBadanId))
	];

	for (const row of input.l5a) {
		// D1's batch() can't return generated ids mid-batch, so the tku id is precomputed here
		// (the column's default is client-side crypto.randomUUID() anyway) and reused for its children.
		const tkuId = crypto.randomUUID();

		statements.push(
			db.insert(spt_pph_badan_lampiran_5_tku).values({
				id: tkuId,
				sptPphBadanId,
				nitku: row.nitku,
				nama: row.nama,
				alamat: row.alamat,
				kelurahan: row.kelurahan,
				kecamatan: row.kecamatan,
				kabupaten: row.kabupaten,
				provinsi: row.provinsi
			})
		);

		for (const bulanan of row.bulanan) {
			const jumlahPeredaranBruto = Number(bulanan.jumlahPeredaranBruto);
			const jumlahPphFinalTerutang = Math.round(jumlahPeredaranBruto * 0.005);

			statements.push(
				db.insert(spt_pph_badan_lampiran_5_pp23_bulanan).values({
					tkuId,
					bulan: bulanan.bulan,
					jumlahPeredaranBruto,
					jumlahPphFinalTerutang
				})
			);
		}
	}

	statements.push(
		db
			.delete(spt_pph_badan_lampiran_5_pp23_dipotong_bulanan)
			.where(eq(spt_pph_badan_lampiran_5_pp23_dipotong_bulanan.sptPphBadanId, sptPphBadanId))
	);

	for (const row of input.l5bDipotong) {
		statements.push(
			db.insert(spt_pph_badan_lampiran_5_pp23_dipotong_bulanan).values({
				sptPphBadanId,
				bulan: row.bulan,
				nilai: Number(row.nilai)
			})
		);
	}

	return statements;
}
