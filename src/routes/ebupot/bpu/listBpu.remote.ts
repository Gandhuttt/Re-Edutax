import { getRequestEvent, query } from '$app/server';
import { db } from '$lib/server/db';
import { bukti_potong_bpu, kode_objek_pajak_pph } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';

export const listBpu = query(async () => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	const rows = await db
		.select({
			id: bukti_potong_bpu.id,
			masaPajak: bukti_potong_bpu.masaPajak,
			tahun: bukti_potong_bpu.tahun,
			status: bukti_potong_bpu.status,
			nomorIdentitasWp: bukti_potong_bpu.nomorIdentitasWp,
			namaPenerima: bukti_potong_bpu.namaPenerima,
			namaObjekPajak: kode_objek_pajak_pph.nama,
			pajakPenghasilan: bukti_potong_bpu.pajakPenghasilan,
			diterbitkan: bukti_potong_bpu.diterbitkan
		})
		.from(bukti_potong_bpu)
		.leftJoin(kode_objek_pajak_pph, eq(bukti_potong_bpu.kodeObjekPajakId, kode_objek_pajak_pph.id))
		.where(eq(bukti_potong_bpu.npwpPemotong, activeNpwp))
		.orderBy(desc(bukti_potong_bpu.tahun), desc(bukti_potong_bpu.masaPajak));

	return rows;
});
