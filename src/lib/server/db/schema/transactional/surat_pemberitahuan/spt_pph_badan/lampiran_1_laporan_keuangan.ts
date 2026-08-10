import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { kode_koreksi_fiskal_spt_pph_badan } from '../../../references/spt_pph_badan/kode_koreksi_fiskal';
import { spt_pph_badan_lampiran_1_akun } from '../../../references/spt_pph_badan/lampiran_1_akun';
import { spt_pph_badan } from './spt_pph_badan';

export const spt_pph_badan_lampiran_1_laba_rugi = sqliteTable(
	'spt_pph_badan_lampiran_1_laba_rugi',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		sptPphBadanId: text('spt_pph_badan_id')
			.notNull()
			.references(() => spt_pph_badan.id, { onDelete: 'cascade' }),
		akunId: text('akun_id')
			.notNull()
			.references(() => spt_pph_badan_lampiran_1_akun.id),
		nilaiKomersial: integer('nilai_komersial').notNull().default(0),
		nonObjekPajak: integer('non_objek_pajak').notNull().default(0),
		dikenakanPphFinal: integer('dikenakan_pph_final').notNull().default(0),
		penyesuaianFiskalPositif: integer('penyesuaian_fiskal_positif').notNull().default(0),
		penyesuaianFiskalNegatif: integer('penyesuaian_fiskal_negatif').notNull().default(0)
	},
	(t) => [
		uniqueIndex('spt_pph_badan_lampiran_1_laba_rugi_spt_akun_unique').on(t.sptPphBadanId, t.akunId)
	]
);

export const spt_pph_badan_lampiran_1_laba_rugi_koreksi_fiskal = sqliteTable(
	'spt_pph_badan_lampiran_1_laba_rugi_koreksi_fiskal',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		labaRugiId: text('laba_rugi_id')
			.notNull()
			.references(() => spt_pph_badan_lampiran_1_laba_rugi.id, { onDelete: 'cascade' }),
		kodeKoreksiFiskalId: text('kode_koreksi_fiskal_id')
			.notNull()
			.references(() => kode_koreksi_fiskal_spt_pph_badan.id)
	},
	(t) => [
		uniqueIndex('spt_pph_badan_lampiran_1_laba_rugi_koreksi_fiskal_unique').on(
			t.labaRugiId,
			t.kodeKoreksiFiskalId
		)
	]
);
