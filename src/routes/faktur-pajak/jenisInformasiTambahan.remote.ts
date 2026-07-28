import { prerender } from '$app/server';
import { db } from '$lib/server/db';
import { jenis_informasi_tambahan_faktur_pajak } from '$lib/server/db/schema';
import { asc, eq } from 'drizzle-orm';

export const getJenisInformasiTambahanFaktur = prerender(async () => {
	const rows = await db
		.select()
		.from(jenis_informasi_tambahan_faktur_pajak)
		.where(eq(jenis_informasi_tambahan_faktur_pajak.aktif, true))
		.orderBy(asc(jenis_informasi_tambahan_faktur_pajak.kode));

	return rows.map((row) => ({
		id: row.id,
		kodeTransaksiId: row.kodeTransaksiId,
		kode: row.kode,
		informasiTambahan: row.nama,
		requiresDocument: row.butuhDokumenPendukung
	}));
});
