import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { spt_pph_badan } from './spt_pph_badan';

export const spt_pph_badan_lampiran_13b_a_kerjasama = sqliteTable('spt_pph_badan_lampiran_13b_a_kerjasama', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	sptPphBadanId: text('spt_pph_badan_id')
		.notNull()
		.references(() => spt_pph_badan.id, { onDelete: 'cascade' }),
	nomorUrut: integer('nomor_urut').notNull(),
	perjanjianNomor: text('perjanjian_nomor').notNull().default(''),
	perjanjianTanggal: text('perjanjian_tanggal').notNull().default(''),
	mitraKegiatan: text('mitra_kegiatan').notNull().default(''),
	keterangan: text('keterangan').notNull().default('')
});
