CREATE TABLE `spt_pph_orang_pribadi_lampiran_2_bukan_objek` (
	`id` text PRIMARY KEY NOT NULL,
	`spt_pph_orang_pribadi_id` text NOT NULL,
	`nomor_urut` integer NOT NULL,
	`kode` text DEFAULT '' NOT NULL,
	`jenis_penghasilan` text DEFAULT '' NOT NULL,
	`npwp_sumber` text DEFAULT '' NOT NULL,
	`nama_sumber` text DEFAULT '' NOT NULL,
	`penghasilan_bruto` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`spt_pph_orang_pribadi_id`) REFERENCES `spt_pph_orang_pribadi`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `spt_pph_orang_pribadi_lampiran_2_final` (
	`id` text PRIMARY KEY NOT NULL,
	`spt_pph_orang_pribadi_id` text NOT NULL,
	`nomor_urut` integer NOT NULL,
	`npwp_pemotong` text DEFAULT '' NOT NULL,
	`nama_pemotong` text DEFAULT '' NOT NULL,
	`kode_objek_pajak` text DEFAULT '' NOT NULL,
	`jenis_penghasilan` text DEFAULT '' NOT NULL,
	`dasar_pengenaan_pajak` integer DEFAULT 0 NOT NULL,
	`pph_terutang` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`spt_pph_orang_pribadi_id`) REFERENCES `spt_pph_orang_pribadi`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `spt_pph_orang_pribadi_lampiran_2_luar_negeri` (
	`id` text PRIMARY KEY NOT NULL,
	`spt_pph_orang_pribadi_id` text NOT NULL,
	`nomor_urut` integer NOT NULL,
	`nama_sumber` text DEFAULT '' NOT NULL,
	`negara` text DEFAULT '' NOT NULL,
	`tanggal_transaksi` text DEFAULT '' NOT NULL,
	`jenis_penghasilan` text DEFAULT '' NOT NULL,
	`kode_penghasilan` text DEFAULT '' NOT NULL,
	`penghasilan_neto` integer DEFAULT 0 NOT NULL,
	`mata_uang` text DEFAULT '' NOT NULL,
	`pajak_luar_negeri_asing` integer DEFAULT 0 NOT NULL,
	`pajak_luar_negeri_rupiah` integer DEFAULT 0 NOT NULL,
	`kredit_pajak_diperhitungkan` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`spt_pph_orang_pribadi_id`) REFERENCES `spt_pph_orang_pribadi`(`id`) ON UPDATE no action ON DELETE cascade
);
