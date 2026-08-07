import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sektor_usaha_spt_pph_badan } from './sektor_usaha';

export const spt_pph_badan_lampiran_1_neraca_akun = sqliteTable(
	'spt_pph_badan_lampiran_1_neraca_akun',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		sektorUsahaId: text('sektor_usaha_id')
			.notNull()
			.references(() => sektor_usaha_spt_pph_badan.id),
		nomorUrut: integer('nomor_urut').notNull(),
		kode: text('kode'),
		namaAkun: text('nama_akun').notNull(),
		rowType: text('row_type', { enum: ['header', 'data', 'sum'] }).notNull(),
		section: text('section', { enum: ['aset', 'liabilitas_ekuitas'] }).notNull(),
		parentKode: text('parent_kode'),
		sign: integer('sign')
	},
	(t) => [index('spt_pph_badan_lampiran_1_neraca_akun_sektor_kode_idx').on(t.sektorUsahaId, t.kode)]
);
