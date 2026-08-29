import { getRequestEvent, query } from '$app/server';
import { db } from '$lib/server/db';
import { bukti_potong_bp21, bukti_potong_bpu, kode_objek_pajak_pph, wajib_pajak } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { and, eq, sql } from 'drizzle-orm';

// "Bukti Potong Saya" -- a pure recap, not a queue you act on. Per the
// real-world explanation this mirrors: a bukti potong a counterparty issues
// against your NPWP just shows up here, the same way a faktur keluaran
// lands in the buyer's Faktur Masukan -- but unlike Faktur Masukan, a
// bukti potong never needs "dikreditkan"; there is nothing to do with it
// here beyond viewing it (it gets used directly as a credit when filing
// the recipient's own annual/periodic return, which this route doesn't
// touch).
//
// Spans both BPU and BP21 (and, as more eBupot document types are built,
// presumably more tables later). No SQL-level UNION precedent exists
// elsewhere in this codebase, and the two tables' tax-basis columns differ
// in name/shape (BPU's flat dasarPengenaanPajak vs BP21's
// penghasilanBruto+dpp%) -- simplest to run two queries and merge/sort in
// JS, same as the rest of this codebase's app-level composition style.
export const listBuktiPotongSaya = query(async () => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	const bpuRows = await db
		.select({
			id: bukti_potong_bpu.id,
			jenis: sql<'BPU'>`'BPU'`,
			masaPajak: bukti_potong_bpu.masaPajak,
			tahun: bukti_potong_bpu.tahun,
			nomorPemotongan: bukti_potong_bpu.nomorPemotongan,
			npwpPemotong: bukti_potong_bpu.npwpPemotong,
			namaPemotong: wajib_pajak.nama,
			namaObjekPajak: kode_objek_pajak_pph.nama,
			tarif: bukti_potong_bpu.tarif,
			pajakPenghasilan: bukti_potong_bpu.pajakPenghasilan
		})
		.from(bukti_potong_bpu)
		.innerJoin(wajib_pajak, eq(bukti_potong_bpu.npwpPemotong, wajib_pajak.npwp))
		.leftJoin(kode_objek_pajak_pph, eq(bukti_potong_bpu.kodeObjekPajakId, kode_objek_pajak_pph.id))
		.where(and(eq(bukti_potong_bpu.nomorIdentitasWp, activeNpwp), eq(bukti_potong_bpu.diterbitkan, true)));

	const bp21Rows = await db
		.select({
			id: bukti_potong_bp21.id,
			jenis: sql<'BP21'>`'BP21'`,
			masaPajak: bukti_potong_bp21.masaPajak,
			tahun: bukti_potong_bp21.tahun,
			nomorPemotongan: bukti_potong_bp21.nomorPemotongan,
			npwpPemotong: bukti_potong_bp21.npwpPemotong,
			namaPemotong: wajib_pajak.nama,
			namaObjekPajak: kode_objek_pajak_pph.nama,
			tarif: bukti_potong_bp21.tarif,
			pajakPenghasilan: bukti_potong_bp21.pajakPenghasilan
		})
		.from(bukti_potong_bp21)
		.innerJoin(wajib_pajak, eq(bukti_potong_bp21.npwpPemotong, wajib_pajak.npwp))
		.leftJoin(kode_objek_pajak_pph, eq(bukti_potong_bp21.kodeObjekPajakId, kode_objek_pajak_pph.id))
		.where(and(eq(bukti_potong_bp21.nomorIdentitasWp, activeNpwp), eq(bukti_potong_bp21.diterbitkan, true)));

	return [...bpuRows, ...bp21Rows].sort(
		(a, b) => b.tahun - a.tahun || b.masaPajak - a.masaPajak
	);
});
