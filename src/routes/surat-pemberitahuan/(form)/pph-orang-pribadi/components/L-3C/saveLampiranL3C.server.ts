import { decimalInput, jsonRows } from '$lib/helpers/valibot-schema';
import { db, type Statement } from '$lib/server/db';
import {
	spt_pph_orang_pribadi_lampiran_3c,
	spt_pph_orang_pribadi_lampiran_3c_baris
} from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';

// Every row carries the tableIndex of the sub-grid it came from, so the twelve
// grids round-trip through one array.
export const L3CSchema = v.object({
	l3cBaris: jsonRows(
		v.object({
			tableIndex: v.number('Table index harus berupa angka'),
			kodeHarta: v.optional(v.string(), ''),
			jenisHarta: v.optional(v.string(), ''),
			bulanPerolehan: v.optional(v.number(), 0),
			tahunPerolehan: v.optional(v.number(), 0),
			hargaPerolehan: v.optional(decimalInput('Harga perolehan'), 0),
			nilaiSisaBukuFiskal: v.optional(decimalInput('Nilai sisa buku fiskal awal tahun'), 0),
			metodeKomersial: v.optional(v.string(), ''),
			metodeFiskal: v.optional(v.string(), ''),
			penyusutanFiskalTahunIni: v.optional(decimalInput('Penyusutan/amortisasi fiskal tahun ini'), 0),
			keterangan: v.optional(v.string(), '')
		})
	),
	l3cTotalPenyusutanKomersial: v.optional(decimalInput('Jumlah penyusutan komersial'), 0),
	l3cTotalAmortisasiKomersial: v.optional(decimalInput('Jumlah amortisasi komersial'), 0)
});

type L3CInput = v.InferOutput<typeof L3CSchema>;

export function saveLampiranL3C(sptId: string, input: L3CInput) {
	const statements: Statement[] = [
		db
			.delete(spt_pph_orang_pribadi_lampiran_3c_baris)
			.where(eq(spt_pph_orang_pribadi_lampiran_3c_baris.sptPphOrangPribadiId, sptId)),
		db
			.delete(spt_pph_orang_pribadi_lampiran_3c)
			.where(eq(spt_pph_orang_pribadi_lampiran_3c.sptPphOrangPribadiId, sptId))
	];

	// nomorUrut restarts within each sub-grid, matching Coretax, where each grid
	// is its own component with its own row numbering.
	const urutPerTabel = new Map<number, number>();
	for (const row of input.l3cBaris) {
		const urut = (urutPerTabel.get(row.tableIndex) ?? 0) + 1;
		urutPerTabel.set(row.tableIndex, urut);

		statements.push(
			db.insert(spt_pph_orang_pribadi_lampiran_3c_baris).values({
				sptPphOrangPribadiId: sptId,
				tableIndex: row.tableIndex,
				nomorUrut: urut,
				kodeHarta: row.kodeHarta,
				jenisHarta: row.jenisHarta,
				bulanPerolehan: row.bulanPerolehan,
				tahunPerolehan: row.tahunPerolehan,
				hargaPerolehan: Number(row.hargaPerolehan),
				nilaiSisaBukuFiskal: Number(row.nilaiSisaBukuFiskal),
				metodeKomersial: row.metodeKomersial,
				metodeFiskal: row.metodeFiskal,
				penyusutanFiskalTahunIni: Number(row.penyusutanFiskalTahunIni),
				keterangan: row.keterangan
			})
		);
	}

	// The two commercial totals are typed, not derived, so they are stored even
	// when no rows exist.
	statements.push(
		db.insert(spt_pph_orang_pribadi_lampiran_3c).values({
			sptPphOrangPribadiId: sptId,
			totalPenyusutanKomersial: Number(input.l3cTotalPenyusutanKomersial),
			totalAmortisasiKomersial: Number(input.l3cTotalAmortisasiKomersial)
		})
	);

	// Deliberately returns no Induk figure: Coretax never patches a valueXX from
	// L3CForm, so nothing here feeds a computed row.
	return { statements };
}
