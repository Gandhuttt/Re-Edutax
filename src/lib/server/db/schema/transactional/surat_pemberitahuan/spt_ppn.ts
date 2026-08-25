import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { wajib_pajak } from '../wajib_pajak/wajib_pajak';

// SPT PPN Induk. Bagian I (Penyerahan) and Bagian II (Perolehan) live on the
// spt_ppn_penyerahan/spt_ppn_perolehan child tables instead of here — the
// combined column count of base + I + II + III-X pushed this table past
// D1/SQLite's ALTER TABLE column ceiling (~100 columns).
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

		// III, PERHITUNGAN PPN KURANG BAYAR / LEBIH BAYAR.
		iiiA: integer('iii_a').notNull().default(0),
		iiiB: integer('iii_b').notNull().default(0),
		iiiC: integer('iii_c').notNull().default(0),
		iiiD: integer('iii_d').notNull().default(0),
		iiiE: integer('iii_e').notNull().default(0),
		iiiF: integer('iii_f').notNull().default(0),
		iiiG: integer('iii_g').notNull().default(0),
		iiiHGantiSptSebelumnya: integer('iii_h_ganti_spt_sebelumnya', { mode: 'boolean' }),
		iiiHTindakan: text('iii_h_tindakan', {
			enum: ['dikompensasikan', 'dikembalikan_pendahuluan', 'dikembalikan_pemeriksaan']
		}),
		iiiHLampiranNamaFile: text('iii_h_lampiran_nama_file'),
		iiiHRekeningPilihBank: text('iii_h_rekening_pilih_bank'),
		iiiHRekeningNomor: text('iii_h_rekening_nomor'),
		iiiHRekeningNamaBank: text('iii_h_rekening_nama_bank'),
		iiiHRekeningNamaPemilik: text('iii_h_rekening_nama_pemilik'),

		// IV, PPN TERUTANG ATAS KEGIATAN MEMBANGUN SENDIRI.
		ivDpp: integer('iv_dpp').notNull().default(0),
		ivPpn: integer('iv_ppn').notNull().default(0),

		// V, PEMBAYARAN KEMBALI PAJAK MASUKAN YANG TIDAK DAPAT DIKREDITKAN.
		v: integer('v').notNull().default(0),

		// VI, PAJAK PENJUALAN ATAS BARANG MEWAH.
		viA: integer('vi_a').notNull().default(0),
		viB: integer('vi_b').notNull().default(0),
		viC: integer('vi_c').notNull().default(0),
		viD: integer('vi_d').notNull().default(0),
		viE: integer('vi_e').notNull().default(0),
		viF: integer('vi_f', { mode: 'boolean' }),

		// VII, PEMUNGUTAN PPN ATAU PPN DAN PPNBM OLEH PEMUNGUT PPN.
		viiADpp: integer('vii_a_dpp').notNull().default(0),
		viiADppNilaiLain: integer('vii_a_dpp_nilai_lain').notNull().default(0),
		viiAPpn: integer('vii_a_ppn').notNull().default(0),
		viiAPpnbm: integer('vii_a_ppnbm').notNull().default(0),
		viiBDpp: integer('vii_b_dpp').notNull().default(0),
		viiBDppNilaiLain: integer('vii_b_dpp_nilai_lain').notNull().default(0),
		viiBPpn: integer('vii_b_ppn').notNull().default(0),
		viiBPpnbm: integer('vii_b_ppnbm').notNull().default(0),
		viiCDpp: integer('vii_c_dpp').notNull().default(0),
		viiCDppNilaiLain: integer('vii_c_dpp_nilai_lain').notNull().default(0),
		viiCPpn: integer('vii_c_ppn').notNull().default(0),
		viiCPpnbm: integer('vii_c_ppnbm').notNull().default(0),

		// VIII, PEMUNGUTAN PPN ATAU PPN DAN PPNBM OLEH PIHAK LAIN.
		viiiADpp: integer('viii_a_dpp').notNull().default(0),
		viiiADppNilaiLain: integer('viii_a_dpp_nilai_lain').notNull().default(0),
		viiiAPpn: integer('viii_a_ppn').notNull().default(0),
		viiiAPpnbm: integer('viii_a_ppnbm').notNull().default(0),
		viiiBDpp: integer('viii_b_dpp').notNull().default(0),
		viiiBDppNilaiLain: integer('viii_b_dpp_nilai_lain').notNull().default(0),
		viiiBPpn: integer('viii_b_ppn').notNull().default(0),
		viiiBPpnbm: integer('viii_b_ppnbm').notNull().default(0),
		viiiCDpp: integer('viii_c_dpp').notNull().default(0),
		viiiCDppNilaiLain: integer('viii_c_dpp_nilai_lain').notNull().default(0),
		viiiCPpn: integer('viii_c_ppn').notNull().default(0),
		viiiCPpnbm: integer('viii_c_ppnbm').notNull().default(0),
		viiiD: integer('viii_d', { mode: 'boolean' }),

		// IX, KELENGKAPAN.
		ixA: integer('ix_a', { mode: 'boolean' }),
		ixB: integer('ix_b', { mode: 'boolean' }),

		// X, PERNYATAAN.
		xSetuju: integer('x_setuju', { mode: 'boolean' }),
		xDitandatanganiOleh: text('x_ditandatangani_oleh', { enum: ['PKP', 'KuasaWajibPajak'] }),
		xKotaPenandatanganSpt: text('x_kota_penandatangan_spt'),
		xNama: text('x_nama'),
		xJabatan: text('x_jabatan'),
		xBatasWaktuPenyampaian: text('x_batas_waktu_penyampaian'),

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
