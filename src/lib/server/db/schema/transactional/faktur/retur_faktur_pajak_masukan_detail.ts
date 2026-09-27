import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { transaksi_faktur_pajak } from '../transaksi_faktur/transaksi_faktur_pajak';
import { retur_faktur_pajak_masukan } from './retur_faktur_pajak_masukan';

export const retur_faktur_pajak_masukan_detail = sqliteTable(
	'retur_faktur_pajak_masukan_detail',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		returFakturPajakMasukanId: text('retur_faktur_pajak_masukan_id')
			.notNull()
			.references(() => retur_faktur_pajak_masukan.id, { onDelete: 'cascade' }),
		transaksiFakturPajakId: text('transaksi_faktur_pajak_id')
			.notNull()
			.references(() => transaksi_faktur_pajak.id),
		jumlahDiretur: integer('jumlah_diretur').notNull(),
		potonganDiretur: integer('potongan_diretur').notNull().default(0),
		dppDiretur: integer('dpp_diretur').notNull(),
		dppNilaiLainDiretur: integer('dpp_nilai_lain_diretur').notNull().default(0),
		gunakanDppNilaiLain: integer('gunakan_dpp_nilai_lain', { mode: 'boolean' })
			.notNull()
			.default(false),
		ppnDiretur: integer('ppn_diretur').notNull(),
		ppnbmDiretur: integer('ppnbm_diretur').notNull().default(0)
	},
	(table) => [
		uniqueIndex('retur_faktur_pajak_masukan_detail_line_unique').on(
			table.returFakturPajakMasukanId,
			table.transaksiFakturPajakId
		)
	]
);
