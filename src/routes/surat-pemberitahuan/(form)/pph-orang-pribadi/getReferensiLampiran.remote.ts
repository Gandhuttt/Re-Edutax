import { query } from '$app/server';
import { db } from '$lib/server/db';
import { referensi_lampiran_spt_pph_orang_pribadi } from '$lib/server/db/schema';
import { asc, eq } from 'drizzle-orm';

// Every lampiran dropdown list, keyed by `daftar`, loaded in one query.
//
// Returns two views of the same rows:
//   `daftar` -- the option descriptions, the values the selects bind to.
//   `kode`   -- daftar -> deskripsi -> DJP's code, for the lists that have one.
//
// Keeping them separate means the selects stay plain string lists while the
// disabled KODE cells can derive their value from the chosen description, which
// is what Coretax itself does. Lists with no codes fetched yet are simply absent
// from `kode`, and those KODE cells stay blank as before.
//
// Order is DJP's own and is preserved: the lists are deliberately not sorted or
// deduplicated, so `urutan` is the only correct ordering.
export const getReferensiLampiran = query(async () => {
	const rows = await db
		.select({
			daftar: referensi_lampiran_spt_pph_orang_pribadi.daftar,
			nama: referensi_lampiran_spt_pph_orang_pribadi.nama,
			kode: referensi_lampiran_spt_pph_orang_pribadi.kode
		})
		.from(referensi_lampiran_spt_pph_orang_pribadi)
		.where(eq(referensi_lampiran_spt_pph_orang_pribadi.aktif, true))
		.orderBy(
			asc(referensi_lampiran_spt_pph_orang_pribadi.daftar),
			asc(referensi_lampiran_spt_pph_orang_pribadi.urutan)
		);

	const daftar: Record<string, string[]> = {};
	const kode: Record<string, Record<string, string>> = {};
	for (const row of rows) {
		(daftar[row.daftar] ??= []).push(row.nama);
		if (row.kode !== null) (kode[row.daftar] ??= {})[row.nama] = row.kode;
	}

	return { daftar, kode };
});
