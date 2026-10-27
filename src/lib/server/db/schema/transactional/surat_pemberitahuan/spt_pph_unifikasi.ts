import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { wajib_pajak } from '../wajib_pajak/wajib_pajak';
import type { SptUnifikasiSnapshot } from '$lib/helpers/spt-unifikasi';

// Local simulator of SPT Masa PPh Unifikasi built only from issued BPPU slips.
// `snapshot` is the user-verified aggregation, `sourceSignature` the deterministic
// DB-side signature of every source row (and reference name) that produced it.
// `pembayaran` records the amount actually paid per KAP-KJS when the declaration
// became `dilaporkan`; amendments sum these cumulatively per KAP-KJS.
export const spt_pph_unifikasi = sqliteTable('spt_pph_unifikasi', {
	id: text('id').primaryKey(),
	npwpPemotong: text('npwp_pemotong').notNull().references(() => wajib_pajak.npwp),
	namaPemotong: text('nama_pemotong').notNull(),
	masaPajak: integer('masa_pajak').notNull(),
	tahun: integer('tahun').notNull(),
	chainId: text('chain_id').notNull(),
	pembetulanKe: integer('pembetulan_ke').notNull().default(0),
	status: text('status', { enum: ['konsep', 'menunggu_pembayaran', 'dilaporkan'] }).notNull().default('konsep'),
	revision: integer('revision').notNull().default(0),
	snapshot: text('snapshot', { mode: 'json' }).$type<SptUnifikasiSnapshot>().notNull(),
	sourceSignature: text('source_signature').notNull(),
	pernyataan: integer('pernyataan', { mode: 'boolean' }).notNull().default(false),
	pembayaran: text('pembayaran', { mode: 'json' }).$type<Record<string, number>>().notNull(),
	createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
	tanggalDiperbarui: integer('tanggal_diperbarui', { mode: 'timestamp_ms' }),
	tanggalDilaporkan: integer('tanggal_dilaporkan', { mode: 'timestamp_ms' })
}, (t) => [
	index('spt_unifikasi_owner_idx').on(t.npwpPemotong, t.tahun, t.masaPajak),
	uniqueIndex('spt_unifikasi_chain_revision_idx').on(t.chainId, t.pembetulanKe),
	uniqueIndex('spt_unifikasi_period_idx').on(t.npwpPemotong, t.tahun, t.masaPajak, t.pembetulanKe)
]);
