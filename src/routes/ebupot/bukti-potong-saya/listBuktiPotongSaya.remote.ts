import { getRequestEvent, query } from '$app/server';
import { db } from '$lib/server/db';
import { bukti_potong_bpu, kode_objek_pajak_pph, wajib_pajak } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { and, desc, eq } from 'drizzle-orm';

// "Bukti Potong Saya" -- a pure recap, not a queue you act on. Per the
// real-world explanation this mirrors: a bukti potong a counterparty issues
// against your NPWP just shows up here, the same way a faktur keluaran
// lands in the buyer's Faktur Masukan -- but unlike Faktur Masukan, a
// bukti potong never needs "dikreditkan"; there is nothing to do with it
// here beyond viewing it (it gets used directly as a credit when filing
// the recipient's own annual/periodic return, which this route doesn't
// touch).
export const listBuktiPotongSaya = query(async () => {
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
			nomorPemotongan: bukti_potong_bpu.nomorPemotongan,
			npwpPemotong: bukti_potong_bpu.npwpPemotong,
			namaPemotong: wajib_pajak.nama,
			namaObjekPajak: kode_objek_pajak_pph.nama,
			dasarPengenaanPajak: bukti_potong_bpu.dasarPengenaanPajak,
			tarif: bukti_potong_bpu.tarif,
			pajakPenghasilan: bukti_potong_bpu.pajakPenghasilan
		})
		.from(bukti_potong_bpu)
		.innerJoin(wajib_pajak, eq(bukti_potong_bpu.npwpPemotong, wajib_pajak.npwp))
		.leftJoin(kode_objek_pajak_pph, eq(bukti_potong_bpu.kodeObjekPajakId, kode_objek_pajak_pph.id))
		.where(and(eq(bukti_potong_bpu.nomorIdentitasWp, activeNpwp), eq(bukti_potong_bpu.diterbitkan, true)))
		.orderBy(desc(bukti_potong_bpu.tahun), desc(bukti_potong_bpu.masaPajak));

	return rows;
});
