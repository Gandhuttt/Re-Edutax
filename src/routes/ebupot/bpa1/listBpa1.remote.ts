import { getRequestEvent, query } from '$app/server';
import { db } from '$lib/server/db';
import { bukti_potong_bpa1, kode_objek_pajak_pph } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';

export const listBpa1 = query(async () => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	const rows = await db
		.select({
			id: bukti_potong_bpa1.id,
			masaPajakAwal: bukti_potong_bpa1.masaPajakAwal,
			tahunAwal: bukti_potong_bpa1.tahunAwal,
			masaPajakAkhir: bukti_potong_bpa1.masaPajakAkhir,
			tahunAkhir: bukti_potong_bpa1.tahunAkhir,
			status: bukti_potong_bpa1.status,
			nomorIdentitasWp: bukti_potong_bpa1.nomorIdentitasWp,
			nama: bukti_potong_bpa1.nama,
			namaObjekPajak: kode_objek_pajak_pph.nama,
			pphPasal21TerutangPadaIni: bukti_potong_bpa1.pphPasal21TerutangPadaIni,
			diterbitkan: bukti_potong_bpa1.diterbitkan
		})
		.from(bukti_potong_bpa1)
		.leftJoin(kode_objek_pajak_pph, eq(bukti_potong_bpa1.kodeObjekPajakId, kode_objek_pajak_pph.id))
		.where(eq(bukti_potong_bpa1.npwpPemotong, activeNpwp))
		.orderBy(desc(bukti_potong_bpa1.tahunAkhir), desc(bukti_potong_bpa1.masaPajakAkhir));

	return rows;
});
