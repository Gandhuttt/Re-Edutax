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
		diaudit: integer('diaudit', { mode: 'boolean' }),
		opiniAuditorId: text('opini_auditor_id').references(() => opini_auditor_spt_pph_badan.id),
		npwpKantorAkuntanPublik: text('npwp_kantor_akuntan_publik'),
		namaKantorAkuntanPublik: text('nama_kantor_akuntan_publik'),

		menerimaPenghasilanPp23: integer('menerima_penghasilan_pp23', { mode: 'boolean' }),
		hanyaPenghasilanPp23: integer('hanya_penghasilan_pp23', { mode: 'boolean' }),
		menerimaPenghasilanFinal: integer('menerima_penghasilan_final', { mode: 'boolean' }),
		menerimaPenghasilanBukanObjekPajak: integer('menerima_penghasilan_bukan_objek_pajak', {
			mode: 'boolean'
		}),

		penghasilanNetoFiskalSebelumFasilitas: integer('penghasilan_neto_fiskal_sebelum_fasilitas').default(0),
		d5FasilitasPenanamanModal: integer('d5_fasilitas_penanaman_modal', { mode: 'boolean' }),
		d6FasilitasBrutoVokasi: integer('d6_fasilitas_bruto_vokasi', { mode: 'boolean' }),
		d8AdaKompensasiKerugian: integer('d8_ada_kompensasi_kerugian', { mode: 'boolean' }),
		d10FasilitasBrutoLitbang: integer('d10_fasilitas_bruto_litbang', { mode: 'boolean' }),

		tarifPajak: text('tarif_pajak', {
			enum: ['pasal_17_1_b', 'pasal_17_2b', 'pasal_31e', 'lainnya']
		}),
		persentaseTarifLainnya: integer('persentase_tarif_lainnya'),

		e13AdaKreditPajakLuarNegeri: integer('e13_ada_kredit_pajak_luar_negeri', { mode: 'boolean' }),
		e14AngsuranPph25TahunBerjalan: integer('e14_angsuran_pph_25_tahun_berjalan').default(0),
		e15StpPph25: integer('e15_stp_pph_25').default(0),
		e16FasilitasPenguranganPphTerutang: integer('e16_fasilitas_pengurangan_pph_terutang', {
			mode: 'boolean'
		}),

		f17bAdaSkPengangsuranPenundaan: integer('f17b_ada_sk_pengangsuran_penundaan', { mode: 'boolean' }),
		f17bJumlahDiangsurDitunda: integer('f17b_jumlah_diangsur_ditunda').default(0),
		f19aMetodePengembalian: text('f19a_metode_pengembalian', {
			enum: ['pemeriksaan', 'pengembalian_pendahuluan']
		}),

		g20WajibLaporAngsuranPph25: integer('g20_wajib_lapor_angsuran_pph_25', { mode: 'boolean' }),

		h21aTransaksiHubunganIstimewa: integer('h21a_transaksi_hubungan_istimewa', { mode: 'boolean' }),
		h21bDokumenPenentuanHargaTransfer: integer('h21b_dokumen_penentuan_harga_transfer', { mode: 'boolean' }),
		h21cPenanamanModalAfiliasi: integer('h21c_penanaman_modal_afiliasi', { mode: 'boolean' }),
		h21dUtangPiutangAfiliasi: integer('h21d_utang_piutang_afiliasi', { mode: 'boolean' }),
		h21ePenyusutanAmortisasiFiskal: integer('h21e_penyusutan_amortisasi_fiskal', { mode: 'boolean' }),
		h21fBiayaEntertainment: integer('h21f_biaya_entertainment', { mode: 'boolean' }),
		h21gFasilitasPenanamanModalDaerahTertentu: integer('h21g_fasilitas_penanaman_modal_daerah_tertentu', {
			mode: 'boolean'
		}),
		h21hSisaLebihSaranaPrasarana: integer('h21h_sisa_lebih_sarana_prasarana', { mode: 'boolean' }),
		h21iDividenLuarNegeri: integer('h21i_dividen_luar_negeri', { mode: 'boolean' }),

		pphKurangLebihBayar: integer('pph_kurang_lebih_bayar').notNull().default(0),
		lampiran3PengembalianPenguranganPphLuarNegeriTahunSebelumnya: integer(
			'lampiran3_pengembalian_pengurangan_pph_luar_negeri_tahun_sebelumnya'
		)
			.notNull()
			.default(0),
		tanggalPosting: integer('tanggal_posting', { mode: 'timestamp_ms' }),
		tanggalDilaporkan: integer('tanggal_dilaporkan', { mode: 'timestamp_ms' }),
		createdAt: createdAt(),
		updatedAt: updatedAt()
	},
	(t) => [uniqueIndex('spt_pph_badan_period_unique').on(t.npwp, t.tahunPajak, t.pembetulanKe)]
);
