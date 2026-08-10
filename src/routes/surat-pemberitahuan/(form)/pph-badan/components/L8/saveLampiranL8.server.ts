import { decimalInput } from '$lib/helpers/valibot-schema';
import { db, type Statement } from '$lib/server/db';
import { spt_pph_badan_lampiran_8_fasilitas_31e } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';
import { hitungFasilitas31E } from './fasilitas31e';

export const L8Schema = v.object({
	l8JumlahPeredaranBruto: v.optional(decimalInput('Jumlah peredaran bruto'), 0),
	l8PenghasilanKenaPajak: v.optional(decimalInput('Penghasilan kena pajak'), 0)
});

type L8Input = v.InferOutput<typeof L8Schema>;

export async function saveLampiranL8(sptPphBadanId: string, input: L8Input): Promise<Statement[]> {
	const jumlahPeredaranBruto = Number(input.l8JumlahPeredaranBruto);
	const penghasilanKenaPajak = Number(input.l8PenghasilanKenaPajak);
	const hasil = hitungFasilitas31E(jumlahPeredaranBruto, penghasilanKenaPajak);

	return [
		db
			.delete(spt_pph_badan_lampiran_8_fasilitas_31e)
			.where(eq(spt_pph_badan_lampiran_8_fasilitas_31e.sptPphBadanId, sptPphBadanId)),
		db.insert(spt_pph_badan_lampiran_8_fasilitas_31e).values({
			sptPphBadanId,
			jumlahPeredaranBruto,
			penghasilanKenaPajak,
			...hasil
		})
	];
}
