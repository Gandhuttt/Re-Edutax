import { decimalInput, jsonRows, requiredString } from '$lib/helpers/valibot-schema';
import type { Transaction } from '$lib/server/db';
import { spt_pph_badan_lampiran_2_afiliasi, spt_pph_badan_lampiran_2_pihak } from '$lib/server/db/schema';
import { getNegaraId } from '../../getNegaraId.server';
import { and, eq } from 'drizzle-orm';
import * as v from 'valibot';

export const L2Schema = v.object({
	l2a: jsonRows(
		v.object({
			nama: requiredString('Nama'),
			alamat: v.optional(v.string(), ''),
			negara: v.optional(v.string(), ''),
			npwp: v.optional(v.string(), ''),
			jabatan: v.optional(v.string(), ''),
			nilaiModal: decimalInput('Nilai modal disetor'),
			persentase: decimalInput('Persentase modal disetor'),
			dividen: decimalInput('Dividen/pembagian laba')
		})
	),
	l2b: jsonRows(
		v.object({
			nama: requiredString('Nama'),
			negara: v.optional(v.string(), ''),
			npwp: v.optional(v.string(), ''),
			modalNilai: decimalInput('Penyertaan modal'),
			modalPersen: decimalInput('Penyertaan modal (%)'),
			utangNilai: decimalInput('Utang'),
			utangTahun: decimalInput('Tahun utang'),
			utangBunga: decimalInput('Bunga utang/tahun'),
			piutangNilai: decimalInput('Piutang'),
			piutangTahun: decimalInput('Tahun piutang'),
			piutangBunga: decimalInput('Bunga piutang/tahun')
		})
	)
});

type L2Input = v.InferOutput<typeof L2Schema>;

export async function saveLampiranL2(tx: Transaction, sptPphBadanId: string, input: L2Input) {
	await tx
		.delete(spt_pph_badan_lampiran_2_pihak)
		.where(
			and(
				eq(spt_pph_badan_lampiran_2_pihak.sptPphBadanId, sptPphBadanId),
				eq(spt_pph_badan_lampiran_2_pihak.jenis, 'pemegang_saham')
			)
		);

	for (const [index, row] of input.l2a.entries()) {
		const negaraId = row.negara ? await getNegaraId(row.negara) : null;

		await tx.insert(spt_pph_badan_lampiran_2_pihak).values({
			sptPphBadanId,
			jenis: 'pemegang_saham',
			nomorUrut: index + 1,
			nama: row.nama,
			alamat: row.alamat,
			negaraId,
			npwpNikTin: row.npwp,
			jabatan: row.jabatan,
			modalSahamNominal: Number(row.nilaiModal),
			modalSahamPersentase: Number(row.persentase),
			dividenDiterima: Number(row.dividen)
		});
	}

	await tx
		.delete(spt_pph_badan_lampiran_2_afiliasi)
		.where(eq(spt_pph_badan_lampiran_2_afiliasi.sptPphBadanId, sptPphBadanId));

	for (const [index, row] of input.l2b.entries()) {
		const negaraId = row.negara ? await getNegaraId(row.negara) : null;

		await tx.insert(spt_pph_badan_lampiran_2_afiliasi).values({
			sptPphBadanId,
			nomorUrut: index + 1,
			namaPihakAfiliasi: row.nama,
			negaraId,
			npwpTin: row.npwp,
			penyertaanModalNilai: Number(row.modalNilai),
			penyertaanModalPersentase: Number(row.modalPersen),
			utangNilai: Number(row.utangNilai),
			utangTahun: Number(row.utangTahun),
			utangBungaPersentase: Number(row.utangBunga),
			piutangNilai: Number(row.piutangNilai),
			piutangTahun: Number(row.piutangTahun),
			piutangBungaPersentase: Number(row.piutangBunga)
		});
	}
}
