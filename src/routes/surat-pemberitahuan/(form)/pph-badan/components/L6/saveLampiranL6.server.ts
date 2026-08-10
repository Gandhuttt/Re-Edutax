import { decimalInput } from '$lib/helpers/valibot-schema';
import { db, type Statement } from '$lib/server/db';
import { spt_pph_badan_lampiran_6_komponen } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';

export const L6_KODE = {
	DASAR_ANGSURAN: 'DASAR_ANGSURAN',
	KOMPENSASI_KERUGIAN: 'KOMPENSASI_KERUGIAN',
	PENGHASILAN_KENA_PAJAK: 'PENGHASILAN_KENA_PAJAK',
	PPH_TERUTANG: 'PPH_TERUTANG',
	KREDIT_PAJAK_TAHUN_LALU: 'KREDIT_PAJAK_TAHUN_LALU',
	PPH_DIBAYAR_SENDIRI: 'PPH_DIBAYAR_SENDIRI',
	ANGSURAN_PPH_25: 'ANGSURAN_PPH_25'
} as const;

const L6_NAMA: Record<string, string> = {
	[L6_KODE.DASAR_ANGSURAN]: 'Penghasilan yang menjadi dasar penghitungan angsuran',
	[L6_KODE.KOMPENSASI_KERUGIAN]: 'Kompensasi kerugian fiskal',
	[L6_KODE.PENGHASILAN_KENA_PAJAK]: 'Penghasilan kena pajak',
	[L6_KODE.PPH_TERUTANG]: 'PPh yang terutang',
	[L6_KODE.KREDIT_PAJAK_TAHUN_LALU]: 'Kredit pajak tahun pajak yang lalu',
	[L6_KODE.PPH_DIBAYAR_SENDIRI]: 'PPh yang harus dibayar sendiri',
	[L6_KODE.ANGSURAN_PPH_25]: 'Angsuran PPh Pasal 25'
};

export const L6Schema = v.object({
	l6DasarAngsuran: v.optional(decimalInput('Penghasilan yang menjadi dasar penghitungan angsuran'), 0),
	l6KompensasiKerugian: v.optional(decimalInput('Kompensasi kerugian fiskal'), 0),
	l6PphTerutang: v.optional(decimalInput('PPh yang terutang'), 0),
	l6KreditPajakTahunLalu: v.optional(decimalInput('Kredit pajak tahun pajak yang lalu'), 0)
});

type L6Input = v.InferOutput<typeof L6Schema>;

export async function saveLampiranL6(sptPphBadanId: string, input: L6Input): Promise<Statement[]> {
	const dasarAngsuran = Number(input.l6DasarAngsuran);
	const kompensasiKerugian = Number(input.l6KompensasiKerugian);
	const pphTerutang = Number(input.l6PphTerutang);
	const kreditPajakTahunLalu = Number(input.l6KreditPajakTahunLalu);

	const penghasilanKenaPajak = dasarAngsuran - kompensasiKerugian;
	const pphDibayarSendiri = pphTerutang - kreditPajakTahunLalu;
	const angsuranPph25 = Math.floor(pphDibayarSendiri / 12);

	const nilaiByKode: Record<string, number> = {
		[L6_KODE.DASAR_ANGSURAN]: dasarAngsuran,
		[L6_KODE.KOMPENSASI_KERUGIAN]: kompensasiKerugian,
		[L6_KODE.PENGHASILAN_KENA_PAJAK]: penghasilanKenaPajak,
		[L6_KODE.PPH_TERUTANG]: pphTerutang,
		[L6_KODE.KREDIT_PAJAK_TAHUN_LALU]: kreditPajakTahunLalu,
		[L6_KODE.PPH_DIBAYAR_SENDIRI]: pphDibayarSendiri,
		[L6_KODE.ANGSURAN_PPH_25]: angsuranPph25
	};

	const statements: Statement[] = [
		db
			.delete(spt_pph_badan_lampiran_6_komponen)
			.where(eq(spt_pph_badan_lampiran_6_komponen.sptPphBadanId, sptPphBadanId))
	];

	for (const [kode, nilai] of Object.entries(nilaiByKode)) {
		statements.push(
			db.insert(spt_pph_badan_lampiran_6_komponen).values({
				sptPphBadanId,
				kode,
				nama: L6_NAMA[kode],
				nilai
			})
		);
	}

	return statements;
}
