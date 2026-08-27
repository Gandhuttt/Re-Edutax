import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { spt_ppn } from './spt_ppn';

// SPT PPN Induk, Bagian II, PEROLEHAN BARANG DAN JASA. Split out into its own
// 1:1 child table for the same reason as spt_ppn_penyerahan (Bagian I):
// keeping it on spt_ppn itself would push that table past D1/SQLite's
// ALTER TABLE column ceiling.
export const spt_ppn_perolehan = sqliteTable(
	'spt_ppn_perolehan',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		sptPpnId: text('spt_ppn_id')
			.notNull()
			.references(() => spt_ppn.id, { onDelete: 'cascade' }),

		// II.A, Impor BKP, Pemanfaatan BKP Tidak Berwujud dan/atau JKP dari luar
		// Daerah Pabean di dalam Daerah Pabean yang Pajak Masukannya dapat
		// dikreditkan.
		iiADpp: integer('ii_a_dpp').notNull().default(0),
		iiAPpn: integer('ii_a_ppn').notNull().default(0),
		iiAPpnbm: integer('ii_a_ppnbm').notNull().default(0),

		// II.B, Perolehan BKP/JKP dari dalam negeri dengan DPP Nilai Lain atau
		// Besaran Tertentu yang Pajak Masukannya dapat dikreditkan.
		iiBDpp: integer('ii_b_dpp').notNull().default(0),
		iiBDppNilaiLain: integer('ii_b_dpp_nilai_lain').notNull().default(0),
		iiBPpn: integer('ii_b_ppn').notNull().default(0),
		iiBPpnbm: integer('ii_b_ppnbm').notNull().default(0),

		// II.C, Perolehan BKP/JKP dari dalam negeri selain dengan DPP Nilai Lain
		// yang Pajak Masukannya dapat dikreditkan.
		iiCDpp: integer('ii_c_dpp').notNull().default(0),
		iiCPpn: integer('ii_c_ppn').notNull().default(0),
		iiCPpnbm: integer('ii_c_ppnbm').notNull().default(0),

		// II.D, Perolehan BKP/JKP dari dalam negeri sebagai Pemungutan PPN yang
		// Pajak Masukannya dapat dikreditkan.
		iiDDpp: integer('ii_d_dpp').notNull().default(0),
		iiDDppNilaiLain: integer('ii_d_dpp_nilai_lain').notNull().default(0),
		iiDPpn: integer('ii_d_ppn').notNull().default(0),
		iiDPpnbm: integer('ii_d_ppnbm').notNull().default(0),

		// II.E, Kompensasi kelebihan Pajak Masukan.
		iiE: integer('ii_e').notNull().default(0),

		// II.F, Hasil penghitungan kembali Pajak Masukan yang telah dikreditkan.
		iiF: integer('ii_f').notNull().default(0),

		// II.G, Jumlah Pajak Masukan yang dapat diperhitungkan.
		iiGDpp: integer('ii_g_dpp').notNull().default(0),
		iiGPpn: integer('ii_g_ppn').notNull().default(0),

		// II.H, Impor atau perolehan BKP/JKP yang Pajak Masukannya tidak
		// dikreditkan dan/atau impor atau perolehan BKP/JKP yang mendapat
		// fasilitas.
		iiHDpp: integer('ii_h_dpp').notNull().default(0),
		iiHDppNilaiLain: integer('ii_h_dpp_nilai_lain').notNull().default(0),
		iiHPpn: integer('ii_h_ppn').notNull().default(0),
		iiHPpnbm: integer('ii_h_ppnbm').notNull().default(0),

		// II.I, Impor atau perolehan BKP/JKP dengan Faktur Pajak yang
		// dilaporkan secara digunggung dan barang/jasa yang tidak terutang PPN.
		iiI: integer('ii_i').notNull().default(0),

		// II.J, Jumlah Perolehan.
		iiJ: integer('ii_j').notNull().default(0)
	},
	(t) => [uniqueIndex('spt_ppn_perolehan_spt_ppn_id_unique').on(t.sptPpnId)]
);
