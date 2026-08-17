import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { spt_pph_orang_pribadi } from './spt_pph_orang_pribadi';

// L-3A-4 Bagian B, PENGHASILAN NETO DALAM NEGERI LAINNYA. Feeds Induk 1.c.
//
// L-3A-4 is a standalone lampiran, not a fourth sektor variant of the
// Dagang/Jasa/Industri series (L-3A-1/2/3, gated on Induk 1.b.4). Its own
// Bagian A is the Norma calculation, which was never capturable on the live
// form and is not implemented here. Bagian B is fully specified and gated on
// Induk 1.c, independent of 1.b entirely.
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
