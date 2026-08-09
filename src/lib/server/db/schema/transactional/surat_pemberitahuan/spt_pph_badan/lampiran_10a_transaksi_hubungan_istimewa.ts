import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { bentuk_hubungan_istimewa_spt_pph_badan } from '../../../references/spt_pph_badan/bentuk_hubungan_istimewa';
import { jenis_transaksi_hubungan_istimewa_spt_pph_badan } from '../../../references/spt_pph_badan/jenis_transaksi_hubungan_istimewa';
import { metode_penentuan_harga_transfer_spt_pph_badan } from '../../../references/spt_pph_badan/metode_penentuan_harga_transfer';
import { negara_spt_pph_badan } from '../../../references/spt_pph_badan/negara';
import { spt_pph_badan } from './spt_pph_badan';

export const spt_pph_badan_lampiran_10a_transaksi = sqliteTable('spt_pph_badan_lampiran_10a_transaksi', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	sptPphBadanId: text('spt_pph_badan_id')
		.notNull()
		.references(() => spt_pph_badan.id, { onDelete: 'cascade' }),
	nomorUrut: integer('nomor_urut').notNull(),
	nama: text('nama').notNull(),
	npwpTin: text('npwp_tin').notNull().default(''),
	negaraId: text('negara_id').references(() => negara_spt_pph_badan.id),
	bentukHubunganId: text('bentuk_hubungan_id')
		.notNull()
		.references(() => bentuk_hubungan_istimewa_spt_pph_badan.id),
	kegiatanUsaha: text('kegiatan_usaha').notNull().default(''),
	jenisTransaksiId: text('jenis_transaksi_id')
		.notNull()
		.references(() => jenis_transaksi_hubungan_istimewa_spt_pph_badan.id),
	nilaiTransaksi: integer('nilai_transaksi').notNull().default(0),
	metodePenentuanHargaTransferId: text('metode_penentuan_harga_transfer_id')
		.notNull()
		.references(() => metode_penentuan_harga_transfer_spt_pph_badan.id),
	alasanPenggunaanMetode: text('alasan_penggunaan_metode').notNull().default('')
});
