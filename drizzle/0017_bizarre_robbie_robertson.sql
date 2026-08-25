CREATE TABLE `spt_ppn_penyerahan` (
	`id` text PRIMARY KEY NOT NULL,
	`spt_ppn_id` text NOT NULL,
	`i_a1` integer DEFAULT 0 NOT NULL,
	`i_a2_harga_jual` integer DEFAULT 0 NOT NULL,
	`i_a2_dpp_nilai_lain` integer DEFAULT 0 NOT NULL,
	`i_a2_ppn` integer DEFAULT 0 NOT NULL,
	`i_a2_ppnbm` integer DEFAULT 0 NOT NULL,
	`i_a3_harga_jual` integer DEFAULT 0 NOT NULL,
	`i_a3_dpp_nilai_lain` integer DEFAULT 0 NOT NULL,
	`i_a3_ppn` integer DEFAULT 0 NOT NULL,
	`i_a3_ppnbm` integer DEFAULT 0 NOT NULL,
	`i_a4_harga_jual` integer DEFAULT 0 NOT NULL,
	`i_a4_ppn` integer DEFAULT 0 NOT NULL,
	`i_a4_ppnbm` integer DEFAULT 0 NOT NULL,
	`i_a5_harga_jual` integer DEFAULT 0 NOT NULL,
	`i_a5_dpp_nilai_lain` integer DEFAULT 0 NOT NULL,
	`i_a5_ppn` integer DEFAULT 0 NOT NULL,
	`i_a5_ppnbm` integer DEFAULT 0 NOT NULL,
	`i_a6_harga_jual` integer DEFAULT 0 NOT NULL,
	`i_a6_dpp_nilai_lain` integer DEFAULT 0 NOT NULL,
	`i_a6_ppn` integer DEFAULT 0 NOT NULL,
	`i_a6_ppnbm` integer DEFAULT 0 NOT NULL,
	`i_a7_harga_jual` integer DEFAULT 0 NOT NULL,
	`i_a7_dpp_nilai_lain` integer DEFAULT 0 NOT NULL,
	`i_a7_ppn` integer DEFAULT 0 NOT NULL,
	`i_a7_ppnbm` integer DEFAULT 0 NOT NULL,
	`i_a8_harga_jual` integer DEFAULT 0 NOT NULL,
	`i_a8_dpp_nilai_lain` integer DEFAULT 0 NOT NULL,
	`i_a8_ppn` integer DEFAULT 0 NOT NULL,
	`i_a8_ppnbm` integer DEFAULT 0 NOT NULL,
	`i_a9_harga_jual` integer DEFAULT 0 NOT NULL,
	`i_a9_dpp_nilai_lain` integer DEFAULT 0 NOT NULL,
	`i_a9_ppn` integer DEFAULT 0 NOT NULL,
	`i_a9_ppnbm` integer DEFAULT 0 NOT NULL,
	`i_a_jumlah_harga_jual` integer DEFAULT 0 NOT NULL,
	`i_a_jumlah_ppn` integer DEFAULT 0 NOT NULL,
	`i_a_jumlah_ppnbm` integer DEFAULT 0 NOT NULL,
	`i_b` integer DEFAULT 0 NOT NULL,
	`i_c` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`spt_ppn_id`) REFERENCES `spt_ppn`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `spt_ppn_penyerahan_spt_ppn_id_unique` ON `spt_ppn_penyerahan` (`spt_ppn_id`);--> statement-breakpoint
CREATE TABLE `spt_ppn_perolehan` (
	`id` text PRIMARY KEY NOT NULL,
	`spt_ppn_id` text NOT NULL,
	`ii_a_dpp` integer DEFAULT 0 NOT NULL,
	`ii_a_ppn` integer DEFAULT 0 NOT NULL,
	`ii_a_ppnbm` integer DEFAULT 0 NOT NULL,
	`ii_b_dpp` integer DEFAULT 0 NOT NULL,
	`ii_b_dpp_nilai_lain` integer DEFAULT 0 NOT NULL,
	`ii_b_ppn` integer DEFAULT 0 NOT NULL,
	`ii_b_ppnbm` integer DEFAULT 0 NOT NULL,
	`ii_c_dpp` integer DEFAULT 0 NOT NULL,
	`ii_c_ppn` integer DEFAULT 0 NOT NULL,
	`ii_c_ppnbm` integer DEFAULT 0 NOT NULL,
	`ii_d_dpp` integer DEFAULT 0 NOT NULL,
	`ii_d_dpp_nilai_lain` integer DEFAULT 0 NOT NULL,
	`ii_d_ppn` integer DEFAULT 0 NOT NULL,
	`ii_d_ppnbm` integer DEFAULT 0 NOT NULL,
	`ii_e` integer DEFAULT 0 NOT NULL,
	`ii_f` integer DEFAULT 0 NOT NULL,
	`ii_g_dpp` integer DEFAULT 0 NOT NULL,
	`ii_g_ppn` integer DEFAULT 0 NOT NULL,
	`ii_h_dpp` integer DEFAULT 0 NOT NULL,
	`ii_h_dpp_nilai_lain` integer DEFAULT 0 NOT NULL,
	`ii_h_ppn` integer DEFAULT 0 NOT NULL,
	`ii_h_ppnbm` integer DEFAULT 0 NOT NULL,
	`ii_i` integer DEFAULT 0 NOT NULL,
	`ii_j` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`spt_ppn_id`) REFERENCES `spt_ppn`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `spt_ppn_perolehan_spt_ppn_id_unique` ON `spt_ppn_perolehan` (`spt_ppn_id`);--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `iii_a` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `iii_b` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `iii_c` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `iii_d` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `iii_e` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `iii_f` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `iii_g` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `iii_h_ganti_spt_sebelumnya` integer;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `iii_h_tindakan` text;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `iii_h_lampiran_nama_file` text;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `iii_h_rekening_pilih_bank` text;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `iii_h_rekening_nomor` text;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `iii_h_rekening_nama_bank` text;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `iii_h_rekening_nama_pemilik` text;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `iv_dpp` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `iv_ppn` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `v` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `vi_a` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `vi_b` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `vi_c` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `vi_d` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `vi_e` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `vi_f` integer;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `vii_a_dpp` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `vii_a_dpp_nilai_lain` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `vii_a_ppn` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `vii_a_ppnbm` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `vii_b_dpp` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `vii_b_dpp_nilai_lain` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `vii_b_ppn` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `vii_b_ppnbm` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `vii_c_dpp` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `vii_c_dpp_nilai_lain` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `vii_c_ppn` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `vii_c_ppnbm` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `viii_a_dpp` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `viii_a_dpp_nilai_lain` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `viii_a_ppn` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `viii_a_ppnbm` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `viii_b_dpp` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `viii_b_dpp_nilai_lain` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `viii_b_ppn` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `viii_b_ppnbm` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `viii_c_dpp` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `viii_c_dpp_nilai_lain` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `viii_c_ppn` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `viii_c_ppnbm` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `viii_d` integer;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `ix_a` integer;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `ix_b` integer;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `x_setuju` integer;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `x_ditandatangani_oleh` text;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `x_kota_penandatangan_spt` text;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `x_nama` text;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `x_jabatan` text;--> statement-breakpoint
ALTER TABLE `spt_ppn` ADD `x_batas_waktu_penyampaian` text;