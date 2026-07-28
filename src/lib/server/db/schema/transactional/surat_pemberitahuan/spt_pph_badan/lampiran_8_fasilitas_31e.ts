import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { spt_pph_badan } from './spt_pph_badan';

export const spt_pph_badan_lampiran_8_fasilitas_31e = sqliteTable(
	'spt_pph_badan_lampiran_8_fasilitas_31e',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		sptPphBadanId: text('spt_pph_badan_id')
			.notNull()
			.references(() => spt_pph_badan.id, { onDelete: 'cascade' }),
		jumlahPeredaranBruto: integer('jumlah_peredaran_bruto').notNull().default(0),
		penghasilanKenaPajakMendapatFasilitas: integer('penghasilan_kena_pajak_mendapat_fasilitas')
			.notNull()
			.default(0),
		penghasilanKenaPajakTidakMendapatFasilitas: integer(
			'penghasilan_kena_pajak_tidak_mendapat_fasilitas'
		)
			.notNull()
			.default(0),
		pphTerutangMendapatFasilitas: integer('pph_terutang_mendapat_fasilitas')
			.notNull()
			.default(0),
		pphTerutangTidakMendapatFasilitas: integer('pph_terutang_tidak_mendapat_fasilitas')
			.notNull()
			.default(0),
		pphTerutangJumlah: integer('pph_terutang_jumlah').notNull().default(0)
	},
	(t) => [uniqueIndex('spt_pph_badan_lampiran_8_spt_unique').on(t.sptPphBadanId)]
);
