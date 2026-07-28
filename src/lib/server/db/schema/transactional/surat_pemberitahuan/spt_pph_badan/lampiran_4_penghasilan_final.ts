import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { jenis_penghasilan_bukan_objek_pajak_spt_pph_badan } from '../../../references/spt_pph_badan/jenis_penghasilan_bukan_objek_pajak';
import { objek_pajak_spt_pph_badan } from '../../../references/spt_pph_badan/objek_pajak';
import { spt_pph_badan } from './spt_pph_badan';

export const spt_pph_badan_lampiran_4_pph_final = sqliteTable('spt_pph_badan_lampiran_4_pph_final', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	sptPphBadanId: text('spt_pph_badan_id')
		.notNull()
		.references(() => spt_pph_badan.id, { onDelete: 'cascade' }),
	nomorUrut: integer('nomor_urut').notNull(),
	npwpPemotongPemungutPenyetor: text('npwp_pemotong_pemungut_penyetor').notNull().default(''),
	namaPemotongPemungutPenyetor: text('nama_pemotong_pemungut_penyetor').notNull().default(''),
	objekPajakId: text('objek_pajak_id')
		.notNull()
		.references(() => objek_pajak_spt_pph_badan.id),
	dasarPengenaanPajak: integer('dasar_pengenaan_pajak').notNull().default(0),
	tarif: integer('tarif').notNull().default(0),
	pphFinalTerutang: integer('pph_final_terutang').notNull().default(0),
	nomorBuktiPotong: text('nomor_bukti_potong').notNull().default(''),
	tanggalBuktiPotong: text('tanggal_bukti_potong'),
	keterangan: text('keterangan').notNull().default('')
});

export const spt_pph_badan_lampiran_4_bukan_objek_pajak = sqliteTable(
	'spt_pph_badan_lampiran_4_bukan_objek_pajak',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		sptPphBadanId: text('spt_pph_badan_id')
			.notNull()
			.references(() => spt_pph_badan.id, { onDelete: 'cascade' }),
		nomorUrut: integer('nomor_urut').notNull(),
		jenisPenghasilanId: text('jenis_penghasilan_id')
			.notNull()
			.references(() => jenis_penghasilan_bukan_objek_pajak_spt_pph_badan.id),
		sumberPenghasilan: text('sumber_penghasilan').notNull().default(''),
		penghasilanBruto: integer('penghasilan_bruto').notNull().default(0),
		keterangan: text('keterangan').notNull().default('')
	}
);
