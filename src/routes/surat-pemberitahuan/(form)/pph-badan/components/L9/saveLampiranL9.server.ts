import { decimalInput, jsonRows, requiredString } from '$lib/helpers/valibot-schema';
import { db } from '$lib/server/db';
import type { Transaction } from '$lib/server/db';
import {
	jenis_harta_spt_pph_badan,
	spt_pph_badan_lampiran_9_harta,
	spt_pph_badan_lampiran_9_ringkasan_komersial
} from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import * as v from 'valibot';

export const KELOMPOK_PENYUSUTAN = [
	'kelompok_1',
	'kelompok_2',
	'kelompok_3',
	'kelompok_4',
	'kelompok_lainnya',
	'permanen',
	'tidak_permanen'
] as const;

export const L9Schema = v.object({
	l9: jsonRows(
		v.object({
			kelompokPenyusutan: v.picklist(KELOMPOK_PENYUSUTAN, 'Kelompok penyusutan tidak valid'),
			jenisHarta: requiredString('Jenis harta'),
			kodeHarta: v.optional(v.string(), ''),
			bulanTahunPerolehan: v.optional(v.string(), ''),
			hargaPerolehan: v.optional(decimalInput('Harga perolehan'), 0),
			nilaiSisaBukuFiskalAwalTahun: v.optional(decimalInput('Nilai sisa buku fiskal pada awal tahun'), 0),
			metodePenyusutanKomersial: v.optional(v.string(), ''),
			metodePenyusutanFiskal: v.optional(v.string(), ''),
			penyusutanAmortisasiFiskalTahunIni: v.optional(decimalInput('Penyusutan/amortisasi fiskal tahun ini'), 0),
			penyusutanAmortisasiKomersialTahunIni: v.optional(
				decimalInput('Penyusutan/amortisasi komersial tahun ini'),
				0
			),
			akumulasiPenyusutanAmortisasiFiskal: v.optional(
				decimalInput('Akumulasi penyusutan/amortisasi fiskal'),
				0
			),
			nilaiSisaBukuFiskalAkhirTahun: v.optional(decimalInput('Nilai sisa buku fiskal pada akhir tahun'), 0),
			keterangan: v.optional(v.string(), '')
		})
	),
	l9AJumlahPenyusutanKomersial: v.optional(decimalInput('Jumlah penyusutan komersial harta berwujud'), 0),
	l9BJumlahPenyusutanKomersial: v.optional(decimalInput('Jumlah penyusutan komersial bangunan'), 0),
	l9CJumlahAmortisasiKomersial: v.optional(decimalInput('Jumlah amortisasi komersial harta tidak berwujud'), 0)
});

type L9Input = v.InferOutput<typeof L9Schema>;

async function getJenisHartaId(kode: string) {
	const [jenisHarta] = await db
		.select({ id: jenis_harta_spt_pph_badan.id })
		.from(jenis_harta_spt_pph_badan)
		.where(and(eq(jenis_harta_spt_pph_badan.kode, kode), eq(jenis_harta_spt_pph_badan.aktif, true)))
		.limit(1);

	if (!jenisHarta) {
		error(400, 'Jenis harta tidak valid');
	}

	return jenisHarta.id;
}

export async function saveLampiranL9(tx: Transaction, sptPphBadanId: string, input: L9Input) {
	await tx
		.delete(spt_pph_badan_lampiran_9_harta)
		.where(eq(spt_pph_badan_lampiran_9_harta.sptPphBadanId, sptPphBadanId));

	for (const [index, row] of input.l9.entries()) {
		const jenisHartaId = await getJenisHartaId(row.jenisHarta);

		await tx.insert(spt_pph_badan_lampiran_9_harta).values({
			sptPphBadanId,
			nomorUrut: index + 1,
			jenisHartaId,
			kelompokPenyusutan: row.kelompokPenyusutan,
			kodeHarta: row.kodeHarta,
			bulanTahunPerolehan: row.bulanTahunPerolehan,
			hargaPerolehan: Number(row.hargaPerolehan),
			nilaiSisaBukuFiskalAwalTahun: Number(row.nilaiSisaBukuFiskalAwalTahun),
			metodePenyusutanKomersial: row.metodePenyusutanKomersial,
			metodePenyusutanFiskal: row.metodePenyusutanFiskal,
			penyusutanAmortisasiFiskalTahunIni: Number(row.penyusutanAmortisasiFiskalTahunIni),
			penyusutanAmortisasiKomersialTahunIni: Number(row.penyusutanAmortisasiKomersialTahunIni),
			akumulasiPenyusutanAmortisasiFiskal: Number(row.akumulasiPenyusutanAmortisasiFiskal),
			nilaiSisaBukuFiskalAkhirTahun: Number(row.nilaiSisaBukuFiskalAkhirTahun),
			keterangan: row.keterangan
		});
	}

	await tx
		.delete(spt_pph_badan_lampiran_9_ringkasan_komersial)
		.where(eq(spt_pph_badan_lampiran_9_ringkasan_komersial.sptPphBadanId, sptPphBadanId));

	await tx.insert(spt_pph_badan_lampiran_9_ringkasan_komersial).values({
		sptPphBadanId,
		jumlahPenyusutanKomersialA: Number(input.l9AJumlahPenyusutanKomersial),
		jumlahPenyusutanKomersialB: Number(input.l9BJumlahPenyusutanKomersial),
		jumlahAmortisasiKomersialC: Number(input.l9CJumlahAmortisasiKomersial)
	});
}
