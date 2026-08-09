import { decimalInput, jsonRows, requiredString } from '$lib/helpers/valibot-schema';
import { db } from '$lib/server/db';
import type { Transaction } from '$lib/server/db';
import { objek_pajak_spt_pph_badan, spt_pph_badan_lampiran_4_pph_final } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import * as v from 'valibot';

export const L4Schema = v.object({
	l4a: jsonRows(
		v.object({
			npwpPemotongPemungutPenyetor: v.optional(v.string(), ''),
			namaPemotongPemungutPenyetor: v.optional(v.string(), ''),
			objekPajak: requiredString('Objek pajak'),
			dasarPengenaanPajak: decimalInput('Dasar pengenaan pajak'),
			tarif: decimalInput('Tarif'),
			pphFinalTerutang: decimalInput('PPh final terutang'),
			nomorBuktiPotong: v.optional(v.string(), ''),
			tanggalBuktiPotong: v.optional(v.string(), ''),
			keterangan: v.optional(v.string(), '')
		})
	)
});

type L4Input = v.InferOutput<typeof L4Schema>;

async function getObjekPajakId(kode: string) {
	const [objekPajak] = await db
		.select({ id: objek_pajak_spt_pph_badan.id })
		.from(objek_pajak_spt_pph_badan)
		.where(and(eq(objek_pajak_spt_pph_badan.kode, kode), eq(objek_pajak_spt_pph_badan.aktif, true)))
		.limit(1);

	if (!objekPajak) {
		error(400, 'Objek pajak tidak valid');
	}

	return objekPajak.id;
}

export async function saveLampiranL4(tx: Transaction, sptPphBadanId: string, input: L4Input) {
	await tx
		.delete(spt_pph_badan_lampiran_4_pph_final)
		.where(eq(spt_pph_badan_lampiran_4_pph_final.sptPphBadanId, sptPphBadanId));

	for (const [index, row] of input.l4a.entries()) {
		const objekPajakId = await getObjekPajakId(row.objekPajak);

		await tx.insert(spt_pph_badan_lampiran_4_pph_final).values({
			sptPphBadanId,
			nomorUrut: index + 1,
			npwpPemotongPemungutPenyetor: row.npwpPemotongPemungutPenyetor,
			namaPemotongPemungutPenyetor: row.namaPemotongPemungutPenyetor,
			objekPajakId,
			dasarPengenaanPajak: Number(row.dasarPengenaanPajak),
			tarif: Number(row.tarif),
			pphFinalTerutang: Number(row.pphFinalTerutang),
			nomorBuktiPotong: row.nomorBuktiPotong,
			tanggalBuktiPotong: row.tanggalBuktiPotong,
			keterangan: row.keterangan
		});
	}
}
