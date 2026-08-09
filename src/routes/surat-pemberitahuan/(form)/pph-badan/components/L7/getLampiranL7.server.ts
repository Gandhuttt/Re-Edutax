import { db } from '$lib/server/db';
import { spt_pph_badan_lampiran_7_kompensasi_kerugian } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function getLampiranL7(sptPphBadanId: string, tahunPajak: number) {
	const komponen = await db
		.select({
			tahunPajak: spt_pph_badan_lampiran_7_kompensasi_kerugian.tahunPajak,
			labaRugiNetoFiskal: spt_pph_badan_lampiran_7_kompensasi_kerugian.labaRugiNetoFiskal,
			kompensasiYMin4: spt_pph_badan_lampiran_7_kompensasi_kerugian.kompensasiYMin4,
			kompensasiYMin3: spt_pph_badan_lampiran_7_kompensasi_kerugian.kompensasiYMin3,
			kompensasiYMin2: spt_pph_badan_lampiran_7_kompensasi_kerugian.kompensasiYMin2,
			kompensasiYMin1: spt_pph_badan_lampiran_7_kompensasi_kerugian.kompensasiYMin1,
			kompensasiTahunIni: spt_pph_badan_lampiran_7_kompensasi_kerugian.kompensasiTahunIni,
			kompensasiYPlus1: spt_pph_badan_lampiran_7_kompensasi_kerugian.kompensasiYPlus1
		})
		.from(spt_pph_badan_lampiran_7_kompensasi_kerugian)
		.where(eq(spt_pph_badan_lampiran_7_kompensasi_kerugian.sptPphBadanId, sptPphBadanId));

	const byTahunPajak = new Map(komponen.map((row) => [row.tahunPajak, row]));

	return Array.from({ length: 10 }, (_, i) => {
		const tahun = tahunPajak - (9 - i);
		const existing = byTahunPajak.get(tahun);
		return {
			tahunPajak: tahun,
			labaRugiNetoFiskal: existing?.labaRugiNetoFiskal ?? 0,
			kompensasiYMin4: existing?.kompensasiYMin4 ?? 0,
			kompensasiYMin3: existing?.kompensasiYMin3 ?? 0,
			kompensasiYMin2: existing?.kompensasiYMin2 ?? 0,
			kompensasiYMin1: existing?.kompensasiYMin1 ?? 0,
			kompensasiTahunIni: existing?.kompensasiTahunIni ?? 0,
			kompensasiYPlus1: existing?.kompensasiYPlus1 ?? 0
		};
	});
}
