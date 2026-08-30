import { getRequestEvent, query } from '$app/server';
import { db } from '$lib/server/db';
import { bukti_potong_mp, kode_objek_pajak_pph } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';

export const listMp = query(async () => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	const rows = await db
		.select({
			id: bukti_potong_mp.id,
			masaPajak: bukti_potong_mp.masaPajak,
			tahun: bukti_potong_mp.tahun,
			status: bukti_potong_mp.status,
			nomorIdentitasWp: bukti_potong_mp.nomorIdentitasWp,
			nama: bukti_potong_mp.nama,
			namaObjekPajak: kode_objek_pajak_pph.nama,
			pajakPenghasilanDipotong: bukti_potong_mp.pajakPenghasilanDipotong,
			diterbitkan: bukti_potong_mp.diterbitkan
		})
		.from(bukti_potong_mp)
		.leftJoin(kode_objek_pajak_pph, eq(bukti_potong_mp.kodeObjekPajakId, kode_objek_pajak_pph.id))
		.where(eq(bukti_potong_mp.npwpPemotong, activeNpwp))
		.orderBy(desc(bukti_potong_mp.tahun), desc(bukti_potong_mp.masaPajak));

	return rows;
});
