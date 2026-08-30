import { getRequestEvent, query } from '$app/server';
import { db } from '$lib/server/db';
import { bukti_potong_bpu, kode_objek_pajak_pph, wajib_pajak } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';

// Backs "Impor dari eBupot" on Lampiran III.B. Only BPU can have a
// corporate recipient (BP21/BP26/BPA1/BPA2/MP are always personal-income
// withholding, so they're never offered here -- see
// listBuktiPotongForImport.remote.ts on the OP side for those).
//
// Only *creditable* (non-final) withholding belongs in a credit line --
// final tax (PPh Pasal 4(2) etc.) settles the obligation on its own, which
// is also why jenis_pajak_dipotong_dipungut_spt_pph_badan has no "Pasal
// 4(2)" row to map into (checked: only pph_pasal_15/22/23/26 exist there).
// `sifat = 'Tidak Final'` filters those out. Dedup (excluding bukti already
// imported into the SPT currently open) happens client-side in _L3.svelte,
// against whatever's already in the bound pphDipotong array.
export const listBuktiPotongBpuForImport = query(async () => {
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
			namaPemotong: wajib_pajak.nama,
			npwpPemotong: bukti_potong_bpu.npwpPemotong,
			namaObjekPajak: kode_objek_pajak_pph.nama,
			pasal: kode_objek_pajak_pph.pasal,
			dasarPengenaanPajak: bukti_potong_bpu.dasarPengenaanPajak,
			pajakPenghasilan: bukti_potong_bpu.pajakPenghasilan,
			tanggalDokumen: bukti_potong_bpu.tanggalDokumen
		})
		.from(bukti_potong_bpu)
		.innerJoin(wajib_pajak, eq(bukti_potong_bpu.npwpPemotong, wajib_pajak.npwp))
		.leftJoin(kode_objek_pajak_pph, eq(bukti_potong_bpu.kodeObjekPajakId, kode_objek_pajak_pph.id))
		.where(
			and(
				eq(bukti_potong_bpu.nomorIdentitasWp, activeNpwp),
				eq(bukti_potong_bpu.diterbitkan, true),
				eq(kode_objek_pajak_pph.sifat, 'Tidak Final')
			)
		);

	return rows;
});
