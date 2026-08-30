import { getRequestEvent, query } from '$app/server';
import { db } from '$lib/server/db';
import { bukti_potong_bpa2, kode_objek_pajak_pph } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';

export const listBpa2 = query(async () => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	const rows = await db
		.select({
			id: bukti_potong_bpa2.id,
			masaPajakAwal: bukti_potong_bpa2.masaPajakAwal,
			tahunAwal: bukti_potong_bpa2.tahunAwal,
			masaPajakAkhir: bukti_potong_bpa2.masaPajakAkhir,
			tahunAkhir: bukti_potong_bpa2.tahunAkhir,
			status: bukti_potong_bpa2.status,
			nomorIdentitasWp: bukti_potong_bpa2.nomorIdentitasWp,
			nama: bukti_potong_bpa2.nama,
			namaObjekPajak: kode_objek_pajak_pph.nama,
			pphPasal21TerutangPadaIni: bukti_potong_bpa2.pphPasal21TerutangPadaIni,
			diterbitkan: bukti_potong_bpa2.diterbitkan
		})
		.from(bukti_potong_bpa2)
		.leftJoin(kode_objek_pajak_pph, eq(bukti_potong_bpa2.kodeObjekPajakId, kode_objek_pajak_pph.id))
		.where(eq(bukti_potong_bpa2.npwpPemotong, activeNpwp))
		.orderBy(desc(bukti_potong_bpa2.tahunAkhir), desc(bukti_potong_bpa2.masaPajakAkhir));

	return rows;
});
