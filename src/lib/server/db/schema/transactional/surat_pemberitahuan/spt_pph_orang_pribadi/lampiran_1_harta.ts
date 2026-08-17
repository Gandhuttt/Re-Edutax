import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { spt_pph_orang_pribadi } from './spt_pph_orang_pribadi';

// L-1 Bagian A, HARTA PADA AKHIR TAHUN PAJAK.
//
// Coretax splits this into six editable sub-tables (A1 to A6) with different
// column sets, plus A7 which is a read-only rollup of them. Rather than six
// tables, this is one table with a `subTabel` discriminator and the union of the
// columns, because the six overlap heavily (kode, deskripsi, tahun perolehan,
// harga perolehan, nilai saat ini, keterangan) and every one of them rolls up
// into the same A7 total that feeds Induk 14a.
//
// Columns that only some sub-tables use are nullable and simply left unset:
// which fields a given sub-table shows is a property of its modal, not of the
// storage. The per-sub-table field lists are in
// docs/ui-reference/coretax/spt-1770-lampiran/MODAL-FIELDS.md.
export const spt_pph_orang_pribadi_lampiran_1_harta = sqliteTable(
	'spt_pph_orang_pribadi_lampiran_1_harta',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		sptPphOrangPribadiId: text('spt_pph_orang_pribadi_id')
			.notNull()
			.references(() => spt_pph_orang_pribadi.id, { onDelete: 'cascade' }),
		// 'a1' kas, 'a2' piutang, 'a3' investasi, 'a4' harta bergerak,
		// 'a5' harta tidak bergerak, 'a6' aset lain-lain.
		subTabel: text('sub_tabel', { enum: ['a1', 'a2', 'a3', 'a4', 'a5', 'a6'] }).notNull(),
		nomorUrut: integer('nomor_urut').notNull(),

		// Typed by the peserta, deliberately not derived from deskripsi.
		kode: text('kode').notNull().default(''),
		// A4 uses "Tipe" rather than "Deskripsi" as its describing dropdown, and it
		// is the only sub-table with no Deskripsi field at all.
		deskripsi: text('deskripsi').notNull().default(''),

		// A1 and A3 use a negara dropdown here; A5 uses a plain text input for the
		// same concept. Stored as text either way.
		lokasiHarta: text('lokasi_harta'),
		nomorAkun: text('nomor_akun'),
		atasNama: text('atas_nama'),
		namaBankInstitusi: text('nama_bank_institusi'),

		// A2 piutang
		nomorIdentitasPenerima: text('nomor_identitas_penerima'),
		namaPenerimaPinjaman: text('nama_penerima_pinjaman'),
		nilaiPiutang: integer('nilai_piutang'),
		tahunDimulai: integer('tahun_dimulai'),
		saldoPiutangSaatIni: integer('saldo_piutang_saat_ini'),

		// A4 harta bergerak
		merkModel: text('merk_model'),
		nomorPolisiRegistrasi: text('nomor_polisi_registrasi'),
		kepemilikan: text('kepemilikan'),
		nomorIdentitasPemilik: text('nomor_identitas_pemilik'),
		namaPemilik: text('nama_pemilik'),

		// A5 harta tidak bergerak
		ukuranTanah: text('ukuran_tanah'),
		ukuranBangunan: text('ukuran_bangunan'),
		sumberKepemilikan: text('sumber_kepemilikan'),
		nomorSertifikat: text('nomor_sertifikat'),

		// A6 aset lain-lain
		buktiKepemilikan: text('bukti_kepemilikan'),
		informasiTambahan: text('informasi_tambahan'),

		// Shared money and year columns. A1 records a single SALDO where the others
		// record a Harga Perolehan and a Nilai Saat Ini; A1's saldo populates both
		// sides of the A7 rollup, which is what the live form does.
		tahunPerolehan: integer('tahun_perolehan'),
		hargaPerolehan: integer('harga_perolehan').notNull().default(0),
		nilaiSaatIni: integer('nilai_saat_ini').notNull().default(0),

		// A PPS flag rather than free text: only "Harta PPS" / "Harta Investasi PPS".
		keterangan: text('keterangan').notNull().default('')
	}
);
