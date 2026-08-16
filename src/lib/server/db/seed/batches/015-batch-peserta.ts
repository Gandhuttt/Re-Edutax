import { inArray } from 'drizzle-orm';
import { batchNumberFromNpwp, urutFromNpwp } from '../../../../helpers/npwp';
import { batch_peserta, npwp_terbit, wajib_pajak } from '../../schema';
import type { SeedContext } from '../context';

/**
 * Turns the batch number that used to live only inside each peserta's NPWP into real
 * batch_peserta rows, links existing peserta to them, and records every number in the
 * npwp_terbit ledger so none of them can ever be reissued. Numbers are left untouched — the
 * pre-existing `33...` accounts keep the NPWP they were seeded with.
 */
const namaBatch = (nomor: number) => `Batch ${String(nomor).padStart(2, '0')}`;

const polaEmail = (nomor: number) => `batch${String(nomor).padStart(2, '0')}.peserta{n}@example.com`;

export const name = '015 batch peserta';

export const run = async ({ db }: SeedContext) => {
	const peserta = await db
		.select({ npwp: wajib_pajak.npwp, nama: wajib_pajak.nama })
		.from(wajib_pajak);

	// Only the simulated peserta numbers encode a batch; the demo badan accounts
	// (0123456789012000 and friends) are left without one.
	const anggota = peserta.flatMap((row) => {
		if (!row.npwp.startsWith('33') || row.npwp.length !== 16) return [];

		const nomor = batchNumberFromNpwp(row.npwp);
		const urut = urutFromNpwp(row.npwp);

		return Number.isNaN(nomor) || nomor < 1 || Number.isNaN(urut)
			? []
			: [{ npwp: row.npwp, nama: row.nama, nomor, urut }];
	});

	const nomorBatch = [...new Set(anggota.map((row) => row.nomor))].sort((a, b) => a - b);

	for (const nomor of nomorBatch) {
		await db
			.insert(batch_peserta)
			.values({ nomor, nama: namaBatch(nomor), polaEmail: polaEmail(nomor) })
			.onConflictDoNothing({ target: batch_peserta.nomor });
	}

	const batches = await db
		.select({ id: batch_peserta.id, nomor: batch_peserta.nomor })
		.from(batch_peserta)
		.where(inArray(batch_peserta.nomor, nomorBatch.length > 0 ? nomorBatch : [-1]));

	for (const batch of batches) {
		const anggotaBatch = anggota.filter((row) => row.nomor === batch.nomor);

		if (anggotaBatch.length === 0) continue;

		await db
			.update(wajib_pajak)
			.set({ batchId: batch.id })
			.where(
				inArray(
					wajib_pajak.npwp,
					anggotaBatch.map((row) => row.npwp)
				)
			);

		for (const row of anggotaBatch) {
			await db
				.insert(npwp_terbit)
				.values({
					npwp: row.npwp,
					urut: row.urut,
					namaPertama: row.nama,
					batchId: batch.id
				})
				.onConflictDoNothing({ target: npwp_terbit.npwp });
		}

		console.log(`Batch ${batch.nomor}: ${anggotaBatch.length} peserta`);
	}

	return [];
};
