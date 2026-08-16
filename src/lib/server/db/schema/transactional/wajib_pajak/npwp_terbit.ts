import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createdAt } from '$lib/server/db/helpers/timestamps';
import { batch_peserta } from './batch_peserta';

/**
 * Ledger of every NPWP ever issued. A number belongs to the peserta it was handed to
 * permanently: deleting the account leaves this row behind, so the number can never be
 * allocated to somebody else. Allocation reads the highest `urut` here, not the live
 * membership of a batch.
 */
export const npwp_terbit = sqliteTable(
	'npwp_terbit',
	{
		npwp: text('npwp').primaryKey(),
		// Null for numbers issued outside any batch (the lone population).
		batchId: text('batch_id').references(() => batch_peserta.id),
		// Peserta number within the batch, or the serial within the lone population.
		urut: integer('urut').notNull(),
		namaPertama: text('nama_pertama').notNull(),
		createdAt: createdAt()
	},
	(t) => [index('npwp_terbit_batch_id_idx').on(t.batchId)]
);
