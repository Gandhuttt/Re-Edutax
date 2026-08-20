import { createdAt, updatedAt } from '$lib/server/db/helpers/timestamps';
import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { wajib_pajak } from '../../wajib_pajak/wajib_pajak';

// SPT Tahunan PPh Wajib Pajak Orang Pribadi (1770), Induk.
//
// Row numbering in the column names follows Coretax's own numbering (1.a, 1.b.1,
// 10.a ...) rather than being renumbered per section, because the form's hint
// text refers to rows by those numbers ("Tidak, lanjutkan ke pertanyaan 1c").
// See docs/ui-reference/coretax/spt-1770-induk/.
//
// Rows that Coretax computes rather than stores are deliberately absent: rows 2,
// 4, 6, 7, 9, 11a, 11c and 12b are all derived, and row 5's amount is a lookup
// from ptkpStatus. Only the answers and the manually entered amounts live here.
export const spt_pph_orang_pribadi = sqliteTable(
	'spt_pph_orang_pribadi',
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

		// HEADER. "Metode Pembukuan/Pencatatan" offers three values, not the two the
		// label implies: Pembukuan splits into akrual and kas. See OPTIONS.md.
		metodePembukuan: text('metode_pembukuan', {
			enum: ['pembukuan_akrual', 'pembukuan_kas', 'pencatatan']
		})
			.notNull()
			.default('pencatatan'),
		periodeBulanMulai: integer('periode_bulan_mulai').notNull().default(1),
		periodeBulanSelesai: integer('periode_bulan_selesai').notNull().default(12),
		// Sumber Penghasilan is a multi-select, so it lives in its own table
		// (spt_pph_orang_pribadi_sumber_penghasilan), not an enum column here.

		// A. Identitas Wajib Pajak. Rows 1 to 6 are prefilled read-only from
		// wajib_pajak, so only the two conditional rows are stored.
		a7StatusKewajibanSuamiIstri: text('a7_status_kewajiban_suami_istri', { enum: ['ph', 'mt'] }),
		a8NpwpSuamiIstri: text('a8_npwp_suami_istri'),

		// B. Ikhtisar Penghasilan Neto
		b1aPenghasilanPekerjaan: integer('b1a_penghasilan_pekerjaan', { mode: 'boolean' }),
		b1b1PenghasilanUsaha: integer('b1b1_penghasilan_usaha', { mode: 'boolean' }),
		// 1.b.2 and 1.b.3 are comboboxes rather than Ya/Tidak radios because each has
		// three branches whose labels are full routing sentences. See OPTIONS.md.
		b1b2Oppt: text('b1b2_oppt', {
			enum: ['tidak', 'peredaran_bruto_tertentu', 'pengusaha_tertentu']
		}),
		b1b3Norma: text('b1b3_norma', {
			enum: ['tidak_pembukuan', 'tidak_final_tanpa_pembukuan', 'ya_norma']
		}),
		// 1.b.4 appears only once 1.b.3 is "Tidak, saya menyelenggarakan pembukuan.".
		// Its three options each route to a different, mutually exclusive lampiran
		// tab (L-3A-1/2/3); only one exists at a time, unlike the usual OR-of-gates
		// tab rule. See L3A.md.
		b1b4Sektor: text('b1b4_sektor', { enum: ['dagang', 'jasa', 'industri'] }),
		b1cPenghasilanDalamNegeriLainnya: integer('b1c_penghasilan_dalam_negeri_lainnya', {
			mode: 'boolean'
		}),
		b1dPenghasilanLuarNegeri: integer('b1d_penghasilan_luar_negeri', { mode: 'boolean' }),

		// C. Penghitungan Pajak Terutang
		c3AdaPengurangPenghasilanNeto: integer('c3_ada_pengurang_penghasilan_neto', { mode: 'boolean' }),
		c5PtkpStatus: text('c5_ptkp_status', {
			enum: [
				'tk_0',
				'tk_1',
				'tk_2',
				'tk_3',
				'k_0',
				'k_1',
				'k_2',
				'k_3',
				'k_i_0',
				'k_i_1',
				'k_i_2',
				'k_i_3',
				'tidak_berlaku'
			]
		}),
		c8AdaPengurangPphTerutang: integer('c8_ada_pengurang_pph_terutang', { mode: 'boolean' }),

		// D. Kredit Pajak
		d10aAdaPphDipotongPihakLain: integer('d10a_ada_pph_dipotong_pihak_lain', { mode: 'boolean' }),
		d10bAngsuranPph25: integer('d10b_angsuran_pph_25').notNull().default(0),
		d10cStpPph25: integer('d10c_stp_pph_25').notNull().default(0),
		d10dAdaPengembalianKreditLuarNegeri: integer('d10d_ada_pengembalian_kredit_luar_negeri', {
			mode: 'boolean'
		}),
		d10dJumlah: integer('d10d_jumlah').notNull().default(0),

		// E. PPh Kurang/Lebih Bayar
		e11bAdaSkPengangsuranPenundaan: integer('e11b_ada_sk_pengangsuran_penundaan', { mode: 'boolean' }),
		e11bJumlah: integer('e11b_jumlah').notNull().default(0),

		// F. Pembetulan. 12a's amount is read from the previous SPT version rather
		// than typed, matching the Badan pembetulan mechanic; only the checkbox is
		// stored. 12b is derived (11a - 12a).
		f12aGantiSptSebelumnya: integer('f12a_ganti_spt_sebelumnya', { mode: 'boolean' }),

		// G. Permohonan Pengembalian PPh Lebih Bayar. Never capturable on the live
		// draft (it is inert unless the return is in a refund position), so this
		// mirrors the Badan implementation's shape. See OPTIONS.md section G.
		gMetodePengembalian: text('g_metode_pengembalian', {
			enum: ['pemeriksaan', 'pengembalian_pendahuluan']
		}),
		gNomorRekening: text('g_nomor_rekening'),
		gNamaBank: text('g_nama_bank'),
		gNamaPemilikRekening: text('g_nama_pemilik_rekening'),

		// H. Angsuran PPh Pasal 25 Tahun Pajak Berikutnya. 13a, 13b and 13c are
		// alternative Pasal 25 regimes and are mutually exclusive: answering one Ya
		// clears the others. Enforced in the UI, not by the schema.
		h13aAngsuranTeratur: integer('h13a_angsuran_teratur', { mode: 'boolean' }),
		h13bPerhitunganTersendiri: integer('h13b_perhitungan_tersendiri', { mode: 'boolean' }),
		h13cAngsuranOppt: integer('h13c_angsuran_oppt', { mode: 'boolean' }),

		// I. Pernyataan Transaksi Lainnya. 14a is not stored: it is fed from the
		// L-1 A7 harta rollup.
		i14bMemilikiUtang: integer('i14b_memiliki_utang', { mode: 'boolean' }),
		i14cPenghasilanFinal: integer('i14c_penghasilan_final', { mode: 'boolean' }),
		i14dBukanObjekPajak: integer('i14d_bukan_objek_pajak', { mode: 'boolean' }),
		i14ePenyusutanAmortisasiFiskal: integer('i14e_penyusutan_amortisasi_fiskal', { mode: 'boolean' }),
		i14fBiayaEntertainment: integer('i14f_biaya_entertainment', { mode: 'boolean' }),
		i14gDividenLuarNegeri: integer('i14g_dividen_luar_negeri', { mode: 'boolean' }),
		i14hKelebihanPphFinal: integer('i14h_kelebihan_pph_final').notNull().default(0),

		// J. Lampiran Tambahan. Items a to c are system-driven from earlier answers
		// and rendered disabled; they are stored so the submitted state is complete.
		jaLaporanKeuangan: integer('ja_laporan_keuangan', { mode: 'boolean' }),
		jbBuktiZakat: integer('jb_bukti_zakat', { mode: 'boolean' }),
		jcBuktiPotongLuarNegeri: integer('jc_bukti_potong_luar_negeri', { mode: 'boolean' }),
		jdSuratKuasaKhusus: integer('jd_surat_kuasa_khusus', { mode: 'boolean' }),
		jeDokumenLainnya: integer('je_dokumen_lainnya', { mode: 'boolean' }),

		// L-3A Section A footer. Lives on the SPT header rather than in a lampiran
		// table because it is a single row per SPT and survives a sektor switch,
		// the
		// same way the live form keeps one FinancialStatement control across
		// L-3A-1/2/3. Codes are the FINANCIAL_STATEMENT reference list:
		// TRADING = Diaudit, SELF_PREPARED = Tidak Diaudit (yes, "TRADING" means
		// audited; it is DJP's code, not a sektor). The dropdown is required once
		// an L-3A tab exists, and the akuntan publik pair is shown only for
		// 'diaudit' — bundle: isShownAccountantFirm = ("TRADING" == FinancialStatement).
		l3aLaporanKeuangan: text('l3a_laporan_keuangan', { enum: ['diaudit', 'tidak_diaudit'] }),
		l3aNpwpKonsultanPajak: text('l3a_npwp_konsultan_pajak'),
		l3aNamaKonsultanPajak: text('l3a_nama_konsultan_pajak'),
		l3aNpwpKantorAkuntanPublik: text('l3a_npwp_kantor_akuntan_publik'),
		l3aNamaKantorAkuntanPublik: text('l3a_nama_kantor_akuntan_publik'),

		// K. Pernyataan
		penandatangan: text('penandatangan', { enum: ['wajib_pajak', 'kuasa_wajib_pajak'] })
			.notNull()
			.default('wajib_pajak'),

		// Carried forward into the next pembetulan as row 12a.
		pphKurangLebihBayar: integer('pph_kurang_lebih_bayar').notNull().default(0),

		tanggalPosting: integer('tanggal_posting', { mode: 'timestamp_ms' }),
		tanggalDilaporkan: integer('tanggal_dilaporkan', { mode: 'timestamp_ms' }),
		createdAt: createdAt(),
		updatedAt: updatedAt()
	},
	(t) => [uniqueIndex('spt_pph_orang_pribadi_period_unique').on(t.npwp, t.tahunPajak, t.pembetulanKe)]
);
