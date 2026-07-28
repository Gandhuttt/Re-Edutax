import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { spt_pph_badan } from './spt_pph_badan';

export const spt_pph_badan_lampiran_11b_biaya_pinjaman = sqliteTable(
	'spt_pph_badan_lampiran_11b_biaya_pinjaman',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		sptPphBadanId: text('spt_pph_badan_id')
			.notNull()
			.references(() => spt_pph_badan.id, { onDelete: 'cascade' }),
		metode: text('metode', { enum: ['tidak_menghitung', 'ebitda', 'der'] }).notNull(),
		labaRugiSebelumPajak: integer('laba_rugi_sebelum_pajak').notNull().default(0),
		biayaPinjaman: integer('biaya_pinjaman').notNull().default(0),
		penyusutanAmortisasi: integer('penyusutan_amortisasi').notNull().default(0),
		ebitda: integer('ebitda').notNull().default(0),
		batasBiayaPinjaman: integer('batas_biaya_pinjaman').notNull().default(0),
		biayaPinjamanYangDapatDibebankan: integer('biaya_pinjaman_yang_dapat_dibebankan')
			.notNull()
			.default(0),
		rataRataUtang: integer('rata_rata_utang').notNull().default(0),
		rataRataModal: integer('rata_rata_modal').notNull().default(0),
		rasioDer: integer('rasio_der').notNull().default(0),
		batasMaksimalDer: integer('batas_maksimal_der').notNull().default(0),
		koreksiFiskalPositif: integer('koreksi_fiskal_positif').notNull().default(0),
		keterangan: text('keterangan').notNull().default('')
	},
	(t) => [uniqueIndex('spt_pph_badan_lampiran_11b_spt_unique').on(t.sptPphBadanId)]
);
