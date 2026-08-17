import { decimalInput } from '$lib/helpers/valibot-schema';
import { db, type Statement } from '$lib/server/db';
import { spt_pph_orang_pribadi_lampiran_4 } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';

// Same PTKP picklist as Induk row 5 (c5PtkpStatus in saveSptPphOrangPribadi.remote.ts).
const ptkpPicklist = v.union([
	v.picklist([
		'tk_0',
		'tk_1',
		'tk_2',
		'tk_3',
		'k_0',
		'k_1',
		'k_2',
		'k_3',
		'k_i_0',
		'k_i_1',
		'k_i_2',
		'k_i_3',
		'tidak_berlaku'
	]),
	v.literal('')
]);

// Bagian A: only the six real manual inputs are accepted here. Confirmed
// 2026-08-18 against the live form (see L4.md): Jumlah penghasilan neto,
// Penghasilan Kena Pajak, Pajak Terutang, PPh yang harus dibayar and
// Angsuran PPh Pasal 25 are all DERIVED, computed client-side via
// hitungLampiranL4, and are never submitted or persisted as independent
// fields.
//
// Bagian B: same treatment, gated on Induk row 7 (ph/mt) rather than 13b.
// Penghasilan Bruto (both columns) is a real manual input despite being
// confirmed disconnected from every computation, see L4.md. Every gabungan
// figure (neto gabungan, PKP gabungan, PPh terutang gabungan, the two
// proportional splits) is DERIVED via hitungLampiranL4SectionB and never
// submitted here, same rule as Bagian A.
export const L4Schema = v.object({
	l4PenghasilanNeto: v.optional(decimalInput('Penghasilan neto'), 0),
	l4KompensasiKerugian: v.optional(decimalInput('Kompensasi kerugian tahun berikutnya'), 0),
	l4ZakatSumbangan: v.optional(
		decimalInput('Zakat/sumbangan keagamaan yang bersifat wajib'),
		0
	),
	l4PtkpStatus: v.optional(ptkpPicklist, ''),
	l4PengurangPphTerutang: v.optional(decimalInput('Pengurang PPh Terutang'), 0),
	l4KreditPajak: v.optional(decimalInput('Kredit pajak'), 0),
	l4BrutoWp: v.optional(decimalInput('Penghasilan Bruto (WP)'), 0),
	l4BrutoSuamiIstri: v.optional(decimalInput('Penghasilan Bruto (Suami/Istri)'), 0),
	l4NetoSuamiIstri: v.optional(decimalInput('Penghasilan Neto (Suami/Istri)'), 0),
	l4SetelahDikurangiSuamiIstri: v.optional(
		decimalInput('Penghasilan neto setelah dikurangi zakat/kompensasi (Suami/Istri)'),
		0
	),
	l4PtkpGabunganStatus: v.optional(ptkpPicklist, ''),
	l4NamaSuamiIstri: v.optional(v.string(), '')
});

type L4Input = v.InferOutput<typeof L4Schema>;

// Neither Bagian A nor Bagian B feed the Induk chain: their own derived
// figures are computed client-side from these manual inputs (via
// hitungLampiranL4 / hitungLampiranL4SectionB) and are not persisted, so
// this save step is a straight persist of manual inputs only, no derived
// figures reported upward, same treatment as L-3B.
export function saveLampiranL4(sptId: string, input: L4Input) {
	const statements: Statement[] = [
		db
			.delete(spt_pph_orang_pribadi_lampiran_4)
			.where(eq(spt_pph_orang_pribadi_lampiran_4.sptPphOrangPribadiId, sptId))
	];

	statements.push(
		db.insert(spt_pph_orang_pribadi_lampiran_4).values({
			sptPphOrangPribadiId: sptId,
			penghasilanNeto: Math.round(Number(input.l4PenghasilanNeto)),
			kompensasiKerugian: Math.round(Number(input.l4KompensasiKerugian)),
			zakatSumbangan: Math.round(Number(input.l4ZakatSumbangan)),
			ptkpStatus: input.l4PtkpStatus || null,
			pengurangPphTerutang: Math.round(Number(input.l4PengurangPphTerutang)),
			kreditPajak: Math.round(Number(input.l4KreditPajak)),
			brutoWp: Math.round(Number(input.l4BrutoWp)),
			brutoSuamiIstri: Math.round(Number(input.l4BrutoSuamiIstri)),
			netoSuamiIstri: Math.round(Number(input.l4NetoSuamiIstri)),
			setelahDikurangiSuamiIstri: Math.round(Number(input.l4SetelahDikurangiSuamiIstri)),
			ptkpGabunganStatus: input.l4PtkpGabunganStatus || null,
			namaSuamiIstri: input.l4NamaSuamiIstri || null
		})
	);

	return { statements };
}
