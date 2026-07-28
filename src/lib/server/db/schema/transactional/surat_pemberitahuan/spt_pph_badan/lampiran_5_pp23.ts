import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { spt_pph_badan } from './spt_pph_badan';

export const spt_pph_badan_lampiran_5_tku = sqliteTable('spt_pph_badan_lampiran_5_tku', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	sptPphBadanId: text('spt_pph_badan_id')
		.notNull()
		.references(() => spt_pph_badan.id, { onDelete: 'cascade' }),
	nitku: text('nitku').notNull(),
	nama: text('nama').notNull(),
	alamat: text('alamat').notNull().default(''),
	kelurahan: text('kelurahan').notNull().default(''),
	kecamatan: text('kecamatan').notNull().default(''),
	kabupaten: text('kabupaten').notNull().default(''),
	provinsi: text('provinsi').notNull().default('')
});

export const spt_pph_badan_lampiran_5_pp23_bulanan = sqliteTable(
	'spt_pph_badan_lampiran_5_pp23_bulanan',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		tkuId: text('tku_id')
			.notNull()
			.references(() => spt_pph_badan_lampiran_5_tku.id, { onDelete: 'cascade' }),
		bulan: integer('bulan').notNull(),
		jumlahPeredaranBruto: integer('jumlah_peredaran_bruto').notNull().default(0),
		jumlahPphFinalTerutang: integer('jumlah_pph_final_terutang').notNull().default(0),
		pphFinalDisetorSendiri: integer('pph_final_disetor_sendiri').notNull().default(0),
		pphFinalDipotongDipungutPihakLain: integer('pph_final_dipotong_dipungut_pihak_lain')
			.notNull()
			.default(0),
		selisih: integer('selisih').notNull().default(0)
	},
	(t) => [uniqueIndex('spt_pph_badan_lampiran_5_pp23_bulanan_unique').on(t.tkuId, t.bulan)]
);
