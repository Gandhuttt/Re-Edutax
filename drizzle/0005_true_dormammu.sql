CREATE TABLE `referensi_lampiran_spt_pph_orang_pribadi` (
	`id` text PRIMARY KEY NOT NULL,
	`daftar` text NOT NULL,
	`urutan` integer NOT NULL,
	`nama` text NOT NULL,
	`aktif` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `referensi_lampiran_spt_pph_orang_pribadi_unique` ON `referensi_lampiran_spt_pph_orang_pribadi` (`daftar`,`urutan`);--> statement-breakpoint
CREATE TABLE `spt_pph_orang_pribadi_lampiran_1_harta` (
	`id` text PRIMARY KEY NOT NULL,
	`spt_pph_orang_pribadi_id` text NOT NULL,
	`sub_tabel` text NOT NULL,
	`nomor_urut` integer NOT NULL,
	`kode` text DEFAULT '' NOT NULL,
	`deskripsi` text DEFAULT '' NOT NULL,
	`lokasi_harta` text,
	`nomor_akun` text,
	`atas_nama` text,
	`nama_bank_institusi` text,
	`nomor_identitas_penerima` text,
	`nama_penerima_pinjaman` text,
	`nilai_piutang` integer,
	`tahun_dimulai` integer,
	`saldo_piutang_saat_ini` integer,
	`merk_model` text,
	`nomor_polisi_registrasi` text,
	`kepemilikan` text,
	`nomor_identitas_pemilik` text,
	`nama_pemilik` text,
	`ukuran_tanah` text,
	`ukuran_bangunan` text,
	`sumber_kepemilikan` text,
	`nomor_sertifikat` text,
	`bukti_kepemilikan` text,
	`informasi_tambahan` text,
	`tahun_perolehan` integer,
	`harga_perolehan` integer DEFAULT 0 NOT NULL,
	`nilai_saat_ini` integer DEFAULT 0 NOT NULL,
	`keterangan` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`spt_pph_orang_pribadi_id`) REFERENCES `spt_pph_orang_pribadi`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `spt_pph_orang_pribadi_lampiran_1_bukti_potong` (
	`id` text PRIMARY KEY NOT NULL,
	`spt_pph_orang_pribadi_id` text NOT NULL,
	`nomor_urut` integer NOT NULL,
	`nama_pemotong` text DEFAULT '' NOT NULL,
	`npwp_pemotong` text DEFAULT '' NOT NULL,
	`nomor_bukti` text DEFAULT '' NOT NULL,
	`tanggal_bukti` text DEFAULT '' NOT NULL,
	`jenis_pajak` text DEFAULT '' NOT NULL,
	`penghasilan_bruto` integer DEFAULT 0 NOT NULL,
	`pph_dipotong` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`spt_pph_orang_pribadi_id`) REFERENCES `spt_pph_orang_pribadi`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `spt_pph_orang_pribadi_lampiran_1_keluarga` (
	`id` text PRIMARY KEY NOT NULL,
	`spt_pph_orang_pribadi_id` text NOT NULL,
	`nomor_urut` integer NOT NULL,
	`nama` text DEFAULT '' NOT NULL,
	`nik` text DEFAULT '' NOT NULL,
	`tanggal_lahir` text DEFAULT '' NOT NULL,
	`hubungan` text DEFAULT '' NOT NULL,
	`pekerjaan` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`spt_pph_orang_pribadi_id`) REFERENCES `spt_pph_orang_pribadi`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `spt_pph_orang_pribadi_lampiran_1_pekerjaan` (
	`id` text PRIMARY KEY NOT NULL,
	`spt_pph_orang_pribadi_id` text NOT NULL,
	`nomor_urut` integer NOT NULL,
	`nomor_identitas_pemberi_kerja` text DEFAULT '' NOT NULL,
	`nama_pemberi_kerja` text DEFAULT '' NOT NULL,
	`penghasilan_bruto` integer DEFAULT 0 NOT NULL,
	`pengurang_penghasilan_bruto` integer DEFAULT 0 NOT NULL,
	`penghasilan_neto` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`spt_pph_orang_pribadi_id`) REFERENCES `spt_pph_orang_pribadi`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `spt_pph_orang_pribadi_lampiran_1_utang` (
	`id` text PRIMARY KEY NOT NULL,
	`spt_pph_orang_pribadi_id` text NOT NULL,
	`nomor_urut` integer NOT NULL,
	`kode` text DEFAULT '' NOT NULL,
	`deskripsi` text DEFAULT '' NOT NULL,
	`nik_npwp_kreditur` text DEFAULT '' NOT NULL,
	`nama_kreditur` text DEFAULT '' NOT NULL,
	`negara_kreditur` text DEFAULT '' NOT NULL,
	`tahun_peminjaman` integer,
	`saldo` integer DEFAULT 0 NOT NULL,
	`keterangan` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`spt_pph_orang_pribadi_id`) REFERENCES `spt_pph_orang_pribadi`(`id`) ON UPDATE no action ON DELETE cascade
);
