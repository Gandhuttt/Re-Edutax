import { createdAt, updatedAt } from '$lib/server/db/helpers/timestamps';
import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { mata_uang_spt_pph_badan } from '../../../references/spt_pph_badan/mata_uang';
import { opini_auditor_spt_pph_badan } from '../../../references/spt_pph_badan/opini_auditor';
import { sektor_usaha_spt_pph_badan } from '../../../references/spt_pph_badan/sektor_usaha';
import { wajib_pajak } from '../../wajib_pajak/wajib_pajak';

export const spt_pph_badan = sqliteTable(
	'spt_pph_badan',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),

		npwp: text('npwp')
			.notNull()
			.references(() => wajib_pajak.npwp),
		tahunPajak: integer('tahun_pajak').notNull(),
		pembetulanKe: integer('pembetulan_ke').notNull().default(0),
		statusSpt: text('status_spt', { enum: ['normal', 'pembetulan'] })
			.notNull()
			.default('normal'),
		statusDraft: text('status_draft', {
			enum: ['konsep', 'tervalidasi', 'menunggu_pembayaran', 'dilaporkan']
		})
			.notNull()
			.default('konsep'),

		periodePembukuanMulai: text('periode_pembukuan_mulai').notNull(),
		periodePembukuanSelesai: text('periode_pembukuan_selesai').notNull(),
		metodePembukuan: text('metode_pembukuan', { enum: ['akrual', 'kas'] }).notNull(),
		mataUangPembukuanId: text('mata_uang_pembukuan_id')
			.notNull()
			.references(() => mata_uang_spt_pph_badan.id),

		sektorUsahaId: text('sektor_usaha_id').references(() => sektor_usaha_spt_pph_badan.id),
		opiniAuditorId: text('opini_auditor_id').references(() => opini_auditor_spt_pph_badan.id),
		npwpKantorAkuntanPublik: text('npwp_kantor_akuntan_publik'),
		namaKantorAkuntanPublik: text('nama_kantor_akuntan_publik'),

		menerimaPenghasilanPp23: integer('menerima_penghasilan_pp23', { mode: 'boolean' }),
		hanyaPenghasilanPp23: integer('hanya_penghasilan_pp23', { mode: 'boolean' }),
		menerimaPenghasilanFinal: integer('menerima_penghasilan_final', { mode: 'boolean' }),
		menerimaPenghasilanBukanObjekPajak: integer('menerima_penghasilan_bukan_objek_pajak', {
			mode: 'boolean'
		}),

		tarifPajak: text('tarif_pajak', {
			enum: ['pasal_17_1_b', 'pasal_17_2b', 'pasal_31e', 'lainnya']
		}),
		persentaseTarifLainnya: integer('persentase_tarif_lainnya'),

		pphKurangLebihBayar: integer('pph_kurang_lebih_bayar').notNull().default(0),
		tanggalPosting: integer('tanggal_posting', { mode: 'timestamp_ms' }),
		tanggalDilaporkan: integer('tanggal_dilaporkan', { mode: 'timestamp_ms' }),
		createdAt: createdAt(),
		updatedAt: updatedAt()
	},
	(t) => [uniqueIndex('spt_pph_badan_period_unique').on(t.npwp, t.tahunPajak, t.pembetulanKe)]
);
