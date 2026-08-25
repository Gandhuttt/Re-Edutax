import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { spt_ppn } from './spt_ppn';

// SPT PPN Induk, Bagian I, PENYERAHAN BARANG DAN JASA. Split out into its own
// 1:1 child table (rather than living on spt_ppn itself) because D1/SQLite
// rejects ALTER TABLE once a table's column count climbs past ~100; this
// section alone is ~36 columns.
export const spt_ppn_penyerahan = sqliteTable(
	'spt_ppn_penyerahan',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		sptPpnId: text('spt_ppn_id')
			.notNull()
			.references(() => spt_ppn.id, { onDelete: 'cascade' }),

		// I.A, Penyerahan BKP/JKP yang terutang PPN.
		iA1: integer('i_a1').notNull().default(0),
		iA2HargaJual: integer('i_a2_harga_jual').notNull().default(0),
		iA2DppNilaiLain: integer('i_a2_dpp_nilai_lain').notNull().default(0),
		iA2Ppn: integer('i_a2_ppn').notNull().default(0),
		iA2Ppnbm: integer('i_a2_ppnbm').notNull().default(0),
		iA3HargaJual: integer('i_a3_harga_jual').notNull().default(0),
		iA3DppNilaiLain: integer('i_a3_dpp_nilai_lain').notNull().default(0),
		iA3Ppn: integer('i_a3_ppn').notNull().default(0),
		iA3Ppnbm: integer('i_a3_ppnbm').notNull().default(0),
		iA4HargaJual: integer('i_a4_harga_jual').notNull().default(0),
		iA4Ppn: integer('i_a4_ppn').notNull().default(0),
		iA4Ppnbm: integer('i_a4_ppnbm').notNull().default(0),
		iA5HargaJual: integer('i_a5_harga_jual').notNull().default(0),
		iA5DppNilaiLain: integer('i_a5_dpp_nilai_lain').notNull().default(0),
		iA5Ppn: integer('i_a5_ppn').notNull().default(0),
		iA5Ppnbm: integer('i_a5_ppnbm').notNull().default(0),
		iA6HargaJual: integer('i_a6_harga_jual').notNull().default(0),
		iA6DppNilaiLain: integer('i_a6_dpp_nilai_lain').notNull().default(0),
		iA6Ppn: integer('i_a6_ppn').notNull().default(0),
		iA6Ppnbm: integer('i_a6_ppnbm').notNull().default(0),
		iA7HargaJual: integer('i_a7_harga_jual').notNull().default(0),
		iA7DppNilaiLain: integer('i_a7_dpp_nilai_lain').notNull().default(0),
		iA7Ppn: integer('i_a7_ppn').notNull().default(0),
		iA7Ppnbm: integer('i_a7_ppnbm').notNull().default(0),
		iA8HargaJual: integer('i_a8_harga_jual').notNull().default(0),
		iA8DppNilaiLain: integer('i_a8_dpp_nilai_lain').notNull().default(0),
		iA8Ppn: integer('i_a8_ppn').notNull().default(0),
		iA8Ppnbm: integer('i_a8_ppnbm').notNull().default(0),
		iA9HargaJual: integer('i_a9_harga_jual').notNull().default(0),
		iA9DppNilaiLain: integer('i_a9_dpp_nilai_lain').notNull().default(0),
		iA9Ppn: integer('i_a9_ppn').notNull().default(0),
		iA9Ppnbm: integer('i_a9_ppnbm').notNull().default(0),
		iAJumlahHargaJual: integer('i_a_jumlah_harga_jual').notNull().default(0),
		iAJumlahPpn: integer('i_a_jumlah_ppn').notNull().default(0),
		iAJumlahPpnbm: integer('i_a_jumlah_ppnbm').notNull().default(0),

		// I.B, Penyerahan barang/jasa yang tidak terutang PPN.
		iB: integer('i_b').notNull().default(0),

		// I.C, Jumlah seluruh penyerahan barang dan jasa (I.A + I.B).
		iC: integer('i_c').notNull().default(0)
	},
	(t) => [uniqueIndex('spt_ppn_penyerahan_spt_ppn_id_unique').on(t.sptPpnId)]
);
