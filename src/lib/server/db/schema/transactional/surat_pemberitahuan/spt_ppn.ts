import { SptPpnBlobSchema } from '$lib/schemas/surat-pemberitahuan/spt-ppn';
import { valibotJson } from '$lib/server/db/helpers/valibot-json';
import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { wajib_pajak } from '../wajib_pajak/wajib_pajak';

export const spt_ppn = sqliteTable(
	'spt_ppn',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),

		npwp: text('npwp')
			.notNull()
			.references(() => wajib_pajak.npwp),
		masaPajak: integer('masa_pajak').notNull(),
		tahun: integer('tahun').notNull(),
		pembetulanKe: integer('pembetulan_ke').notNull().default(0),

		status: text('status', {
			enum: ['konsep', 'menunggu_pembayaran', 'dilaporkan']
		})
			.notNull()
			.default('konsep'),

		blob: valibotJson('blob', SptPpnBlobSchema).notNull(),

		totalDppKeluaran: integer('total_dpp_keluaran').notNull().default(0),
		totalDppNilaiLainKeluaran: integer('total_dpp_nilai_lain_keluaran').notNull().default(0),
		totalPpnKeluaran: integer('total_ppn_keluaran').notNull().default(0),
		totalPpnBmKeluaran: integer('total_ppnbm_keluaran').notNull().default(0),
		totalDppMasukan: integer('total_dpp_masukan').notNull().default(0),
		totalPpnMasukan: integer('total_ppn_masukan').notNull().default(0),
		ppnKurangLebihBayar: integer('ppn_kurang_lebih_bayar').notNull().default(0),

		tanggalPosting: integer('tanggal_posting', { mode: 'timestamp_ms' }),
		tanggalDilaporkan: integer('tanggal_dilaporkan', { mode: 'timestamp_ms' }),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.notNull()
			.$defaultFn(() => new Date()),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.notNull()
			.$defaultFn(() => new Date())
			.$onUpdate(() => new Date())
	},
	(t) => [
		uniqueIndex('spt_ppn_period_unique').on(t.npwp, t.masaPajak, t.tahun, t.pembetulanKe)
	]
);
