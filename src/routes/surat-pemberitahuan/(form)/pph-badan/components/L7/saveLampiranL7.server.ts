import { decimalInput, jsonRows } from '$lib/helpers/valibot-schema';
import type { Transaction } from '$lib/server/db';
import { spt_pph_badan_lampiran_7_kompensasi_kerugian } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';

export const L7Schema = v.object({
	l7: jsonRows(
		v.object({
			tahunPajak: v.number('Tahun pajak harus berupa angka'),
			labaRugiNetoFiskal: v.optional(decimalInput('Laba (rugi) neto fiskal'), 0),
			kompensasiYMin4: v.optional(decimalInput('Kompensasi kerugian fiskal Y-4'), 0),
			kompensasiYMin3: v.optional(decimalInput('Kompensasi kerugian fiskal Y-3'), 0),
			kompensasiYMin2: v.optional(decimalInput('Kompensasi kerugian fiskal Y-2'), 0),
			kompensasiYMin1: v.optional(decimalInput('Kompensasi kerugian fiskal Y-1'), 0),
			kompensasiTahunIni: v.optional(decimalInput('Kompensasi kerugian fiskal tahun pajak ini'), 0),
			kompensasiYPlus1: v.optional(decimalInput('Kompensasi kerugian fiskal Y+1'), 0)
		})
	)
});

type L7Input = v.InferOutput<typeof L7Schema>;

export async function saveLampiranL7(tx: Transaction, sptPphBadanId: string, input: L7Input) {
	await tx
		.delete(spt_pph_badan_lampiran_7_kompensasi_kerugian)
		.where(eq(spt_pph_badan_lampiran_7_kompensasi_kerugian.sptPphBadanId, sptPphBadanId));

	for (const row of input.l7) {
		await tx.insert(spt_pph_badan_lampiran_7_kompensasi_kerugian).values({
			sptPphBadanId,
			tahunPajak: row.tahunPajak,
			labaRugiNetoFiskal: Number(row.labaRugiNetoFiskal),
			kompensasiYMin4: Number(row.kompensasiYMin4),
			kompensasiYMin3: Number(row.kompensasiYMin3),
			kompensasiYMin2: Number(row.kompensasiYMin2),
			kompensasiYMin1: Number(row.kompensasiYMin1),
			kompensasiTahunIni: Number(row.kompensasiTahunIni),
			kompensasiYPlus1: Number(row.kompensasiYPlus1)
		});
	}
}
