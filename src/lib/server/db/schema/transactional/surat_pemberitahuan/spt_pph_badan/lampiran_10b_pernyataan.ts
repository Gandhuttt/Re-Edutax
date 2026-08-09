import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { spt_pph_badan } from './spt_pph_badan';

export const spt_pph_badan_lampiran_10b_pernyataan = sqliteTable(
	'spt_pph_badan_lampiran_10b_pernyataan',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		sptPphBadanId: text('spt_pph_badan_id')
			.notNull()
			.references(() => spt_pph_badan.id, { onDelete: 'cascade' }),
		hubunganA: integer('hubungan_a', { mode: 'boolean' }),
		hubunganB: integer('hubungan_b', { mode: 'boolean' }),
		hubunganC: integer('hubungan_c', { mode: 'boolean' }),
		hubunganD: integer('hubungan_d', { mode: 'boolean' }),
		transaksiA: integer('transaksi_a', { mode: 'boolean' }),
		transaksiB: integer('transaksi_b', { mode: 'boolean' }),
		transaksiC: integer('transaksi_c', { mode: 'boolean' }),
		dokumentasiA: integer('dokumentasi_a', { mode: 'boolean' }),
		dokumentasiB: integer('dokumentasi_b', { mode: 'boolean' }),
		dokumentasiC: integer('dokumentasi_c', { mode: 'boolean' }),
		dokumentasiD: integer('dokumentasi_d', { mode: 'boolean' }),
		dokumentasiE: integer('dokumentasi_e', { mode: 'boolean' }),
		dokumenA: integer('dokumen_a', { mode: 'boolean' }),
		dokumenB: integer('dokumen_b', { mode: 'boolean' }),
		dokumenC: integer('dokumen_c', { mode: 'boolean' })
	},
	(t) => [uniqueIndex('spt_pph_badan_lampiran_10b_pernyataan_spt_unique').on(t.sptPphBadanId)]
);
