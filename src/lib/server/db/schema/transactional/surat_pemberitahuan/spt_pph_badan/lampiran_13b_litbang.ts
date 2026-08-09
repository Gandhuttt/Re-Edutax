import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { spt_pph_badan } from './spt_pph_badan';

export const spt_pph_badan_lampiran_13b_c_litbang = sqliteTable('spt_pph_badan_lampiran_13b_c_litbang', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	sptPphBadanId: text('spt_pph_badan_id')
		.notNull()
		.references(() => spt_pph_badan.id, { onDelete: 'cascade' }),
	nomorUrut: integer('nomor_urut').notNull(),
	nomorProposal: text('nomor_proposal').notNull().default(''),
	jangkaWaktuDariTahun: integer('jangka_waktu_dari_tahun'),
	jangkaWaktuSampaiTahun: integer('jangka_waktu_sampai_tahun'),
	jumlahBiaya: integer('jumlah_biaya').notNull().default(0),
	tahunPerolehanHki: integer('tahun_perolehan_hki'),
	persentaseFasilitasPajak: integer('persentase_fasilitas_pajak').notNull().default(0),
	tambahanPengurang: integer('tambahan_pengurang').notNull().default(0)
});
