import { booleanRadio } from '$lib/helpers/valibot-schema';
import type { Transaction } from '$lib/server/db';
import { spt_pph_badan_lampiran_10b_pernyataan } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';

export const L10BSchema = v.object({
	l10bHubunganA: v.optional(booleanRadio(false), false),
	l10bHubunganB: v.optional(booleanRadio(false), false),
	l10bHubunganC: v.optional(booleanRadio(false), false),
	l10bHubunganD: v.optional(booleanRadio(false), false),
	l10bTransaksiA: v.optional(booleanRadio(false), false),
	l10bTransaksiB: v.optional(booleanRadio(false), false),
	l10bTransaksiC: v.optional(booleanRadio(false), false),
	l10bDokumentasiA: v.optional(booleanRadio(false), false),
	l10bDokumentasiB: v.optional(booleanRadio(false), false),
	l10bDokumentasiC: v.optional(booleanRadio(false), false),
	l10bDokumentasiD: v.optional(booleanRadio(false), false),
	l10bDokumentasiE: v.optional(booleanRadio(false), false),
	l10bDokumenA: v.optional(booleanRadio(false), false),
	l10bDokumenB: v.optional(booleanRadio(false), false),
	l10bDokumenC: v.optional(booleanRadio(false), false)
});

type L10BInput = v.InferOutput<typeof L10BSchema>;

export async function saveLampiranL10B(tx: Transaction, sptPphBadanId: string, input: L10BInput) {
	await tx
		.delete(spt_pph_badan_lampiran_10b_pernyataan)
		.where(eq(spt_pph_badan_lampiran_10b_pernyataan.sptPphBadanId, sptPphBadanId));

	await tx.insert(spt_pph_badan_lampiran_10b_pernyataan).values({
		sptPphBadanId,
		hubunganA: input.l10bHubunganA,
		hubunganB: input.l10bHubunganB,
		hubunganC: input.l10bHubunganC,
		hubunganD: input.l10bHubunganD,
		transaksiA: input.l10bTransaksiA,
		transaksiB: input.l10bTransaksiB,
		transaksiC: input.l10bTransaksiC,
		dokumentasiA: input.l10bDokumentasiA,
		dokumentasiB: input.l10bDokumentasiB,
		dokumentasiC: input.l10bDokumentasiC,
		dokumentasiD: input.l10bDokumentasiD,
		dokumentasiE: input.l10bDokumentasiE,
		dokumenA: input.l10bDokumenA,
		dokumenB: input.l10bDokumenB,
		dokumenC: input.l10bDokumenC
	});
}
