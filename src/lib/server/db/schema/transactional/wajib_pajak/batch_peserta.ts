import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { createdAt } from '$lib/server/db/helpers/timestamps';

/**
 * A cohort of training participants. The batch owns its numbering (digits 13-14 of every
 * member's NPWP) plus the defaults used when accounts are created for it, so the admin only
 * has to supply names.
 */
export const batch_peserta = sqliteTable(
	'batch_peserta',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		nomor: integer('nomor').notNull().unique(),
		nama: text('nama').notNull(),
		polaEmail: text('pola_email').notNull().default('peserta{n}@example.com'),
		passwordDefault: text('password_default').notNull().default('123'),
		createdAt: createdAt()
	},
	(t) => [uniqueIndex('batch_peserta_nomor_unique').on(t.nomor)]
);
