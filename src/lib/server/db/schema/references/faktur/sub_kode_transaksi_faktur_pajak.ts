import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { kode_transaksi_faktur_pajak } from './kode_transaksi_faktur_pajak';

export const sub_kode_transaksi_faktur_pajak = sqliteTable(
	'sub_kode_transaksi_faktur_pajak',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),

		kodeTransaksiId: text('kode_transaksi_id')
			.notNull()
			.references(() => kode_transaksi_faktur_pajak.id),
		kode: integer('kode').notNull(),
		nama: text('nama').notNull(),
		deskripsi: text('deskripsi'),
		aktif: integer('aktif', { mode: 'boolean' }).notNull().default(true)
	},
	(t) => [
		uniqueIndex('sub_kode_transaksi_faktur_pajak_parent_kode_unique').on(
			t.kodeTransaksiId,
			t.kode
		)
	]
);
