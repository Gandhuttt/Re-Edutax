import { query } from '$app/server';
import { requireAdmin } from '$lib/server/admin';
import { nextBatchNumber, nextNpwpForBatch, nextNpwpForLone } from '$lib/server/batch';
import { db } from '$lib/server/db';
import { batch_peserta, wajib_pajak } from '$lib/server/db/schema';
import { asc, count } from 'drizzle-orm';

export const listBatch = query(async () => {
	requireAdmin();

	const [batches, anggota, alokasiLone, nomorBaru] = await Promise.all([
		db.select().from(batch_peserta).orderBy(asc(batch_peserta.nomor)),
		db
			.select({ batchId: wajib_pajak.batchId, jumlah: count() })
			.from(wajib_pajak)
			.groupBy(wajib_pajak.batchId),
		nextNpwpForLone(),
		nextBatchNumber()
	]);

	const jumlahPerBatch = new Map(anggota.map((row) => [row.batchId ?? '', row.jumlah]));

	const daftar = await Promise.all(
		batches.map(async (batch) => {
			const alokasi = await nextNpwpForBatch(batch.id);

			return {
				...batch,
				jumlahAnggota: jumlahPerBatch.get(batch.id) ?? 0,
				npwpBerikutnya: alokasi?.npwp ?? null,
				urutBerikutnya: alokasi?.urut ?? null
			};
		})
	);

	return {
		batches: daftar,
		npwpLoneBerikutnya: alokasiLone?.npwp ?? null,
		nomorBatchBerikutnya: nomorBaru
	};
});
