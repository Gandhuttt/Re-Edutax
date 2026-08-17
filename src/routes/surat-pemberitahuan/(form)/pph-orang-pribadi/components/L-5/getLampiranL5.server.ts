import { db } from '$lib/server/db';
import {
	spt_pph_orang_pribadi_lampiran_5_kompensasi_kerugian,
	spt_pph_orang_pribadi_lampiran_5_pengurang_neto,
	spt_pph_orang_pribadi_lampiran_5_pengurang_pph
} from '$lib/server/db/schema';
import { asc, eq } from 'drizzle-orm';

// Bagian A is a fixed ten-row matrix (tahun pajak and the nine years before
// it), always present regardless of what is stored. Missing rows are filled
// with zeros rather than only returning the rows that happen to exist, same
// pattern as SPT Badan's getLampiranL7.
export async function getLampiranL5(sptId: string, tahunPajak: number) {
	const [kompensasi, pengurangNeto, pengurangPph] = await Promise.all([
		db
			.select()
			.from(spt_pph_orang_pribadi_lampiran_5_kompensasi_kerugian)
			.where(eq(spt_pph_orang_pribadi_lampiran_5_kompensasi_kerugian.sptPphOrangPribadiId, sptId)),
		db
			.select()
			.from(spt_pph_orang_pribadi_lampiran_5_pengurang_neto)
			.where(eq(spt_pph_orang_pribadi_lampiran_5_pengurang_neto.sptPphOrangPribadiId, sptId))
			.orderBy(asc(spt_pph_orang_pribadi_lampiran_5_pengurang_neto.nomorUrut)),
		db
			.select()
			.from(spt_pph_orang_pribadi_lampiran_5_pengurang_pph)
			.where(eq(spt_pph_orang_pribadi_lampiran_5_pengurang_pph.sptPphOrangPribadiId, sptId))
			.orderBy(asc(spt_pph_orang_pribadi_lampiran_5_pengurang_pph.nomorUrut))
	]);

	const byTahun = new Map(kompensasi.map((row) => [row.tahunPajak, row]));

	const kompensasiLengkap = Array.from({ length: 10 }, (_, i) => {
		const tahun = tahunPajak - (9 - i);
		const existing = byTahun.get(tahun);
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

	return { kompensasi: kompensasiLengkap, pengurangNeto, pengurangPph };
}
