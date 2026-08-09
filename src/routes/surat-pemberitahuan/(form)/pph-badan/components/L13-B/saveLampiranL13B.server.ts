import { decimalInput, jsonRows } from '$lib/helpers/valibot-schema';
import type { Transaction } from '$lib/server/db';
import {
	spt_pph_badan_lampiran_13b_a_kerjasama,
	spt_pph_badan_lampiran_13b_b_biaya,
	spt_pph_badan_lampiran_13b_c_litbang,
	spt_pph_badan_lampiran_13b_d_penghitungan
} from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';
import { L13B_BIAYA_KODE, L13B_BIAYA_NAMA } from './biayaKode';

export const L13BSchema = v.object({
	l13bA: jsonRows(
		v.object({
			perjanjianNomor: v.optional(v.string(), ''),
			perjanjianTanggal: v.optional(v.string(), ''),
			mitraKegiatan: v.optional(v.string(), ''),
			keterangan: v.optional(v.string(), '')
		})
	),
	l13bB: jsonRows(
		v.object({
			kode: v.picklist(Object.values(L13B_BIAYA_KODE), 'Kode biaya tidak valid'),
			nilai: v.optional(decimalInput('Jumlah biaya'), 0)
		})
	),
	l13bC: jsonRows(
		v.object({
			nomorProposal: v.optional(v.string(), ''),
			jangkaWaktuDariTahun: v.optional(decimalInput('Jangka waktu dari tahun'), 0),
			jangkaWaktuSampaiTahun: v.optional(decimalInput('Jangka waktu sampai tahun'), 0),
			jumlahBiaya: v.optional(decimalInput('Jumlah biaya'), 0),
			tahunPerolehanHki: v.optional(decimalInput('Tahun perolehan HKI/komersialisasi'), 0),
			persentaseFasilitasPajak: v.optional(decimalInput('Persentase fasilitas pajak'), 0)
		})
	),
	l13bDTermanfaatkanTahunSebelumnya: v.optional(
		decimalInput('Jumlah tambahan pengurangan yang termanfaatkan tahun-tahun sebelumnya'),
		0
	)
});

type L13BInput = v.InferOutput<typeof L13BSchema>;

export async function saveLampiranL13B(tx: Transaction, sptPphBadanId: string, input: L13BInput) {
	await tx
		.delete(spt_pph_badan_lampiran_13b_a_kerjasama)
		.where(eq(spt_pph_badan_lampiran_13b_a_kerjasama.sptPphBadanId, sptPphBadanId));

	for (const [index, row] of input.l13bA.entries()) {
		await tx.insert(spt_pph_badan_lampiran_13b_a_kerjasama).values({
			sptPphBadanId,
			nomorUrut: index + 1,
			perjanjianNomor: row.perjanjianNomor,
			perjanjianTanggal: row.perjanjianTanggal,
			mitraKegiatan: row.mitraKegiatan,
			keterangan: row.keterangan
		});
	}

	await tx
		.delete(spt_pph_badan_lampiran_13b_b_biaya)
		.where(eq(spt_pph_badan_lampiran_13b_b_biaya.sptPphBadanId, sptPphBadanId));

	for (const row of input.l13bB) {
		await tx.insert(spt_pph_badan_lampiran_13b_b_biaya).values({
			sptPphBadanId,
			kode: row.kode,
			nama: L13B_BIAYA_NAMA[row.kode],
			nilai: Number(row.nilai)
		});
	}

	await tx
		.delete(spt_pph_badan_lampiran_13b_c_litbang)
		.where(eq(spt_pph_badan_lampiran_13b_c_litbang.sptPphBadanId, sptPphBadanId));

	for (const [index, row] of input.l13bC.entries()) {
		const jumlahBiaya = Number(row.jumlahBiaya);
		const persentaseFasilitasPajak = Number(row.persentaseFasilitasPajak);
		const tambahanPengurang = Math.round((jumlahBiaya * persentaseFasilitasPajak) / 100);

		await tx.insert(spt_pph_badan_lampiran_13b_c_litbang).values({
			sptPphBadanId,
			nomorUrut: index + 1,
			nomorProposal: row.nomorProposal,
			jangkaWaktuDariTahun: Number(row.jangkaWaktuDariTahun) || null,
			jangkaWaktuSampaiTahun: Number(row.jangkaWaktuSampaiTahun) || null,
			jumlahBiaya,
			tahunPerolehanHki: Number(row.tahunPerolehanHki) || null,
			persentaseFasilitasPajak,
			tambahanPengurang
		});
	}

	await tx
		.delete(spt_pph_badan_lampiran_13b_d_penghitungan)
		.where(eq(spt_pph_badan_lampiran_13b_d_penghitungan.sptPphBadanId, sptPphBadanId));

	await tx.insert(spt_pph_badan_lampiran_13b_d_penghitungan).values({
		sptPphBadanId,
		termanfaatkanTahunSebelumnya: Number(input.l13bDTermanfaatkanTahunSebelumnya)
	});
}
