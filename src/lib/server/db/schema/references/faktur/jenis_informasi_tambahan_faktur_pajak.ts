import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { kode_transaksi_faktur_pajak } from './kode_transaksi_faktur_pajak';
import { sub_kode_transaksi_faktur_pajak } from './sub_kode_transaksi_faktur_pajak';

export const jenis_informasi_tambahan_faktur_pajak = sqliteTable(
	'jenis_informasi_tambahan_faktur_pajak',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),

		kodeTransaksiId: text('kode_transaksi_id')
			.notNull()
			.references(() => kode_transaksi_faktur_pajak.id),
		subKodeTransaksiId: text('sub_kode_transaksi_id').references(
			() => sub_kode_transaksi_faktur_pajak.id
		),
		kode: integer('kode').notNull(),
		nama: text('nama').notNull(),
		capFasilitas: text('cap_fasilitas'),
		butuhDokumenPendukung: integer('butuh_dokumen_pendukung', { mode: 'boolean' })
			.notNull()
			.default(false),
		aktif: integer('aktif', { mode: 'boolean' }).notNull().default(true)
	},
	(t) => [
		uniqueIndex('jenis_informasi_tambahan_faktur_pajak_parent_kode_unique').on(
			t.kodeTransaksiId,
			t.subKodeTransaksiId,
			t.kode
		)
	]
);
