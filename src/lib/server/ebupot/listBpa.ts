import { db } from '$lib/server/db';
import { bukti_potong_bpa1, bukti_potong_bpa2, kode_objek_pajak_pph } from '$lib/server/db/schema';
import type { BpaKind } from '$lib/helpers/bp-parity';
import { desc, eq } from 'drizzle-orm';

/**
 * Every owned BPA1/BPA2 row (history statuses included) in the BpListWorkspace row
 * shape: masaPajak/tahun are the period end (Coretax filters BPA lists by it), the
 * start rides along for display. `replacedById` links an AMENDED original to its
 * replacement (issued one wins over an open draft), same as listBp21.
 */
export async function listBpaRows(kind: BpaKind, owner: string) {
	const t = kind === 'bpa1' ? bukti_potong_bpa1 : bukti_potong_bpa2;
	const rows = await db
		.select({
			id: t.id,
			masaPajak: t.masaPajakAkhir,
			tahun: t.tahunAkhir,
			masaPajakAwal: t.masaPajakAwal,
			tahunAwal: t.tahunAwal,
			status: t.status,
			nomorIdentitasWp: t.nomorIdentitasWp,
			nama: t.nama,
			namaObjekPajak: kode_objek_pajak_pph.nama,
			pajakPenghasilan: t.pphPasal21TerutangPadaIni,
			diterbitkan: t.diterbitkan,
			nomorPemotongan: t.nomorPemotongan,
			pembetulanDariId: t.pembetulanDariId,
			pembetulanKe: t.pembetulanKe
		})
		.from(t)
		.leftJoin(kode_objek_pajak_pph, eq(t.kodeObjekPajakId, kode_objek_pajak_pph.id))
		.where(eq(t.npwpPemotong, owner))
		.orderBy(desc(t.tahunAkhir), desc(t.masaPajakAkhir), desc(t.pembetulanKe));

	const replacement: Record<string, { id: string; issued: boolean }> = {};
	for (const row of rows) {
		if (!row.pembetulanDariId || row.status === 'DELETED' || row.status === 'CANCELLED') continue;
		const current = replacement[row.pembetulanDariId];
		if (!current || (row.diterbitkan && !current.issued)) {
			replacement[row.pembetulanDariId] = { id: row.id, issued: row.diterbitkan };
		}
	}
	return rows.map((row) => ({ ...row, replacedById: replacement[row.id]?.id ?? null }));
}
