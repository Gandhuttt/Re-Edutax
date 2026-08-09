import { db } from '$lib/server/db';
import { spt_pph_badan_lampiran_10d_dokumen } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function getLampiranL10D(sptPphBadanId: string) {
	const [dokumen] = await db
		.select({
			dokumenIndukA: spt_pph_badan_lampiran_10d_dokumen.dokumenIndukA,
			dokumenIndukB: spt_pph_badan_lampiran_10d_dokumen.dokumenIndukB,
			dokumenIndukC: spt_pph_badan_lampiran_10d_dokumen.dokumenIndukC,
			dokumenIndukD: spt_pph_badan_lampiran_10d_dokumen.dokumenIndukD,
			dokumenIndukE: spt_pph_badan_lampiran_10d_dokumen.dokumenIndukE,
			dokumenLokalA: spt_pph_badan_lampiran_10d_dokumen.dokumenLokalA,
			dokumenLokalB: spt_pph_badan_lampiran_10d_dokumen.dokumenLokalB,
			dokumenLokalC: spt_pph_badan_lampiran_10d_dokumen.dokumenLokalC,
			dokumenLokalD: spt_pph_badan_lampiran_10d_dokumen.dokumenLokalD,
			dokumenLokalE: spt_pph_badan_lampiran_10d_dokumen.dokumenLokalE,
			tanggalDokumenIndukTersedia: spt_pph_badan_lampiran_10d_dokumen.tanggalDokumenIndukTersedia,
			tanggalDokumenLokalTersedia: spt_pph_badan_lampiran_10d_dokumen.tanggalDokumenLokalTersedia
		})
		.from(spt_pph_badan_lampiran_10d_dokumen)
		.where(eq(spt_pph_badan_lampiran_10d_dokumen.sptPphBadanId, sptPphBadanId));

	return {
		dokumenIndukA: dokumen?.dokumenIndukA ?? null,
		dokumenIndukB: dokumen?.dokumenIndukB ?? null,
		dokumenIndukC: dokumen?.dokumenIndukC ?? null,
		dokumenIndukD: dokumen?.dokumenIndukD ?? null,
		dokumenIndukE: dokumen?.dokumenIndukE ?? null,
		dokumenLokalA: dokumen?.dokumenLokalA ?? null,
		dokumenLokalB: dokumen?.dokumenLokalB ?? null,
		dokumenLokalC: dokumen?.dokumenLokalC ?? null,
		dokumenLokalD: dokumen?.dokumenLokalD ?? null,
		dokumenLokalE: dokumen?.dokumenLokalE ?? null,
		tanggalDokumenIndukTersedia: dokumen?.tanggalDokumenIndukTersedia ?? '',
		tanggalDokumenLokalTersedia: dokumen?.tanggalDokumenLokalTersedia ?? ''
	};
}
