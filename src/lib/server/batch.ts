import { eq, isNull, max } from 'drizzle-orm';
import {
	maxBatchNumber,
	maxLoneSerial,
	maxUrutPerBatch,
	npwpForBatch,
	npwpForLone
} from '$lib/helpers/npwp';
import { db } from './db';
import { batch_peserta, npwp_terbit } from './db/schema';

export type NpwpAllocation = { npwp: string; urut: number };

/**
 * Next peserta number in a batch. Read from the npwp_terbit ledger rather than from the
 * batch's current members, so a number stays retired after its owner is deleted.
 */
export const nextNpwpForBatch = async (batchId: string): Promise<NpwpAllocation | null> => {
	const [batch] = await db
		.select({ nomor: batch_peserta.nomor })
		.from(batch_peserta)
		.where(eq(batch_peserta.id, batchId))
		.limit(1);

	if (!batch) return null;

	const [{ tertinggi }] = await db
		.select({ tertinggi: max(npwp_terbit.urut) })
		.from(npwp_terbit)
		.where(eq(npwp_terbit.batchId, batchId));

	const urut = (tertinggi ?? 0) + 1;

	return urut > maxUrutPerBatch ? null : { npwp: npwpForBatch(batch.nomor, urut), urut };
};

/** Next number in the lone population, which never touches the reserved batch digits. */
export const nextNpwpForLone = async (): Promise<NpwpAllocation | null> => {
	const [{ tertinggi }] = await db
		.select({ tertinggi: max(npwp_terbit.urut) })
		.from(npwp_terbit)
		.where(isNull(npwp_terbit.batchId));

	const urut = (tertinggi ?? 0) + 1;

	return urut > maxLoneSerial ? null : { npwp: npwpForLone(urut), urut };
};

/** Batch numbers are assigned by the system, never chosen — always the next one up. */
export const nextBatchNumber = async () => {
	const [{ tertinggi }] = await db.select({ tertinggi: max(batch_peserta.nomor) }).from(batch_peserta);

	const nomor = (tertinggi ?? 0) + 1;

	return nomor > maxBatchNumber ? null : nomor;
};
