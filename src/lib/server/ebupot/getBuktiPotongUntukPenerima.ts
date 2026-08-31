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
import { and, eq, sql } from 'drizzle-orm';

// Last day of a Masa Pajak/Tahun as an ISO date -- used as tanggalBukti for
// BPA1/BPA2/MP, which (unlike BPU/BP21/BP26) have no real issued-document
// date in this app (no Dokumen Referensi section). Day=0 on the *next*
// month rolls back to the last day of the target month.
const lastDayOfPeriod = (masaPajak: number, tahun: number) =>
	new Date(Date.UTC(tahun, masaPajak, 0)).toISOString().slice(0, 10);

// Every eBupot bukti potong issued (diterbitkan=true) where `nomorIdentitasWp`
// is the given NPWP -- i.e. everything that NPWP received as a recipient,
// spanning BPU, BP21, BP26, BPA1, BPA2, and MP. Shared by "Bukti Potong
// Saya" (src/routes/ebupot/bukti-potong-saya/listBuktiPotongSaya.remote.ts,
// a pure recap) and the "Posting SPT" bulk-import computations
// (pph-badan/server/computePostedSptPphBadanLampiran.server.ts,
// pph-orang-pribadi/server/computePostedSptPphOrangPribadiLampiran.server.ts,
// which filter this down further by sifat='Tidak Final' and tax year).
//
// No SQL-level UNION precedent exists elsewhere in this codebase, and the
// tables' tax-basis columns differ in name/shape (BPU's flat
// dasarPengenaanPajak vs BP21/BP26's penghasilanBruto) -- simplest to run
// one query per table and merge/sort in JS, same as the rest of this
// codebase's app-level composition style. BP26's namaPemotong doesn't need
// a wajib_pajak join on the recipient side (BP26 recipients are
// non-resident, never in that table) -- it already reuses the
// withholder-side join for namaPemotong. BPA1/BPA2 have no local
// taxpayer-master lookup on the recipient side either, so their own "Nama"
// is plain-typed on the bukti row rather than joined from wajib_pajak, and
// they run over a Masa Pajak Awal..Akhir range rather than a single Masa
// Pajak -- normalized here to the same masaPajak/tahun shape as the other
// four, keyed off the period's end.
export async function getBuktiPotongUntukPenerima(nomorIdentitasWp: string) {
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
		.where(and(eq(bukti_potong_bpu.nomorIdentitasWp, nomorIdentitasWp), eq(bukti_potong_bpu.diterbitkan, true)));

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
		.where(and(eq(bukti_potong_bp21.nomorIdentitasWp, nomorIdentitasWp), eq(bukti_potong_bp21.diterbitkan, true)));

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
		.where(and(eq(bukti_potong_bp26.nomorIdentitasWp, nomorIdentitasWp), eq(bukti_potong_bp26.diterbitkan, true)));

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
		.where(and(eq(bukti_potong_bpa1.nomorIdentitasWp, nomorIdentitasWp), eq(bukti_potong_bpa1.diterbitkan, true)));

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
		.where(and(eq(bukti_potong_bpa2.nomorIdentitasWp, nomorIdentitasWp), eq(bukti_potong_bpa2.diterbitkan, true)));

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
		.where(and(eq(bukti_potong_mp.nomorIdentitasWp, nomorIdentitasWp), eq(bukti_potong_mp.diterbitkan, true)));

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
}
