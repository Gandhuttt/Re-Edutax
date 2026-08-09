import { decimalInput, jsonRows, requiredString } from '$lib/helpers/valibot-schema';
import { db } from '$lib/server/db';
import type { Transaction } from '$lib/server/db';
import {
	jenis_pajak_dipotong_dipungut_spt_pph_badan,
	jenis_penghasilan_kredit_pajak_luar_negeri_spt_pph_badan,
	mata_uang_spt_pph_badan,
	spt_pph_badan_lampiran_3_penghasilan_luar_negeri,
	spt_pph_badan_lampiran_3_pph_dipotong
} from '$lib/server/db/schema';
import { getNegaraId } from '../../getNegaraId.server';
import { error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import * as v from 'valibot';

export const L3Schema = v.object({
	l3a: jsonRows(
		v.object({
			namaPemberiPenghasilan: requiredString('Nama pemberi penghasilan'),
			negara: requiredString('Negara'),
			tanggal: requiredString('Tanggal'),
			jenisPenghasilan: requiredString('Jenis penghasilan'),
			penghasilanNeto: decimalInput('Penghasilan neto'),
			pphLuarNegeri: decimalInput('PPh luar negeri'),
			mataUang: v.optional(v.string(), ''),
			pphLuarNegeriMataUangAsing: decimalInput('PPh luar negeri (mata uang asing)'),
			kreditPajakYangDapatDikreditkan: decimalInput('Kredit pajak yang dapat dikreditkan'),
			keterangan: v.optional(v.string(), '')
		})
	),
	l3b: jsonRows(
		v.object({
			namaPemotongPemungut: requiredString('Nama pemotong/pemungut pajak'),
			npwp: requiredString('NPWP'),
			jenisPajak: requiredString('Jenis pajak'),
			dpp: decimalInput('DPP'),
			pph: decimalInput('Pajak penghasilan'),
			nomorBukti: requiredString('Nomor bukti pemotongan/SSP/SSPCP'),
			tanggalBukti: requiredString('Tanggal bukti pemotongan/SSP/SSPCP')
		})
	)
});

type L3Input = v.InferOutput<typeof L3Schema>;

async function getJenisPenghasilanKreditPajakLuarNegeriId(kode: string) {
	const [jenisPenghasilan] = await db
		.select({ id: jenis_penghasilan_kredit_pajak_luar_negeri_spt_pph_badan.id })
		.from(jenis_penghasilan_kredit_pajak_luar_negeri_spt_pph_badan)
		.where(
			and(
				eq(jenis_penghasilan_kredit_pajak_luar_negeri_spt_pph_badan.kode, kode),
				eq(jenis_penghasilan_kredit_pajak_luar_negeri_spt_pph_badan.aktif, true)
			)
		)
		.limit(1);

	if (!jenisPenghasilan) {
		error(400, 'Jenis penghasilan tidak valid');
	}

	return jenisPenghasilan.id;
}

async function getMataUangId(kode: string) {
	const [mataUang] = await db
		.select({ id: mata_uang_spt_pph_badan.id })
		.from(mata_uang_spt_pph_badan)
		.where(and(eq(mata_uang_spt_pph_badan.kode, kode), eq(mata_uang_spt_pph_badan.aktif, true)))
		.limit(1);

	if (!mataUang) {
		error(400, 'Mata uang tidak valid');
	}

	return mataUang.id;
}

async function getJenisPajakDipotongDipungutId(kode: string) {
	const [jenisPajak] = await db
		.select({ id: jenis_pajak_dipotong_dipungut_spt_pph_badan.id })
		.from(jenis_pajak_dipotong_dipungut_spt_pph_badan)
		.where(
			and(
				eq(jenis_pajak_dipotong_dipungut_spt_pph_badan.kode, kode),
				eq(jenis_pajak_dipotong_dipungut_spt_pph_badan.aktif, true)
			)
		)
		.limit(1);

	if (!jenisPajak) {
		error(400, 'Jenis pajak tidak valid');
	}

	return jenisPajak.id;
}

export async function saveLampiranL3(tx: Transaction, sptPphBadanId: string, input: L3Input) {
	await tx
		.delete(spt_pph_badan_lampiran_3_penghasilan_luar_negeri)
		.where(eq(spt_pph_badan_lampiran_3_penghasilan_luar_negeri.sptPphBadanId, sptPphBadanId));

	for (const [index, row] of input.l3a.entries()) {
		const negaraId = await getNegaraId(row.negara);
		const jenisPenghasilanId = await getJenisPenghasilanKreditPajakLuarNegeriId(row.jenisPenghasilan);
		const mataUangId = row.mataUang ? await getMataUangId(row.mataUang) : null;

		await tx.insert(spt_pph_badan_lampiran_3_penghasilan_luar_negeri).values({
			sptPphBadanId,
			nomorUrut: index + 1,
			namaPemberiPenghasilan: row.namaPemberiPenghasilan,
			negaraId,
			tanggal: row.tanggal,
			jenisPenghasilanId,
			penghasilanNeto: Number(row.penghasilanNeto),
			pphLuarNegeri: Number(row.pphLuarNegeri),
			mataUangId,
			pphLuarNegeriMataUangAsing: Number(row.pphLuarNegeriMataUangAsing),
			kreditPajakYangDapatDikreditkan: Number(row.kreditPajakYangDapatDikreditkan),
			keterangan: row.keterangan
		});
	}

	await tx
		.delete(spt_pph_badan_lampiran_3_pph_dipotong)
		.where(eq(spt_pph_badan_lampiran_3_pph_dipotong.sptPphBadanId, sptPphBadanId));

	for (const [index, row] of input.l3b.entries()) {
		const jenisPajakId = await getJenisPajakDipotongDipungutId(row.jenisPajak);

		await tx.insert(spt_pph_badan_lampiran_3_pph_dipotong).values({
			sptPphBadanId,
			nomorUrut: index + 1,
			namaPemotongPemungut: row.namaPemotongPemungut,
			npwpPemotongPemungut: row.npwp,
			jenisPajakId,
			dpp: Number(row.dpp),
			pph: Number(row.pph),
			nomorBukti: row.nomorBukti,
			tanggalBukti: row.tanggalBukti
		});
	}
}
