import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { kode_transaksi_faktur_pajak } from '../../references/faktur/kode_transaksi_faktur_pajak';
import { wajib_pajak } from '../wajib_pajak/wajib_pajak';

export const faktur_pajak = sqliteTable('faktur_pajak', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),

	npwpPenjual: text('npwp_penjual')
		.notNull()
		.references(() => wajib_pajak.npwp),
	npwpPembeli: text('npwp_pembeli').default(''),

	nomorFaktur: text('nomor_faktur').default(''),
	kodeTransaksiId: text('kode_transaksi_id')
		.notNull()
		.references(() => kode_transaksi_faktur_pajak.id),

	referensi: text('referensi').notNull().default(''),
	alamat: text('alamat').notNull().default(''),

	uangMuka: integer('uang_muka', { mode: 'boolean' }).notNull().default(false),
	pelunasan: integer('pelunasan', { mode: 'boolean' }).notNull().default(false),

	// pls change to sql functions
	tanggalFaktur: text('tanggal_faktur')
		.notNull()
		.$defaultFn(() => new Date().toISOString().slice(0, 10)),
	masaPajak: integer('masa_pajak')
		.notNull()
		.$defaultFn(() => new Date().getMonth() + 1),
	tahun: integer('tahun')
		.notNull()
		.$defaultFn(() => new Date().getFullYear()),

	diupload: integer('diupload', { mode: 'boolean' }).notNull().default(false),
	dikreditkan: integer('dikreditkan', { mode: 'boolean' }).notNull().default(false)
});
