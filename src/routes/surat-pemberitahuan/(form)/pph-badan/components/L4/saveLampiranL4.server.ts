import { decimalInput, jsonRows, requiredString } from '$lib/helpers/valibot-schema';
import { db } from '$lib/server/db';
import type { Transaction } from '$lib/server/db';
import {
	jenis_penghasilan_bukan_objek_pajak_spt_pph_badan,
	objek_pajak_spt_pph_badan,
	spt_pph_badan_lampiran_4_bukan_objek_pajak,
	spt_pph_badan_lampiran_4_pph_final
} from '$lib/server/db/schema';
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
	),
	l4b: jsonRows(
		v.object({
			jenisPenghasilan: requiredString('Jenis penghasilan'),
			sumberPenghasilan: requiredString('Sumber penghasilan'),
			penghasilanBruto: decimalInput('Penghasilan bruto')
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

async function getJenisPenghasilanBukanObjekPajakId(kode: string) {
	const [jenisPenghasilan] = await db
		.select({ id: jenis_penghasilan_bukan_objek_pajak_spt_pph_badan.id })
		.from(jenis_penghasilan_bukan_objek_pajak_spt_pph_badan)
		.where(
			and(
				eq(jenis_penghasilan_bukan_objek_pajak_spt_pph_badan.kode, kode),
				eq(jenis_penghasilan_bukan_objek_pajak_spt_pph_badan.aktif, true)
			)
		)
		.limit(1);

	if (!jenisPenghasilan) {
		error(400, 'Jenis penghasilan tidak valid');
	}

	return jenisPenghasilan.id;
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

	await tx
		.delete(spt_pph_badan_lampiran_4_bukan_objek_pajak)
		.where(eq(spt_pph_badan_lampiran_4_bukan_objek_pajak.sptPphBadanId, sptPphBadanId));

	for (const [index, row] of input.l4b.entries()) {
		const jenisPenghasilanId = await getJenisPenghasilanBukanObjekPajakId(row.jenisPenghasilan);

		await tx.insert(spt_pph_badan_lampiran_4_bukan_objek_pajak).values({
			sptPphBadanId,
			nomorUrut: index + 1,
			jenisPenghasilanId,
			sumberPenghasilan: row.sumberPenghasilan,
			penghasilanBruto: Number(row.penghasilanBruto)
		});
	}
}
