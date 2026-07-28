import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { kode_koreksi_fiskal_spt_pph_badan } from '../../../references/spt_pph_badan/kode_koreksi_fiskal';
import { spt_pph_badan } from './spt_pph_badan';

export const spt_pph_badan_lampiran_1_laba_rugi = sqliteTable('spt_pph_badan_lampiran_1_laba_rugi', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	sptPphBadanId: text('spt_pph_badan_id')
		.notNull()
		.references(() => spt_pph_badan.id, { onDelete: 'cascade' }),
	nomorUrut: integer('nomor_urut').notNull(),
	kodeAkun: text('kode_akun').notNull(),
	namaAkun: text('nama_akun').notNull(),
	kelompokAkun: text('kelompok_akun').notNull().default(''),
	komersial: integer('komersial').notNull().default(0),
	tidakTermasukObjekPajak: integer('tidak_termasuk_objek_pajak').notNull().default(0),
	dikenakanPphFinal: integer('dikenakan_pph_final').notNull().default(0),
	fiskal: integer('fiskal').notNull().default(0),
	keterangan: text('keterangan').notNull().default('')
});

export const spt_pph_badan_lampiran_1_koreksi_fiskal = sqliteTable(
	'spt_pph_badan_lampiran_1_koreksi_fiskal',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		labaRugiId: text('laba_rugi_id')
			.notNull()
			.references(() => spt_pph_badan_lampiran_1_laba_rugi.id, { onDelete: 'cascade' }),
		kodeKoreksiFiskalId: text('kode_koreksi_fiskal_id')
			.notNull()
			.references(() => kode_koreksi_fiskal_spt_pph_badan.id),
		nilai: integer('nilai').notNull().default(0),
		keterangan: text('keterangan').notNull().default('')
	}
);

export const spt_pph_badan_lampiran_1_neraca = sqliteTable('spt_pph_badan_lampiran_1_neraca', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	sptPphBadanId: text('spt_pph_badan_id')
		.notNull()
		.references(() => spt_pph_badan.id, { onDelete: 'cascade' }),
	nomorUrut: integer('nomor_urut').notNull(),
	sisi: text('sisi', { enum: ['aktiva', 'pasiva'] }).notNull(),
	kodeAkun: text('kode_akun').notNull(),
	namaAkun: text('nama_akun').notNull(),
	kelompokAkun: text('kelompok_akun').notNull().default(''),
	nilai: integer('nilai').notNull().default(0),
	isSubtotal: integer('is_subtotal', { mode: 'boolean' }).notNull().default(false),
	keterangan: text('keterangan').notNull().default('')
});
