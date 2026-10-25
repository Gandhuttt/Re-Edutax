import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { wajib_pajak } from '../wajib_pajak/wajib_pajak';
import type { Spt2126Input, Spt2126Snapshot } from '$lib/helpers/spt-pph-2126';

export const spt_pph_2126 = sqliteTable('spt_pph_2126', {
	id: text('id').primaryKey(),
	npwpPemotong: text('npwp_pemotong').notNull().references(() => wajib_pajak.npwp),
	namaPemotong: text('nama_pemotong').notNull(),
	masaPajak: integer('masa_pajak').notNull(),
	tahun: integer('tahun').notNull(),
	chainId: text('chain_id').notNull(),
	pembetulanKe: integer('pembetulan_ke').notNull().default(0),
	status: text('status', { enum: ['konsep', 'menunggu_pembayaran', 'dilaporkan'] }).notNull().default('konsep'),
	revision: integer('revision').notNull().default(0),
	input: text('input', { mode: 'json' }).$type<Spt2126Input>().notNull(),
	snapshot: text('snapshot', { mode: 'json' }).$type<Spt2126Snapshot>(),
	sourceSignature: text('source_signature'),
	pembayaran21: integer('pembayaran21').notNull().default(0),
	pembayaran26: integer('pembayaran26').notNull().default(0),
	kredit21: integer('kredit21').notNull().default(0),
	kredit26: integer('kredit26').notNull().default(0),
	createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
	tanggalPosting: integer('tanggal_posting', { mode: 'timestamp_ms' }),
	tanggalDilaporkan: integer('tanggal_dilaporkan', { mode: 'timestamp_ms' })
}, (t) => [
	index('spt2126_owner_idx').on(t.npwpPemotong, t.tahun, t.masaPajak),
	uniqueIndex('spt2126_chain_revision_idx').on(t.chainId, t.pembetulanKe),
	uniqueIndex('spt2126_period_idx').on(t.npwpPemotong, t.tahun, t.masaPajak, t.pembetulanKe)
]);

// Waiting amendments retain old reported consumption plus their new reservation.
// Payment replaces that union; reopening removes only new reservations.
export const spt_pph_2126_kompensasi = sqliteTable('spt_pph_2126_kompensasi', {
	id: text('id').primaryKey(),
	npwpPemotong: text('npwp_pemotong').notNull().references(() => wajib_pajak.npwp),
	sourceChainId: text('source_chain_id').notNull(),
	consumerChainId: text('consumer_chain_id').notNull(),
	pasal: integer('pasal').notNull(),
	jumlah: integer('jumlah').notNull()
}, (t) => [
	index('spt2126_comp_source_idx').on(t.npwpPemotong, t.sourceChainId, t.pasal),
	uniqueIndex('spt2126_comp_consumer_idx').on(t.consumerChainId, t.pasal, t.sourceChainId)
]);
