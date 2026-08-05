import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { negara_spt_pph_badan } from '../../../references/spt_pph_badan/negara';
import { spt_pph_badan } from './spt_pph_badan';

export const spt_pph_badan_lampiran_2_pihak = sqliteTable('spt_pph_badan_lampiran_2_pihak', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	sptPphBadanId: text('spt_pph_badan_id')
		.notNull()
		.references(() => spt_pph_badan.id, { onDelete: 'cascade' }),
	jenis: text('jenis', { enum: ['pemegang_saham', 'pengurus_komisaris'] }).notNull(),
	nomorUrut: integer('nomor_urut').notNull(),
	nama: text('nama').notNull(),
	alamat: text('alamat').notNull().default(''),
	negaraId: text('negara_id').references(() => negara_spt_pph_badan.id),
	npwpNikTin: text('npwp_nik_tin').notNull().default(''),
	jabatan: text('jabatan').notNull().default(''),
	modalSahamNominal: integer('modal_saham_nominal').notNull().default(0),
	modalSahamPersentase: integer('modal_saham_persentase').notNull().default(0),
	dividenDiterima: integer('dividen_diterima').notNull().default(0),
	keterangan: text('keterangan').notNull().default('')
});

export const spt_pph_badan_lampiran_2_afiliasi = sqliteTable('spt_pph_badan_lampiran_2_afiliasi', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	sptPphBadanId: text('spt_pph_badan_id')
		.notNull()
		.references(() => spt_pph_badan.id, { onDelete: 'cascade' }),
	nomorUrut: integer('nomor_urut').notNull(),
	namaPihakAfiliasi: text('nama_pihak_afiliasi').notNull(),
	negaraId: text('negara_id').references(() => negara_spt_pph_badan.id),
	npwpTin: text('npwp_tin').notNull().default(''),
	penyertaanModalNilai: integer('penyertaan_modal_nilai').notNull().default(0),
	penyertaanModalPersentase: integer('penyertaan_modal_persentase').notNull().default(0),
	utangNilai: integer('utang_nilai').notNull().default(0),
	utangTahun: integer('utang_tahun'),
	utangBungaPersentase: integer('utang_bunga_persentase').notNull().default(0),
	piutangNilai: integer('piutang_nilai').notNull().default(0),
	piutangTahun: integer('piutang_tahun'),
	piutangBungaPersentase: integer('piutang_bunga_persentase').notNull().default(0),
	keterangan: text('keterangan').notNull().default('')
});
