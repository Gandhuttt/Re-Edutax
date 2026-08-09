import { db } from '$lib/server/db';
import { negara_spt_pph_badan } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';

export async function getNegaraId(kode: string) {
	const [negara] = await db
		.select({ id: negara_spt_pph_badan.id })
		.from(negara_spt_pph_badan)
		.where(and(eq(negara_spt_pph_badan.kode, kode), eq(negara_spt_pph_badan.aktif, true)))
		.limit(1);

	if (!negara) {
		error(400, 'Negara tidak valid');
	}

	return negara.id;
}
