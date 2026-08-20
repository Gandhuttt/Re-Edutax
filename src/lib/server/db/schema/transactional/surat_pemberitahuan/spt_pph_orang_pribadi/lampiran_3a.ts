import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { spt_pph_orang_pribadi_kode_koreksi_fiskal } from '../../../references/spt_pph_orang_pribadi/kode_koreksi_fiskal';
import { spt_pph_orang_pribadi_lampiran_3a_akun } from '../../../references/spt_pph_orang_pribadi/lampiran_3a_akun';
import { spt_pph_orang_pribadi_lampiran_3a_neraca_akun } from '../../../references/spt_pph_orang_pribadi/lampiran_3a_neraca_akun';
import { spt_pph_orang_pribadi } from './spt_pph_orang_pribadi';

// L-3A A.1, LAPORAN LABA RUGI. Only the sektor matching Induk 1.b.4 is ever
// shown or editable, but rows for a since-abandoned sektor are left in place
// rather than deleted, mirroring how L-1's harta grids behave when a gate
// flips off.
export const spt_pph_orang_pribadi_lampiran_3a_laba_rugi = sqliteTable(
	'spt_pph_orang_pribadi_lampiran_3a_laba_rugi',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		sptPphOrangPribadiId: text('spt_pph_orang_pribadi_id')
			.notNull()
			.references(() => spt_pph_orang_pribadi.id, { onDelete: 'cascade' }),
		akunId: text('akun_id')
			.notNull()
			.references(() => spt_pph_orang_pribadi_lampiran_3a_akun.id),
		nilaiKomersial: integer('nilai_komersial').notNull().default(0),
		nonObjekPajak: integer('non_objek_pajak').notNull().default(0),
		dikenakanPphFinal: integer('dikenakan_pph_final').notNull().default(0),
		penyesuaianFiskalPositif: integer('penyesuaian_fiskal_positif').notNull().default(0),
		penyesuaianFiskalNegatif: integer('penyesuaian_fiskal_negatif').notNull().default(0)
	},
	(t) => [
		uniqueIndex('spt_pph_orang_pribadi_lampiran_3a_laba_rugi_spt_akun_unique').on(
			t.sptPphOrangPribadiId,
			t.akunId
		)
	]
);

// KODE PENYESUAIAN FISKAL is a multi-select: more than one code can apply to
// one account row, and it becomes mandatory as soon as either adjustment
// amount is nonzero (enforced client-side, see the row editor).
export const spt_pph_orang_pribadi_lampiran_3a_koreksi_fiskal = sqliteTable(
	'spt_pph_orang_pribadi_lampiran_3a_koreksi_fiskal',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		labaRugiId: text('laba_rugi_id')
			.notNull()
			.references(() => spt_pph_orang_pribadi_lampiran_3a_laba_rugi.id, { onDelete: 'cascade' }),
		kodeKoreksiFiskalId: text('kode_koreksi_fiskal_id')
			.notNull()
			.references(() => spt_pph_orang_pribadi_kode_koreksi_fiskal.id)
	},
	(t) => [
		uniqueIndex('spt_pph_orang_pribadi_lampiran_3a_koreksi_fiskal_unique').on(
			t.labaRugiId,
			t.kodeKoreksiFiskalId
		)
	]
);

// L-3A A.2, LAPORAN POSISI KEUANGAN (NERACA). One row per neraca account of the
// sektor in play, entered inline (there is no row editor, unlike A.1).
//
// Kept in the same abandoned-sektor-tolerant shape as the laba/rugi table above:
// keyed on the seeded akun row's own id, which is sektor-namespaced, so a row
// left behind by a sektor switch can never be read back under a different
// account.
export const spt_pph_orang_pribadi_lampiran_3a_neraca = sqliteTable(
	'spt_pph_orang_pribadi_lampiran_3a_neraca',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		sptPphOrangPribadiId: text('spt_pph_orang_pribadi_id')
			.notNull()
			.references(() => spt_pph_orang_pribadi.id, { onDelete: 'cascade' }),
		akunId: text('akun_id')
			.notNull()
			.references(() => spt_pph_orang_pribadi_lampiran_3a_neraca_akun.id),
		nilai: integer('nilai').notNull().default(0)
	},
	(t) => [
		uniqueIndex('spt_pph_orang_pribadi_lampiran_3a_neraca_spt_akun_unique').on(
			t.sptPphOrangPribadiId,
			t.akunId
		)
	]
);
