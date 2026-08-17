import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { spt_pph_orang_pribadi } from './spt_pph_orang_pribadi';

// L-2 Bagian A, PENGHASILAN YANG DIKENAKAN PAJAK PENGHASILAN BERSIFAT FINAL.
//
// Feeds Induk 14c, which takes the DPP rather than the tax: a row with DPP
// 666.666 and PPh Terutang 66.666 showed 666.666 on the Induk. It is the income
// figure that propagates. Measured, see BEHAVIOR.md.
//
// This grid's toolbar carries only Tambah on the live form, with no Hapus or
// Impor, unlike every L-1 grid.
export const spt_pph_orang_pribadi_lampiran_2_final = sqliteTable(
	'spt_pph_orang_pribadi_lampiran_2_final',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		sptPphOrangPribadiId: text('spt_pph_orang_pribadi_id')
			.notNull()
			.references(() => spt_pph_orang_pribadi.id, { onDelete: 'cascade' }),
		nomorUrut: integer('nomor_urut').notNull(),
		npwpPemotong: text('npwp_pemotong').notNull().default(''),
		namaPemotong: text('nama_pemotong').notNull().default(''),
		// The live form derives this from Jenis Penghasilan and uses the real DJP
		// object-code format (pasal-objek-sub, e.g. 21-100-27). Ours is typed.
		kodeObjekPajak: text('kode_objek_pajak').notNull().default(''),
		jenisPenghasilan: text('jenis_penghasilan').notNull().default(''),
		dasarPengenaanPajak: integer('dasar_pengenaan_pajak').notNull().default(0),
		pphTerutang: integer('pph_terutang').notNull().default(0)
	}
);

// L-2 Bagian B, PENGHASILAN YANG TIDAK TERMASUK OBJEK PAJAK. Feeds Induk 14d.
export const spt_pph_orang_pribadi_lampiran_2_bukan_objek = sqliteTable(
	'spt_pph_orang_pribadi_lampiran_2_bukan_objek',
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
		npwpSumber: text('npwp_sumber').notNull().default(''),
		namaSumber: text('nama_sumber').notNull().default(''),
		penghasilanBruto: integer('penghasilan_bruto').notNull().default(0)
	}
);

// L-2 Bagian C, PENGHASILAN NETO LUAR NEGERI.
//
// Two feeds, not one:
//   - Induk 1.d takes JUMLAH PENGHASILAN NETO
//   - L-1 Bagian E imports kreditPajakDiperhitungkan as its KREDIT PAJAK ATAS
//     PENGHASILAN LUAR NEGERI row, which then rolls into Induk 10a
//
// That second one is a lampiran-to-lampiran edge, found only because every grid
// was populated at once: 77.777 entered in L-1 E showed as 77.865 on Induk 10a,
// the extra 88 coming from here.
//
// The only grid carrying foreign currency, so it stores both the asing and
// rupiah amounts rather than converting.
export const spt_pph_orang_pribadi_lampiran_2_luar_negeri = sqliteTable(
	'spt_pph_orang_pribadi_lampiran_2_luar_negeri',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		sptPphOrangPribadiId: text('spt_pph_orang_pribadi_id')
			.notNull()
			.references(() => spt_pph_orang_pribadi.id, { onDelete: 'cascade' }),
		nomorUrut: integer('nomor_urut').notNull(),
		namaSumber: text('nama_sumber').notNull().default(''),
		negara: text('negara').notNull().default(''),
		// ISO date. The live picker cannot be typed into and applies no tax-year
		// validation at all, so an ordinary date input is used instead.
		tanggalTransaksi: text('tanggal_transaksi').notNull().default(''),
		jenisPenghasilan: text('jenis_penghasilan').notNull().default(''),
		kodePenghasilan: text('kode_penghasilan').notNull().default(''),
		penghasilanNeto: integer('penghasilan_neto').notNull().default(0),
		mataUang: text('mata_uang').notNull().default(''),
		pajakLuarNegeriAsing: integer('pajak_luar_negeri_asing').notNull().default(0),
		pajakLuarNegeriRupiah: integer('pajak_luar_negeri_rupiah').notNull().default(0),
		kreditPajakDiperhitungkan: integer('kredit_pajak_diperhitungkan').notNull().default(0)
	}
);
