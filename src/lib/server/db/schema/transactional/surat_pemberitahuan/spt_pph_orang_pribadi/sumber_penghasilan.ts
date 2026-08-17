import { sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { spt_pph_orang_pribadi } from './spt_pph_orang_pribadi';

// HEADER "Sumber Penghasilan" is a multi-select, not a single select: a taxpayer
// can hold more than one source at once. So it is a set of rows rather than an
// enum column on spt_pph_orang_pribadi. See OPTIONS.md.
//
// Section B writes back into this: answering 1.a and 1.b.1 both Tidak clears the
// header selection, because with neither pekerjaan nor usaha income declared the
// selected source is no longer valid.
export const spt_pph_orang_pribadi_sumber_penghasilan = sqliteTable(
	'spt_pph_orang_pribadi_sumber_penghasilan',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		sptPphOrangPribadiId: text('spt_pph_orang_pribadi_id')
			.notNull()
			.references(() => spt_pph_orang_pribadi.id, { onDelete: 'cascade' }),
		kode: text('kode', { enum: ['kegiatan_usaha', 'pekerjaan', 'pekerjaan_bebas'] }).notNull()
	},
	(t) => [
		uniqueIndex('spt_pph_orang_pribadi_sumber_penghasilan_unique').on(t.sptPphOrangPribadiId, t.kode)
	]
);
