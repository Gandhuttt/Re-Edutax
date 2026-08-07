import { prerender } from '$app/server';
import { db } from '$lib/server/db';
import { jenis_pajak_dipotong_dipungut_spt_pph_badan } from '$lib/server/db/schema';
import { asc, eq } from 'drizzle-orm';

export const getJenisPajakDipotongDipungut = prerender(async () => {
	const rows = await db
		.select({
			id: jenis_pajak_dipotong_dipungut_spt_pph_badan.id,
			kode: jenis_pajak_dipotong_dipungut_spt_pph_badan.kode,
			nama: jenis_pajak_dipotong_dipungut_spt_pph_badan.nama
		})
		.from(jenis_pajak_dipotong_dipungut_spt_pph_badan)
		.where(eq(jenis_pajak_dipotong_dipungut_spt_pph_badan.aktif, true))
		.orderBy(asc(jenis_pajak_dipotong_dipungut_spt_pph_badan.nomorUrut));

	return rows.map((row) => ({
		id: row.id,
		value: row.kode,
		label: row.nama
	}));
});
