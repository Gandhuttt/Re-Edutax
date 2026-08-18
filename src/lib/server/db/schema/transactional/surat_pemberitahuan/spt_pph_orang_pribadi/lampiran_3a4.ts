import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { spt_pph_orang_pribadi } from './spt_pph_orang_pribadi';

// L-3A-4 Bagian B, PENGHASILAN NETO DALAM NEGERI LAINNYA. Feeds Induk 1.c.
//
// L-3A-4 is a standalone lampiran, not a fourth sektor variant of the
// Dagang/Jasa/Industri series (L-3A-1/2/3, gated on Induk 1.b.4). Its own
// Bagian A is the Norma calculation, gated on Induk 1.b.3 = Ya. It was never
// OBSERVABLE on the live form (the test account has no NPPN facility registered,
// so Coretax rejects the answer), which was once read as "not implementable" — the
// bundle specifies it fully. It is implemented, but persists nothing here: its
// only stored field is the norma percentage, which lives on the L-3B TKU registry
// row because Coretax generates the whole section from that row. See
// hitungLampiranL3A4BagianA and docs/bundle-diff-1770.md B5.
//
// Bagian B is gated on Induk 1.c, independent of 1.b entirely, and is what this
// table holds.
export const spt_pph_orang_pribadi_lampiran_3a4_lainnya = sqliteTable(
	'spt_pph_orang_pribadi_lampiran_3a4_lainnya',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		sptPphOrangPribadiId: text('spt_pph_orang_pribadi_id')
			.notNull()
			.references(() => spt_pph_orang_pribadi.id, { onDelete: 'cascade' }),
		nomorUrut: integer('nomor_urut').notNull(),
		kode: text('kode').notNull().default(''),
		jenisPenghasilan: text('jenis_penghasilan').notNull().default(''),
		penghasilanNeto: integer('penghasilan_neto').notNull().default(0)
	}
);
