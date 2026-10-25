import { db } from '$lib/server/db';
import { bukti_potong_mp, kode_objek_pajak_pph } from '$lib/server/db/schema';
import { GENERIC_RECIPIENT_TIN } from '$lib/helpers/bpa-calc';
import { and, eq, inArray, sql } from 'drizzle-orm';

export type PriorMonthlyWithheldQuery = {
	npwpPemotong: string;
	nomorIdentitasWp: string;
	nama: string;
	kodeObjekPajakId: string;
	masaPajakAwal: number;
	tahunAwal: number;
	masaPajakAkhir: number;
	tahunAkhir: number;
};

/**
 * Coretax's BPA form calls getebupotmpincometaxwithheld on every change of
 * identity/period and fills "PPh Pasal 21 yang Dipotong" from it. Here that is
 * the PPh of the issued, active Bukti Pemotongan Bulanan Pegawai Tetap of the
 * same withholder, recipient and object code in the months before the last
 * period (Masa Pajak Awal inclusive, Masa Pajak Akhir exclusive -- the last
 * period is the one this BPA itself settles). Same matching convention as the
 * SPT 21/26 simulator: generic TIN 9990000000999000 also needs the same name.
 */
export async function priorMonthlyPph21Withheld(query: PriorMonthlyWithheldQuery): Promise<number> {
	const identity = query.nomorIdentitasWp.trim();
	const genericName =
		identity === GENERIC_RECIPIENT_TIN ? query.nama.trim().toLocaleUpperCase('id-ID') : '';
	if (!identity || (identity === GENERIC_RECIPIENT_TIN && !genericName)) return 0;

	const [objek] = await db
		.select({ kode: kode_objek_pajak_pph.kode })
		.from(kode_objek_pajak_pph)
		.where(eq(kode_objek_pajak_pph.id, query.kodeObjekPajakId))
		.limit(1);
	if (!objek) return 0;

	const periodIndex = sql`${bukti_potong_mp.tahun} * 12 + ${bukti_potong_mp.masaPajak}`;
	const rows = await db
		.select({ nama: bukti_potong_mp.nama, pajak: bukti_potong_mp.pajakPenghasilanDipotong })
		.from(bukti_potong_mp)
		.innerJoin(kode_objek_pajak_pph, eq(bukti_potong_mp.kodeObjekPajakId, kode_objek_pajak_pph.id))
		.where(
			and(
				eq(bukti_potong_mp.npwpPemotong, query.npwpPemotong),
				eq(bukti_potong_mp.nomorIdentitasWp, identity),
				eq(bukti_potong_mp.diterbitkan, true),
				inArray(bukti_potong_mp.status, ['NORMAL', 'SUBMITTED']),
				eq(kode_objek_pajak_pph.kode, objek.kode),
				sql`${periodIndex} >= ${query.tahunAwal * 12 + query.masaPajakAwal}`,
				sql`${periodIndex} < ${query.tahunAkhir * 12 + query.masaPajakAkhir}`
			)
		);

	return rows
		.filter(
			(row) =>
				identity !== GENERIC_RECIPIENT_TIN ||
				row.nama.trim().toLocaleUpperCase('id-ID') === genericName
		)
		.reduce((total, row) => total + row.pajak, 0);
}
