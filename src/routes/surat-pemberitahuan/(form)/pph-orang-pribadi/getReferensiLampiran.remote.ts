import { query } from '$app/server';
import { db } from '$lib/server/db';
import { referensi_lampiran_spt_pph_orang_pribadi } from '$lib/server/db/schema';
import { asc, eq } from 'drizzle-orm';

// Every lampiran dropdown list, keyed by `daftar`, loaded in one query.
//
// Order is DJP's own and is preserved: the lists are deliberately not sorted or
// deduplicated, so `urutan` is the only correct ordering.
export const getReferensiLampiran = query(async () => {
	const rows = await db
		.select({
			daftar: referensi_lampiran_spt_pph_orang_pribadi.daftar,
			nama: referensi_lampiran_spt_pph_orang_pribadi.nama
		})
		.from(referensi_lampiran_spt_pph_orang_pribadi)
		.where(eq(referensi_lampiran_spt_pph_orang_pribadi.aktif, true))
		.orderBy(
			asc(referensi_lampiran_spt_pph_orang_pribadi.daftar),
			asc(referensi_lampiran_spt_pph_orang_pribadi.urutan)
		);

	const referensi: Record<string, string[]> = {};
	for (const row of rows) {
		(referensi[row.daftar] ??= []).push(row.nama);
	}

	return referensi;
});
