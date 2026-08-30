import { getRequestEvent, query } from '$app/server';
import { db } from '$lib/server/db';
import {
	bukti_potong_bp21,
	bukti_potong_bp26,
	bukti_potong_bpa1,
	bukti_potong_bpa2,
	bukti_potong_bpu,
	bukti_potong_mp,
	kode_objek_pajak_pph,
	wajib_pajak
} from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { and, eq, sql } from 'drizzle-orm';

// Last day of a Masa Pajak/Tahun as an ISO date -- used as tanggalBukti for
// BPA1/BPA2/MP, which (unlike BPU/BP21/BP26) have no real issued-document
// date in this app (no Dokumen Referensi section). Day=0 on the *next*
// month rolls back to the last day of the target month.
const lastDayOfPeriod = (masaPajak: number, tahun: number) =>
	new Date(Date.UTC(tahun, masaPajak, 0)).toISOString().slice(0, 10);

// "Bukti Potong Saya" -- a pure recap, not a queue you act on. Per the
// real-world explanation this mirrors: a bukti potong a counterparty issues
// against your NPWP just shows up here, the same way a faktur keluaran
// lands in the buyer's Faktur Masukan -- but unlike Faktur Masukan, a
// bukti potong never needs "dikreditkan"; there is nothing to do with it
// here beyond viewing it (it gets used directly as a credit when filing
// the recipient's own annual/periodic return, which this route doesn't
// touch).
//
// Spans BPU, BP21, BP26, BPA1, BPA2, and MP. No SQL-level UNION precedent
// exists elsewhere in this codebase, and the tables' tax-basis columns
// differ in name/shape (BPU's flat dasarPengenaanPajak vs BP21/BP26's
// penghasilanBruto+dpp%) -- simplest to run one query per table and
// merge/sort in JS, same as the rest of this codebase's app-level
// composition style. BP26's namaPemotong doesn't need a wajib_pajak join
// on the recipient side (BP26 recipients are non-resident, never in that
// table) -- it already reuses the withholder-side join for namaPemotong.
//
// `pasal`/`sifat` (from the kode_objek_pajak_pph join) and `tanggalBukti`
// were added for the eBupot-to-SPT-credit import feature (see
// pph-badan/components/L3/listBuktiPotongBpuForImport.remote.ts and
// pph-orang-pribadi/components/L-1/listBuktiPotongForImport.remote.ts,
// which wrap this query with a sifat='Tidak Final' filter and a
// dedup-against-already-imported check) -- useful additions to the recap
// view in its own right, not just for import.
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
			pasal: kode_objek_pajak_pph.pasal,
			sifat: kode_objek_pajak_pph.sifat,
			penghasilanBruto: bukti_potong_bpu.dasarPengenaanPajak,
			tarif: bukti_potong_bpu.tarif,
			pajakPenghasilan: bukti_potong_bpu.pajakPenghasilan,
			tanggalDokumen: bukti_potong_bpu.tanggalDokumen
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
			pasal: kode_objek_pajak_pph.pasal,
			sifat: kode_objek_pajak_pph.sifat,
			penghasilanBruto: bukti_potong_bp21.penghasilanBruto,
			tarif: bukti_potong_bp21.tarif,
			pajakPenghasilan: bukti_potong_bp21.pajakPenghasilan,
			tanggalDokumen: bukti_potong_bp21.tanggalDokumen
		})
		.from(bukti_potong_bp21)
		.innerJoin(wajib_pajak, eq(bukti_potong_bp21.npwpPemotong, wajib_pajak.npwp))
		.leftJoin(kode_objek_pajak_pph, eq(bukti_potong_bp21.kodeObjekPajakId, kode_objek_pajak_pph.id))
		.where(and(eq(bukti_potong_bp21.nomorIdentitasWp, activeNpwp), eq(bukti_potong_bp21.diterbitkan, true)));

	const bp26Rows = await db
		.select({
			id: bukti_potong_bp26.id,
			jenis: sql<'BP26'>`'BP26'`,
			masaPajak: bukti_potong_bp26.masaPajak,
			tahun: bukti_potong_bp26.tahun,
			nomorPemotongan: bukti_potong_bp26.nomorPemotongan,
			npwpPemotong: bukti_potong_bp26.npwpPemotong,
			namaPemotong: wajib_pajak.nama,
			namaObjekPajak: kode_objek_pajak_pph.nama,
			pasal: kode_objek_pajak_pph.pasal,
			sifat: kode_objek_pajak_pph.sifat,
			penghasilanBruto: bukti_potong_bp26.penghasilanBruto,
			tarif: bukti_potong_bp26.tarif,
			pajakPenghasilan: bukti_potong_bp26.pajakPenghasilan,
			tanggalDokumen: bukti_potong_bp26.tanggalDokumen
		})
		.from(bukti_potong_bp26)
		.innerJoin(wajib_pajak, eq(bukti_potong_bp26.npwpPemotong, wajib_pajak.npwp))
		.leftJoin(kode_objek_pajak_pph, eq(bukti_potong_bp26.kodeObjekPajakId, kode_objek_pajak_pph.id))
		.where(and(eq(bukti_potong_bp26.nomorIdentitasWp, activeNpwp), eq(bukti_potong_bp26.diterbitkan, true)));

	// BPA1 has no local taxpayer-master lookup on the recipient side, so its
	// "Nama" is plain-typed on the bukti row itself rather than joined
	// from wajib_pajak. It also runs over a Masa Pajak Awal..Akhir range
	// rather than a single Masa Pajak -- normalized here to the same
	// masaPajak/tahun/pajakPenghasilan shape as the other three, keyed off
	// the period's end (matches how the BPA1 list page itself sorts).
	const bpa1Rows = await db
		.select({
			id: bukti_potong_bpa1.id,
			jenis: sql<'BPA1'>`'BPA1'`,
			masaPajak: bukti_potong_bpa1.masaPajakAkhir,
			tahun: bukti_potong_bpa1.tahunAkhir,
			nomorPemotongan: bukti_potong_bpa1.nomorPemotongan,
			npwpPemotong: bukti_potong_bpa1.npwpPemotong,
			namaPemotong: wajib_pajak.nama,
			namaObjekPajak: kode_objek_pajak_pph.nama,
			pasal: kode_objek_pajak_pph.pasal,
			sifat: kode_objek_pajak_pph.sifat,
			penghasilanBruto: bukti_potong_bpa1.penghasilanBruto,
			tarif: bukti_potong_bpa1.tarif,
			pajakPenghasilan: bukti_potong_bpa1.pphPasal21TerutangPadaIni,
			tanggalDokumen: sql<string | null>`null`
		})
		.from(bukti_potong_bpa1)
		.innerJoin(wajib_pajak, eq(bukti_potong_bpa1.npwpPemotong, wajib_pajak.npwp))
		.leftJoin(kode_objek_pajak_pph, eq(bukti_potong_bpa1.kodeObjekPajakId, kode_objek_pajak_pph.id))
		.where(and(eq(bukti_potong_bpa1.nomorIdentitasWp, activeNpwp), eq(bukti_potong_bpa1.diterbitkan, true)));

	// BPA2 mirrors BPA1's shape exactly (period range keyed off the end,
	// plain-typed Nama, pphPasal21TerutangPadaIni as the credit figure).
	const bpa2Rows = await db
		.select({
			id: bukti_potong_bpa2.id,
			jenis: sql<'BPA2'>`'BPA2'`,
			masaPajak: bukti_potong_bpa2.masaPajakAkhir,
			tahun: bukti_potong_bpa2.tahunAkhir,
			nomorPemotongan: bukti_potong_bpa2.nomorPemotongan,
			npwpPemotong: bukti_potong_bpa2.npwpPemotong,
			namaPemotong: wajib_pajak.nama,
			namaObjekPajak: kode_objek_pajak_pph.nama,
			pasal: kode_objek_pajak_pph.pasal,
			sifat: kode_objek_pajak_pph.sifat,
			penghasilanBruto: bukti_potong_bpa2.penghasilanBruto,
			tarif: bukti_potong_bpa2.tarif,
			pajakPenghasilan: bukti_potong_bpa2.pphPasal21TerutangPadaIni,
			tanggalDokumen: sql<string | null>`null`
		})
		.from(bukti_potong_bpa2)
		.innerJoin(wajib_pajak, eq(bukti_potong_bpa2.npwpPemotong, wajib_pajak.npwp))
		.leftJoin(kode_objek_pajak_pph, eq(bukti_potong_bpa2.kodeObjekPajakId, kode_objek_pajak_pph.id))
		.where(and(eq(bukti_potong_bpa2.nomorIdentitasWp, activeNpwp), eq(bukti_potong_bpa2.diterbitkan, true)));

	// MP is a single Masa Pajak like BPU/BP21/BP26 (not a period range), and
	// its Nama is DJP-taxpayer-master-derived like BP21's namaPenerima, but
	// that's the recipient's own name -- namaPemotong here still comes from
	// the withholder-side join, same as every other row.
	const mpRows = await db
		.select({
			id: bukti_potong_mp.id,
			jenis: sql<'MP'>`'MP'`,
			masaPajak: bukti_potong_mp.masaPajak,
			tahun: bukti_potong_mp.tahun,
			nomorPemotongan: bukti_potong_mp.nomorPemotongan,
			npwpPemotong: bukti_potong_mp.npwpPemotong,
			namaPemotong: wajib_pajak.nama,
			namaObjekPajak: kode_objek_pajak_pph.nama,
			pasal: kode_objek_pajak_pph.pasal,
			sifat: kode_objek_pajak_pph.sifat,
			penghasilanBruto: bukti_potong_mp.penghasilanBruto,
			tarif: bukti_potong_mp.tarif,
			pajakPenghasilan: bukti_potong_mp.pajakPenghasilanDipotong,
			tanggalDokumen: sql<string | null>`null`
		})
		.from(bukti_potong_mp)
		.innerJoin(wajib_pajak, eq(bukti_potong_mp.npwpPemotong, wajib_pajak.npwp))
		.leftJoin(kode_objek_pajak_pph, eq(bukti_potong_mp.kodeObjekPajakId, kode_objek_pajak_pph.id))
		.where(and(eq(bukti_potong_mp.nomorIdentitasWp, activeNpwp), eq(bukti_potong_mp.diterbitkan, true)));

	const rows = [...bpuRows, ...bp21Rows, ...bp26Rows, ...bpa1Rows, ...bpa2Rows, ...mpRows];

	return rows
		.map((row) => ({
			...row,
			// BPU/BP21/BP26 carry a real issued-document date; BPA1/BPA2/MP
			// don't (no Dokumen Referensi section on any of the three), so
			// fall back to the last day of the bukti's own period.
			tanggalBukti: row.tanggalDokumen ?? lastDayOfPeriod(row.masaPajak, row.tahun)
		}))
		.sort((a, b) => b.tahun - a.tahun || b.masaPajak - a.masaPajak);
});
