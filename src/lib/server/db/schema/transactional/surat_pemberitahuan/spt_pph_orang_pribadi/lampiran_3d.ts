import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { spt_pph_orang_pribadi } from './spt_pph_orang_pribadi';

// L-3D, daftar nominatif. Read from the Coretax bundle, not the UI; see
// docs/ui-reference/coretax/spt-1770-lampiran/L3C-L3D.md.
//
// Three independent grids with no totals and no derived fields anywhere --
// Coretax's l3dForm holds only {EntertainmentCosts, PromotionCosts, BadDebts}
// plus disabled context, and never patches an Induk valueXX. Its three endpoints
// are l3d-table-1/2/3-grid, in the order entertainment, promosi, piutang.
//
// Every visible control is required in Coretax and all amounts carry
// greaterThanEquals(0), so unlike most grids here there is no optional column.

// A. DAFTAR NOMINATIF BIAYA ENTERTAINMENT
// (Coretax dialog title: "Daftar Nominatif Biaya Hiburan".)
export const spt_pph_orang_pribadi_lampiran_3d_entertainment = sqliteTable(
	'spt_pph_orang_pribadi_lampiran_3d_entertainment',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		sptPphOrangPribadiId: text('spt_pph_orang_pribadi_id')
			.notNull()
			.references(() => spt_pph_orang_pribadi.id, { onDelete: 'cascade' }),
		nomorUrut: integer('nomor_urut').notNull(),
		tanggal: text('tanggal').notNull().default(''),
		namaTempat: text('nama_tempat').notNull().default(''),
		alamat: text('alamat').notNull().default(''),
		jenis: text('jenis').notNull().default(''),
		jumlahPemberian: integer('jumlah_pemberian').notNull().default(0),
		namaRelasi: text('nama_relasi').notNull().default(''),
		posisiJabatan: text('posisi_jabatan').notNull().default(''),
		namaPerusahaan: text('nama_perusahaan').notNull().default(''),
		jenisUsahaRelasi: text('jenis_usaha_relasi').notNull().default(''),
		keterangan: text('keterangan').notNull().default('')
	}
);

// B. DAFTAR NOMINATIF BIAYA PROMOSI SERTA PENGGANTIAN ATAU IMBALAN DALAM BENTUK
// NATURA DAN/ATAU KENIKMATAN.
export const spt_pph_orang_pribadi_lampiran_3d_promosi = sqliteTable(
	'spt_pph_orang_pribadi_lampiran_3d_promosi',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		sptPphOrangPribadiId: text('spt_pph_orang_pribadi_id')
			.notNull()
			.references(() => spt_pph_orang_pribadi.id, { onDelete: 'cascade' }),
		nomorUrut: integer('nomor_urut').notNull(),
		nomorIdentitasPenerima: text('nomor_identitas_penerima').notNull().default(''),
		namaPenerima: text('nama_penerima').notNull().default(''),
		alamatPenerima: text('alamat_penerima').notNull().default(''),
		tanggal: text('tanggal').notNull().default(''),
		// Derived from bentukJenisBiaya, like every other Kode on this form.
		kodeBentukJenisBiaya: text('kode_bentuk_jenis_biaya').notNull().default(''),
		bentukJenisBiaya: text('bentuk_jenis_biaya').notNull().default(''),
		nilai: integer('nilai').notNull().default(0),
		keterangan: text('keterangan').notNull().default(''),
		jumlahPemotongan: integer('jumlah_pemotongan').notNull().default(0),
		nomorBuktiPotong: text('nomor_bukti_potong').notNull().default('')
	}
);

// C. Piutang yang nyata-nyata tidak dapat ditagih.
export const spt_pph_orang_pribadi_lampiran_3d_piutang = sqliteTable(
	'spt_pph_orang_pribadi_lampiran_3d_piutang',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		sptPphOrangPribadiId: text('spt_pph_orang_pribadi_id')
			.notNull()
			.references(() => spt_pph_orang_pribadi.id, { onDelete: 'cascade' }),
		nomorUrut: integer('nomor_urut').notNull(),
		nomorIdentitasDebitur: text('nomor_identitas_debitur').notNull().default(''),
		namaDebitur: text('nama_debitur').notNull().default(''),
		alamatDebitur: text('alamat_debitur').notNull().default(''),
		jumlahPlafon: integer('jumlah_plafon').notNull().default(0),
		jumlahTidakDapatDitagih: integer('jumlah_tidak_dapat_ditagih').notNull().default(0),
		kodeMetodePembebanan: text('kode_metode_pembebanan').notNull().default(''),
		metodePembebanan: text('metode_pembebanan').notNull().default(''),
		kodeJenisDokumen: text('kode_jenis_dokumen').notNull().default(''),
		jenisDokumen: text('jenis_dokumen').notNull().default('')
	}
);
