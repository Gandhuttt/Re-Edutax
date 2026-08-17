import { decimalInput, jsonRows } from '$lib/helpers/valibot-schema';
import { db, type Statement } from '$lib/server/db';
import {
	spt_pph_orang_pribadi_lampiran_5_kompensasi_kerugian,
	spt_pph_orang_pribadi_lampiran_5_pengurang_neto,
	spt_pph_orang_pribadi_lampiran_5_pengurang_pph
} from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';

// labaRugiNetoFiskal is the one field on the whole form confirmed to accept a
// negative amount, so it is not run through decimalInput (which requires an
// unsigned numeric string).
export const L5Schema = v.object({
	l5Kompensasi: jsonRows(
		v.object({
			tahunPajak: v.number('Tahun pajak harus berupa angka'),
			labaRugiNetoFiskal: v.optional(v.number(), 0),
			kompensasiYMin4: v.optional(decimalInput('Kompensasi kerugian fiskal Y-4'), 0),
			kompensasiYMin3: v.optional(decimalInput('Kompensasi kerugian fiskal Y-3'), 0),
			kompensasiYMin2: v.optional(decimalInput('Kompensasi kerugian fiskal Y-2'), 0),
			kompensasiYMin1: v.optional(decimalInput('Kompensasi kerugian fiskal Y-1'), 0),
			kompensasiTahunIni: v.optional(decimalInput('Kompensasi kerugian fiskal tahun pajak ini'), 0),
			kompensasiYPlus1: v.optional(decimalInput('Kompensasi kerugian fiskal Y+1'), 0)
		})
	),
	l5PengurangNeto: jsonRows(
		v.object({
			kode: v.optional(v.string(), ''),
			jenisPengurang: v.optional(v.string(), ''),
			jumlah: v.optional(decimalInput('Jumlah pengurang penghasilan neto'), 0)
		})
	),
	l5PengurangPph: jsonRows(
		v.object({
			kode: v.optional(v.string(), ''),
			jenisPengurang: v.optional(v.string(), ''),
			jumlah: v.optional(decimalInput('Jumlah pengurang PPh terutang'), 0)
		})
	)
});

type L5Input = v.InferOutput<typeof L5Schema>;

export function saveLampiranL5(sptId: string, input: L5Input) {
	const statements: Statement[] = [
		db
			.delete(spt_pph_orang_pribadi_lampiran_5_kompensasi_kerugian)
			.where(eq(spt_pph_orang_pribadi_lampiran_5_kompensasi_kerugian.sptPphOrangPribadiId, sptId)),
		db
			.delete(spt_pph_orang_pribadi_lampiran_5_pengurang_neto)
			.where(eq(spt_pph_orang_pribadi_lampiran_5_pengurang_neto.sptPphOrangPribadiId, sptId)),
		db
			.delete(spt_pph_orang_pribadi_lampiran_5_pengurang_pph)
			.where(eq(spt_pph_orang_pribadi_lampiran_5_pengurang_pph.sptPphOrangPribadiId, sptId))
	];

	// Only rows with a nonzero figure are persisted: the ten-row matrix is
	// regenerated on load regardless (see getLampiranL5), so an all-zero row
	// carries nothing worth storing.
	for (const row of input.l5Kompensasi) {
		const kosong =
			!row.labaRugiNetoFiskal &&
			!Number(row.kompensasiYMin4) &&
			!Number(row.kompensasiYMin3) &&
			!Number(row.kompensasiYMin2) &&
			!Number(row.kompensasiYMin1) &&
			!Number(row.kompensasiTahunIni) &&
			!Number(row.kompensasiYPlus1);
		if (kosong) continue;

		statements.push(
			db.insert(spt_pph_orang_pribadi_lampiran_5_kompensasi_kerugian).values({
				sptPphOrangPribadiId: sptId,
				tahunPajak: row.tahunPajak,
				labaRugiNetoFiskal: Math.round(Number(row.labaRugiNetoFiskal)),
				kompensasiYMin4: Number(row.kompensasiYMin4),
				kompensasiYMin3: Number(row.kompensasiYMin3),
				kompensasiYMin2: Number(row.kompensasiYMin2),
				kompensasiYMin1: Number(row.kompensasiYMin1),
				kompensasiTahunIni: Number(row.kompensasiTahunIni),
				kompensasiYPlus1: Number(row.kompensasiYPlus1)
			})
		);
	}

	for (const row of input.l5PengurangNeto) {
		statements.push(
			db.insert(spt_pph_orang_pribadi_lampiran_5_pengurang_neto).values({
				sptPphOrangPribadiId: sptId,
				nomorUrut: input.l5PengurangNeto.indexOf(row) + 1,
				kode: row.kode,
				jenisPengurang: row.jenisPengurang,
				jumlah: Number(row.jumlah)
			})
		);
	}

	for (const row of input.l5PengurangPph) {
		statements.push(
			db.insert(spt_pph_orang_pribadi_lampiran_5_pengurang_pph).values({
				sptPphOrangPribadiId: sptId,
				nomorUrut: input.l5PengurangPph.indexOf(row) + 1,
				kode: row.kode,
				jenisPengurang: row.jenisPengurang,
				jumlah: Number(row.jumlah)
			})
		);
	}

	// Row 3 is L-5 A's tahun-pajak-ini column plus the whole of Bagian B.
	const kompensasiTahunIni = input.l5Kompensasi.reduce(
		(sum, row) => sum + Number(row.kompensasiTahunIni),
		0
	);
	const pengurangNeto = input.l5PengurangNeto.reduce((sum, row) => sum + Number(row.jumlah), 0);
	const n3 = kompensasiTahunIni + pengurangNeto;

	const n8 = input.l5PengurangPph.reduce((sum, row) => sum + Number(row.jumlah), 0);

	return { statements, n3, n8 };
}
