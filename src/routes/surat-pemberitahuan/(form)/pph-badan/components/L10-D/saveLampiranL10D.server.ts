import { booleanRadio } from '$lib/helpers/valibot-schema';
import type { Transaction } from '$lib/server/db';
import { spt_pph_badan_lampiran_10d_dokumen } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';

export const L10DSchema = v.object({
	l10dDokumenIndukA: v.optional(booleanRadio(false), false),
	l10dDokumenIndukB: v.optional(booleanRadio(false), false),
	l10dDokumenIndukC: v.optional(booleanRadio(false), false),
	l10dDokumenIndukD: v.optional(booleanRadio(false), false),
	l10dDokumenIndukE: v.optional(booleanRadio(false), false),
	l10dDokumenLokalA: v.optional(booleanRadio(false), false),
	l10dDokumenLokalB: v.optional(booleanRadio(false), false),
	l10dDokumenLokalC: v.optional(booleanRadio(false), false),
	l10dDokumenLokalD: v.optional(booleanRadio(false), false),
	l10dDokumenLokalE: v.optional(booleanRadio(false), false),
	l10dTanggalDokumenIndukTersedia: v.optional(v.string(), ''),
	l10dTanggalDokumenLokalTersedia: v.optional(v.string(), '')
});

type L10DInput = v.InferOutput<typeof L10DSchema>;

export async function saveLampiranL10D(tx: Transaction, sptPphBadanId: string, input: L10DInput) {
	await tx
		.delete(spt_pph_badan_lampiran_10d_dokumen)
		.where(eq(spt_pph_badan_lampiran_10d_dokumen.sptPphBadanId, sptPphBadanId));

	await tx.insert(spt_pph_badan_lampiran_10d_dokumen).values({
		sptPphBadanId,
		dokumenIndukA: input.l10dDokumenIndukA,
		dokumenIndukB: input.l10dDokumenIndukB,
		dokumenIndukC: input.l10dDokumenIndukC,
		dokumenIndukD: input.l10dDokumenIndukD,
		dokumenIndukE: input.l10dDokumenIndukE,
		dokumenLokalA: input.l10dDokumenLokalA,
		dokumenLokalB: input.l10dDokumenLokalB,
		dokumenLokalC: input.l10dDokumenLokalC,
		dokumenLokalD: input.l10dDokumenLokalD,
		dokumenLokalE: input.l10dDokumenLokalE,
		tanggalDokumenIndukTersedia: input.l10dTanggalDokumenIndukTersedia,
		tanggalDokumenLokalTersedia: input.l10dTanggalDokumenLokalTersedia
	});
}
