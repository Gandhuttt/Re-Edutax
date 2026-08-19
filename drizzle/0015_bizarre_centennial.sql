CREATE TABLE `spt_pph_orang_pribadi_lampiran_3c` (
	`spt_pph_orang_pribadi_id` text PRIMARY KEY NOT NULL,
	`total_penyusutan_komersial` integer DEFAULT 0 NOT NULL,
	`total_amortisasi_komersial` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`spt_pph_orang_pribadi_id`) REFERENCES `spt_pph_orang_pribadi`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `spt_pph_orang_pribadi_lampiran_3c_baris` (
	`id` text PRIMARY KEY NOT NULL,
	`spt_pph_orang_pribadi_id` text NOT NULL,
	`table_index` integer NOT NULL,
	`nomor_urut` integer NOT NULL,
	`kode_harta` text DEFAULT '' NOT NULL,
	`jenis_harta` text DEFAULT '' NOT NULL,
	`bulan_perolehan` integer DEFAULT 0 NOT NULL,
	`tahun_perolehan` integer DEFAULT 0 NOT NULL,
	`harga_perolehan` integer DEFAULT 0 NOT NULL,
	`nilai_sisa_buku_fiskal` integer DEFAULT 0 NOT NULL,
	`metode_komersial` text DEFAULT '' NOT NULL,
	`metode_fiskal` text DEFAULT '' NOT NULL,
	`penyusutan_fiskal_tahun_ini` integer DEFAULT 0 NOT NULL,
	`keterangan` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`spt_pph_orang_pribadi_id`) REFERENCES `spt_pph_orang_pribadi`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `spt_pph_orang_pribadi_lampiran_3d_entertainment` (
	`id` text PRIMARY KEY NOT NULL,
	`spt_pph_orang_pribadi_id` text NOT NULL,
	`nomor_urut` integer NOT NULL,
	`tanggal` text DEFAULT '' NOT NULL,
	`nama_tempat` text DEFAULT '' NOT NULL,
	`alamat` text DEFAULT '' NOT NULL,
	`jenis` text DEFAULT '' NOT NULL,
	`jumlah_pemberian` integer DEFAULT 0 NOT NULL,
	`nama_relasi` text DEFAULT '' NOT NULL,
	`posisi_jabatan` text DEFAULT '' NOT NULL,
	`nama_perusahaan` text DEFAULT '' NOT NULL,
	`jenis_usaha_relasi` text DEFAULT '' NOT NULL,
	`keterangan` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`spt_pph_orang_pribadi_id`) REFERENCES `spt_pph_orang_pribadi`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `spt_pph_orang_pribadi_lampiran_3d_piutang` (
	`id` text PRIMARY KEY NOT NULL,
	`spt_pph_orang_pribadi_id` text NOT NULL,
	`nomor_urut` integer NOT NULL,
	`nomor_identitas_debitur` text DEFAULT '' NOT NULL,
	`nama_debitur` text DEFAULT '' NOT NULL,
	`alamat_debitur` text DEFAULT '' NOT NULL,
	`jumlah_plafon` integer DEFAULT 0 NOT NULL,
	`jumlah_tidak_dapat_ditagih` integer DEFAULT 0 NOT NULL,
	`kode_metode_pembebanan` text DEFAULT '' NOT NULL,
	`metode_pembebanan` text DEFAULT '' NOT NULL,
	`kode_jenis_dokumen` text DEFAULT '' NOT NULL,
	`jenis_dokumen` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`spt_pph_orang_pribadi_id`) REFERENCES `spt_pph_orang_pribadi`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `spt_pph_orang_pribadi_lampiran_3d_promosi` (
	`id` text PRIMARY KEY NOT NULL,
	`spt_pph_orang_pribadi_id` text NOT NULL,
	`nomor_urut` integer NOT NULL,
	`nomor_identitas_penerima` text DEFAULT '' NOT NULL,
	`nama_penerima` text DEFAULT '' NOT NULL,
	`alamat_penerima` text DEFAULT '' NOT NULL,
	`tanggal` text DEFAULT '' NOT NULL,
	`kode_bentuk_jenis_biaya` text DEFAULT '' NOT NULL,
	`bentuk_jenis_biaya` text DEFAULT '' NOT NULL,
	`nilai` integer DEFAULT 0 NOT NULL,
	`keterangan` text DEFAULT '' NOT NULL,
	`jumlah_pemotongan` integer DEFAULT 0 NOT NULL,
	`nomor_bukti_potong` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`spt_pph_orang_pribadi_id`) REFERENCES `spt_pph_orang_pribadi`(`id`) ON UPDATE no action ON DELETE cascade
);
