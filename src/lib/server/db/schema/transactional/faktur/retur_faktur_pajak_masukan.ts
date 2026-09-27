import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { faktur_pajak } from './faktur_pajak';

export const retur_faktur_pajak_masukan = sqliteTable(
	'retur_faktur_pajak_masukan',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		fakturPajakId: text('faktur_pajak_id')
			.notNull()
			.references(() => faktur_pajak.id, { onDelete: 'cascade' }),
		nomorRetur: text('nomor_retur'),
		tanggalRetur: text('tanggal_retur').notNull(),
		masaPajak: integer('masa_pajak').notNull(),
		tahun: integer('tahun').notNull(),
		status: text('status', {
			enum: ['konsep', 'diunggah', 'dibatalkan']
		})
			.notNull()
			.default('konsep'),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.notNull()
			.$defaultFn(() => new Date()),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.notNull()
			.$defaultFn(() => new Date())
			.$onUpdate(() => new Date())
	},
	(table) => [
		index('retur_faktur_pajak_masukan_faktur_idx').on(table.fakturPajakId),
		index('retur_faktur_pajak_masukan_period_idx').on(table.masaPajak, table.tahun),
		index('retur_faktur_pajak_masukan_status_idx').on(table.status)
	]
);
