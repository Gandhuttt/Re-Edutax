import { getRequestEvent, query } from '$app/server';
import { db } from '$lib/server/db';
import { bukti_potong_bp21, kode_objek_pajak_pph } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';

export const listBp21 = query(async () => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	const rows = await db
		.select({
			id: bukti_potong_bp21.id,
			masaPajak: bukti_potong_bp21.masaPajak,
			tahun: bukti_potong_bp21.tahun,
			status: bukti_potong_bp21.status,
			nomorIdentitasWp: bukti_potong_bp21.nomorIdentitasWp,
			namaPenerima: bukti_potong_bp21.namaPenerima,
			namaObjekPajak: kode_objek_pajak_pph.nama,
			pajakPenghasilan: bukti_potong_bp21.pajakPenghasilan,
			diterbitkan: bukti_potong_bp21.diterbitkan
		})
		.from(bukti_potong_bp21)
		.leftJoin(kode_objek_pajak_pph, eq(bukti_potong_bp21.kodeObjekPajakId, kode_objek_pajak_pph.id))
		.where(eq(bukti_potong_bp21.npwpPemotong, activeNpwp))
		.orderBy(desc(bukti_potong_bp21.tahun), desc(bukti_potong_bp21.masaPajak));

	return rows;
});
