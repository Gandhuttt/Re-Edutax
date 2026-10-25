import { getRequestEvent, query } from '$app/server';
import { db } from '$lib/server/db';
import { bukti_potong_bp21, kode_objek_pajak_pph } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';

// Every owned row including history statuses (AMENDED/CANCELLED/DELETED); the list UI
// decides which tab shows what. `replacedById` links an AMENDED original to its
// replacement (issued one wins over an open draft).
export const listBp21 = query(async () => {
	const activeNpwp = getRequestEvent().locals.user?.username;
	if (!activeNpwp) error(401, 'Belum login');

	const rows = await db
		.select({
			id: bukti_potong_bp21.id,
			masaPajak: bukti_potong_bp21.masaPajak,
			tahun: bukti_potong_bp21.tahun,
			status: bukti_potong_bp21.status,
			nomorIdentitasWp: bukti_potong_bp21.nomorIdentitasWp,
			nama: bukti_potong_bp21.namaPenerima,
			namaObjekPajak: kode_objek_pajak_pph.nama,
			pajakPenghasilan: bukti_potong_bp21.pajakPenghasilan,
			diterbitkan: bukti_potong_bp21.diterbitkan,
			nomorPemotongan: bukti_potong_bp21.nomorPemotongan,
			pembetulanDariId: bukti_potong_bp21.pembetulanDariId,
			pembetulanKe: bukti_potong_bp21.pembetulanKe
		})
		.from(bukti_potong_bp21)
		.leftJoin(kode_objek_pajak_pph, eq(bukti_potong_bp21.kodeObjekPajakId, kode_objek_pajak_pph.id))
		.where(eq(bukti_potong_bp21.npwpPemotong, activeNpwp))
		.orderBy(desc(bukti_potong_bp21.tahun), desc(bukti_potong_bp21.masaPajak), desc(bukti_potong_bp21.pembetulanKe));

	const replacement: Record<string, { id: string; issued: boolean }> = {};
	for (const row of rows) {
		if (!row.pembetulanDariId || row.status === 'DELETED' || row.status === 'CANCELLED') continue;
		const current = replacement[row.pembetulanDariId];
		if (!current || (row.diterbitkan && !current.issued)) {
			replacement[row.pembetulanDariId] = { id: row.id, issued: row.diterbitkan };
		}
	}
	return rows.map((row) => ({ ...row, replacedById: replacement[row.id]?.id ?? null }));
});
