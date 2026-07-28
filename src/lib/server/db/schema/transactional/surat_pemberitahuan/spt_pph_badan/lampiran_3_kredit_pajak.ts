import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { jenis_penghasilan_kredit_pajak_luar_negeri_spt_pph_badan } from '../../../references/spt_pph_badan/jenis_penghasilan_kredit_pajak_luar_negeri';
import { mata_uang_spt_pph_badan } from '../../../references/spt_pph_badan/mata_uang';
import { negara_spt_pph_badan } from '../../../references/spt_pph_badan/negara';
import { spt_pph_badan } from './spt_pph_badan';

export const spt_pph_badan_lampiran_3_penghasilan_luar_negeri = sqliteTable(
	'spt_pph_badan_lampiran_3_penghasilan_luar_negeri',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		sptPphBadanId: text('spt_pph_badan_id')
			.notNull()
			.references(() => spt_pph_badan.id, { onDelete: 'cascade' }),
		nomorUrut: integer('nomor_urut').notNull(),
		namaPemberiPenghasilan: text('nama_pemberi_penghasilan').notNull(),
		negaraId: text('negara_id')
			.notNull()
			.references(() => negara_spt_pph_badan.id),
		tanggal: text('tanggal').notNull(),
		jenisPenghasilanId: text('jenis_penghasilan_id')
			.notNull()
			.references(() => jenis_penghasilan_kredit_pajak_luar_negeri_spt_pph_badan.id),
		penghasilanNeto: integer('penghasilan_neto').notNull().default(0),
		pphLuarNegeri: integer('pph_luar_negeri').notNull().default(0),
		mataUangId: text('mata_uang_id').references(() => mata_uang_spt_pph_badan.id),
		pphLuarNegeriMataUangAsing: integer('pph_luar_negeri_mata_uang_asing').notNull().default(0),
		kreditPajakYangDapatDikreditkan: integer('kredit_pajak_yang_dapat_dikreditkan')
			.notNull()
			.default(0),
		keterangan: text('keterangan').notNull().default('')
	}
);

export const spt_pph_badan_lampiran_3_pph_dipotong = sqliteTable(
	'spt_pph_badan_lampiran_3_pph_dipotong',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		sptPphBadanId: text('spt_pph_badan_id')
			.notNull()
			.references(() => spt_pph_badan.id, { onDelete: 'cascade' }),
		nomorUrut: integer('nomor_urut').notNull(),
		namaPemotongPemungut: text('nama_pemotong_pemungut').notNull(),
		npwpPemotongPemungut: text('npwp_pemotong_pemungut').notNull().default(''),
		jenisPajak: text('jenis_pajak', {
			enum: [
				'pph_pasal_15',
				'pph_pasal_21',
				'pph_pasal_22',
				'pph_pasal_23',
				'pph_pasal_26',
				'pph_ditanggung_pemerintah',
				'pph_ditanggung_pemerintah_proyek_bantuan_luar_negeri',
				'sisa_lb_tidak_dikembalikan'
			]
		}).notNull(),
		dpp: integer('dpp').notNull().default(0),
		pph: integer('pph').notNull().default(0),
		nomorBukti: text('nomor_bukti').notNull().default(''),
		tanggalBukti: text('tanggal_bukti').notNull().default(''),
		keterangan: text('keterangan').notNull().default('')
	}
);
