import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { spt_pph_orang_pribadi } from './spt_pph_orang_pribadi';

// L-1 Bagian B, UTANG PADA AKHIR TAHUN PAJAK. Feeds Induk 14b.
export const spt_pph_orang_pribadi_lampiran_1_utang = sqliteTable(
	'spt_pph_orang_pribadi_lampiran_1_utang',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		sptPphOrangPribadiId: text('spt_pph_orang_pribadi_id')
			.notNull()
			.references(() => spt_pph_orang_pribadi.id, { onDelete: 'cascade' }),
		nomorUrut: integer('nomor_urut').notNull(),
		kode: text('kode').notNull().default(''),
		deskripsi: text('deskripsi').notNull().default(''),
		nikNpwpKreditur: text('nik_npwp_kreditur').notNull().default(''),
		namaKreditur: text('nama_kreditur').notNull().default(''),
		negaraKreditur: text('negara_kreditur').notNull().default(''),
		// The rare field with no asterisk on the live form, so it stays optional.
		tahunPeminjaman: integer('tahun_peminjaman'),
		saldo: integer('saldo').notNull().default(0),
		keterangan: text('keterangan').notNull().default('')
	}
);

// L-1 Bagian C, DAFTAR ANGGOTA KELUARGA YANG MENJADI TANGGUNGAN.
//
// Read-only on the live form in every captured state: it is populated from DJP
// records independently of the Posting SPT action (it held three dependants even
// though Posting reported "belum pernah dilakukan"). For a training app this is
// seeded rather than fetched, so rows exist but the grid offers no editor.
export const spt_pph_orang_pribadi_lampiran_1_keluarga = sqliteTable(
	'spt_pph_orang_pribadi_lampiran_1_keluarga',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		sptPphOrangPribadiId: text('spt_pph_orang_pribadi_id')
			.notNull()
			.references(() => spt_pph_orang_pribadi.id, { onDelete: 'cascade' }),
		nomorUrut: integer('nomor_urut').notNull(),
		nama: text('nama').notNull().default(''),
		nik: text('nik').notNull().default(''),
		tanggalLahir: text('tanggal_lahir').notNull().default(''),
		hubungan: text('hubungan').notNull().default(''),
		pekerjaan: text('pekerjaan').notNull().default('')
	}
);

// L-1 Bagian D, PENGHASILAN NETO DALAM NEGERI DARI PEKERJAAN.
//
// Feeds Induk 1.a via the JUMLAH BAGIAN D footer, which totals the *neto*, not
// the bruto. Editable exactly when Induk 1.a is Ya.
export const spt_pph_orang_pribadi_lampiran_1_pekerjaan = sqliteTable(
	'spt_pph_orang_pribadi_lampiran_1_pekerjaan',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		sptPphOrangPribadiId: text('spt_pph_orang_pribadi_id')
			.notNull()
			.references(() => spt_pph_orang_pribadi.id, { onDelete: 'cascade' }),
		nomorUrut: integer('nomor_urut').notNull(),
		nomorIdentitasPemberiKerja: text('nomor_identitas_pemberi_kerja').notNull().default(''),
		namaPemberiKerja: text('nama_pemberi_kerja').notNull().default(''),
		penghasilanBruto: integer('penghasilan_bruto').notNull().default(0),
		pengurangPenghasilanBruto: integer('pengurang_penghasilan_bruto').notNull().default(0),
		// Derived as bruto - pengurang, but stored so the saved row is self
		// contained and the footer can be summed in a query.
		penghasilanNeto: integer('penghasilan_neto').notNull().default(0)
	}
);

// L-1 Bagian E, DAFTAR BUKTI PEMOTONGAN/PEMUNGUTAN PPh.
//
// Feeds Induk 10a, but not alone: the JUMLAH BAGIAN E footer is this grid's own
// JUMLAH plus a KREDIT PAJAK ATAS PENGHASILAN LUAR NEGERI row imported from
// L-2 C. So 10a aggregates two lampiran, and the dependency graph has
// lampiran-to-lampiran edges. Measured, see BEHAVIOR.md.
export const spt_pph_orang_pribadi_lampiran_1_bukti_potong = sqliteTable(
	'spt_pph_orang_pribadi_lampiran_1_bukti_potong',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		sptPphOrangPribadiId: text('spt_pph_orang_pribadi_id')
			.notNull()
			.references(() => spt_pph_orang_pribadi.id, { onDelete: 'cascade' }),
		nomorUrut: integer('nomor_urut').notNull(),
		namaPemotong: text('nama_pemotong').notNull().default(''),
		npwpPemotong: text('npwp_pemotong').notNull().default(''),
		nomorBukti: text('nomor_bukti').notNull().default(''),
		// ISO date. The live form's picker cannot be typed into and applies no
		// tax-year validation at all; we use an ordinary date input instead.
		tanggalBukti: text('tanggal_bukti').notNull().default(''),
		jenisPajak: text('jenis_pajak').notNull().default(''),
		penghasilanBruto: integer('penghasilan_bruto').notNull().default(0),
		pphDipotong: integer('pph_dipotong').notNull().default(0)
	}
);
