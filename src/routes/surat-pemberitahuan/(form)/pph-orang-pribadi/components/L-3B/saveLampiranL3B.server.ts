import { decimalInput, jsonRows } from '$lib/helpers/valibot-schema';
import { db, type Statement } from '$lib/server/db';
import {
	spt_pph_orang_pribadi_lampiran_3b_bulanan,
	spt_pph_orang_pribadi_lampiran_3b_tku
} from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';

export const L3BSchema = v.object({
	l3bTkuNama: v.optional(v.string(), ''),
	l3bTkuAlamat: v.optional(v.string(), ''),
	l3bTkuKelurahan: v.optional(v.string(), ''),
	l3bTkuKecamatan: v.optional(v.string(), ''),
	l3bTkuKabupaten: v.optional(v.string(), ''),
	l3bTkuProvinsi: v.optional(v.string(), ''),
	l3bTkuJenisUsahaPekerjaanBebas: v.optional(v.string(), ''),
	l3bTkuNormaPersen: v.optional(decimalInput('Norma'), 0),

	l3bA: jsonRows(
		v.object({
			bulan: v.number('Bulan harus berupa angka'),
			peredaranBruto: v.optional(decimalInput('Peredaran bruto'), 0),
			disetorSendiri: v.optional(decimalInput('PPh final disetor sendiri'), 0),
			dipotongPihakLain: v.optional(decimalInput('PPh final dipotong/dipungut pihak lain'), 0)
		})
	),
	l3bB: jsonRows(
		v.object({
			bulan: v.number('Bulan harus berupa angka'),
			peredaranBruto: v.optional(decimalInput('Peredaran bruto'), 0)
		})
	),
	l3bC: jsonRows(
		v.object({
			bulan: v.number('Bulan harus berupa angka'),
			peredaranBruto: v.optional(decimalInput('Peredaran bruto'), 0)
		})
	)
});

type L3BInput = v.InferOutput<typeof L3BSchema>;

// L-3B does not feed the Induk chain at all (verified in L3B.md: 1.b.5 and row
// 2 are unaffected even with Section A fully populated), so this returns only
// statements, no derived figures.
export function saveLampiranL3B(sptId: string, input: L3BInput) {
	const statements: Statement[] = [
		db
			.delete(spt_pph_orang_pribadi_lampiran_3b_tku)
			.where(eq(spt_pph_orang_pribadi_lampiran_3b_tku.sptPphOrangPribadiId, sptId)),
		db
			.delete(spt_pph_orang_pribadi_lampiran_3b_bulanan)
			.where(eq(spt_pph_orang_pribadi_lampiran_3b_bulanan.sptPphOrangPribadiId, sptId))
	];

	// The TKU registry row always exists, even blank, since it is the header
	// identity record every section's grid is seeded from.
	statements.push(
		db.insert(spt_pph_orang_pribadi_lampiran_3b_tku).values({
			sptPphOrangPribadiId: sptId,
			nama: input.l3bTkuNama,
			alamat: input.l3bTkuAlamat,
			kelurahan: input.l3bTkuKelurahan,
			kecamatan: input.l3bTkuKecamatan,
			kabupaten: input.l3bTkuKabupaten,
			provinsi: input.l3bTkuProvinsi,
			jenisUsahaPekerjaanBebas: input.l3bTkuJenisUsahaPekerjaanBebas,
			normaPersen: Math.round(Number(input.l3bTkuNormaPersen))
		})
	);

	for (const row of input.l3bA) {
		if (!Number(row.peredaranBruto) && !Number(row.disetorSendiri) && !Number(row.dipotongPihakLain)) {
			continue;
		}
		statements.push(
			db.insert(spt_pph_orang_pribadi_lampiran_3b_bulanan).values({
				sptPphOrangPribadiId: sptId,
				seksi: 'A',
				bulan: row.bulan,
				peredaranBruto: Math.round(Number(row.peredaranBruto)),
				disetorSendiri: Math.round(Number(row.disetorSendiri)),
				dipotongPihakLain: Math.round(Number(row.dipotongPihakLain))
			})
		);
	}

	for (const row of input.l3bB) {
		if (!Number(row.peredaranBruto)) continue;
		statements.push(
			db.insert(spt_pph_orang_pribadi_lampiran_3b_bulanan).values({
				sptPphOrangPribadiId: sptId,
				seksi: 'B',
				bulan: row.bulan,
				peredaranBruto: Math.round(Number(row.peredaranBruto))
			})
		);
	}

	for (const row of input.l3bC) {
		if (!Number(row.peredaranBruto)) continue;
		statements.push(
			db.insert(spt_pph_orang_pribadi_lampiran_3b_bulanan).values({
				sptPphOrangPribadiId: sptId,
				seksi: 'C',
				bulan: row.bulan,
				peredaranBruto: Math.round(Number(row.peredaranBruto))
			})
		);
	}

	return { statements };
}
