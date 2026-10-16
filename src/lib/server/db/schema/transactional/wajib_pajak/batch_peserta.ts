import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { createdAt } from '$lib/server/db/helpers/timestamps';

/**
 * A cohort of training participants. It owns the defaults used when accounts are created for
 * it, plus how its members are numbered (`penomoran`):
 *   - `urut`: the system issues the NPWP (batch digits + urut, see helpers/npwp.ts). Every
 *     batch that existed before NIK numbering keeps this, which is why it is the column default.
 *   - `nik`: the peserta's own NIK is the NPWP and the login username. No number is issued,
 *     so nothing is written to npwp_terbit. New batches are created this way.
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
		penomoran: text('penomoran', { enum: ['urut', 'nik'] })
			.notNull()
			.default('urut'),
		createdAt: createdAt()
	},
	(t) => [uniqueIndex('batch_peserta_nomor_unique').on(t.nomor)]
);
