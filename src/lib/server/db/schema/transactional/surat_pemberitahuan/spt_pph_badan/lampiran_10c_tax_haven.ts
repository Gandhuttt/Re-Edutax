import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { jenis_transaksi_hubungan_istimewa_spt_pph_badan } from '../../../references/spt_pph_badan/jenis_transaksi_hubungan_istimewa';
import { negara_spt_pph_badan } from '../../../references/spt_pph_badan/negara';
import { spt_pph_badan } from './spt_pph_badan';

export const spt_pph_badan_lampiran_10c_transaksi = sqliteTable('spt_pph_badan_lampiran_10c_transaksi', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	sptPphBadanId: text('spt_pph_badan_id')
		.notNull()
		.references(() => spt_pph_badan.id, { onDelete: 'cascade' }),
	nomorUrut: integer('nomor_urut').notNull(),
	namaMitraTransaksi: text('nama_mitra_transaksi').notNull(),
	jenisTransaksiId: text('jenis_transaksi_id')
		.notNull()
		.references(() => jenis_transaksi_hubungan_istimewa_spt_pph_badan.id),
	negaraId: text('negara_id')
		.notNull()
		.references(() => negara_spt_pph_badan.id),
	nilaiTransaksi: integer('nilai_transaksi').notNull().default(0)
});

export const spt_pph_badan_lampiran_10c_pernyataan = sqliteTable(
	'spt_pph_badan_lampiran_10c_pernyataan',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		sptPphBadanId: text('spt_pph_badan_id')
			.notNull()
			.references(() => spt_pph_badan.id, { onDelete: 'cascade' }),
		ditentukanPrinsip: integer('ditentukan_prinsip', { mode: 'boolean' })
	},
	(t) => [uniqueIndex('spt_pph_badan_lampiran_10c_pernyataan_spt_unique').on(t.sptPphBadanId)]
);
