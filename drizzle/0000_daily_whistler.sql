CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`username` text,
	`display_username` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE INDEX `session_user_id_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `account_user_id_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);--> statement-breakpoint
CREATE TABLE `kode_transaksi_faktur_pajak` (
	`id` text PRIMARY KEY NOT NULL,
	`kode` integer NOT NULL,
	`nama` text NOT NULL,
	`deskripsi` text,
	`aktif` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `kode_transaksi_faktur_pajak_kode_unique` ON `kode_transaksi_faktur_pajak` (`kode`);--> statement-breakpoint
CREATE TABLE `sub_kode_transaksi_faktur_pajak` (
	`id` text PRIMARY KEY NOT NULL,
	`kode_transaksi_id` text NOT NULL,
	`kode` integer NOT NULL,
	`nama` text NOT NULL,
	`deskripsi` text,
	`aktif` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`kode_transaksi_id`) REFERENCES `kode_transaksi_faktur_pajak`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sub_kode_transaksi_faktur_pajak_parent_kode_unique` ON `sub_kode_transaksi_faktur_pajak` (`kode_transaksi_id`,`kode`);--> statement-breakpoint
CREATE TABLE `jenis_informasi_tambahan_faktur_pajak` (
	`id` text PRIMARY KEY NOT NULL,
	`kode_transaksi_id` text NOT NULL,
	`sub_kode_transaksi_id` text,
	`kode` integer NOT NULL,
	`nama` text NOT NULL,
	`cap_fasilitas` text,
	`butuh_dokumen_pendukung` integer DEFAULT false NOT NULL,
	`aktif` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`kode_transaksi_id`) REFERENCES `kode_transaksi_faktur_pajak`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sub_kode_transaksi_id`) REFERENCES `sub_kode_transaksi_faktur_pajak`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `jenis_informasi_tambahan_faktur_pajak_parent_kode_unique` ON `jenis_informasi_tambahan_faktur_pajak` (`kode_transaksi_id`,`sub_kode_transaksi_id`,`kode`);--> statement-breakpoint
CREATE TABLE `jenis_item_transaksi_faktur` (
	`id` text PRIMARY KEY NOT NULL,
	`kode` text NOT NULL,
	`nama` text NOT NULL,
	`aktif` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `jenis_item_transaksi_faktur_kode_unique` ON `jenis_item_transaksi_faktur` (`kode`);--> statement-breakpoint
CREATE TABLE `kode_item_transaksi_faktur` (
	`id` text PRIMARY KEY NOT NULL,
	`jenis_item_id` text NOT NULL,
	`kode` text NOT NULL,
	`nama_indonesia` text NOT NULL,
	`nama_inggris` text,
	`aktif` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`jenis_item_id`) REFERENCES `jenis_item_transaksi_faktur`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `kode_item_transaksi_faktur_kode_unique` ON `kode_item_transaksi_faktur` (`kode`);--> statement-breakpoint
CREATE TABLE `satuan_ukur_transaksi_faktur` (
	`id` text PRIMARY KEY NOT NULL,
	`jenis_item_id` text,
	`kode` text NOT NULL,
	`nama` text NOT NULL,
	`aktif` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`jenis_item_id`) REFERENCES `jenis_item_transaksi_faktur`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `satuan_ukur_transaksi_faktur_kode_unique` ON `satuan_ukur_transaksi_faktur` (`kode`);--> statement-breakpoint
CREATE TABLE `wajib_pajak` (
	`id` text PRIMARY KEY NOT NULL,
	`npwp` text NOT NULL,
	`nama` text NOT NULL,
	`email` text NOT NULL,
	`nomor_telepon` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `wajib_pajak_npwp_unique` ON `wajib_pajak` (`npwp`);--> statement-breakpoint
CREATE TABLE `tempat_kegiatan_usaha` (
	`id` text PRIMARY KEY NOT NULL,
	`nitku` text NOT NULL,
	`wajib_pajak` text NOT NULL,
	`nama` text NOT NULL,
	`email` text,
	`nomor_telepon` text,
	`alamat` text,
	`kode_pos` text,
	FOREIGN KEY (`wajib_pajak`) REFERENCES `wajib_pajak`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tempat_kegiatan_usaha_nitku_unique` ON `tempat_kegiatan_usaha` (`nitku`);--> statement-breakpoint
CREATE UNIQUE INDEX `tempat_kegiatan_usaha_wajib_pajak_nitku_unique` ON `tempat_kegiatan_usaha` (`wajib_pajak`,`nitku`);--> statement-breakpoint
CREATE TABLE `faktur_pajak` (
	`id` text PRIMARY KEY NOT NULL,
	`npwp_penjual` text NOT NULL,
	`npwp_pembeli` text DEFAULT '',
	`nomor_faktur` text DEFAULT '',
	`kode_transaksi_id` text NOT NULL,
	`referensi` text DEFAULT '' NOT NULL,
	`alamat` text DEFAULT '' NOT NULL,
	`uang_muka` integer DEFAULT false NOT NULL,
	`pelunasan` integer DEFAULT false NOT NULL,
	`tanggal_faktur` text NOT NULL,
	`masa_pajak` integer NOT NULL,
	`tahun` integer NOT NULL,
	`diupload` integer DEFAULT false NOT NULL,
	`dikreditkan` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`npwp_penjual`) REFERENCES `wajib_pajak`(`npwp`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`kode_transaksi_id`) REFERENCES `kode_transaksi_faktur_pajak`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `informasi_tambahan_faktur_pajak` (
	`id` text PRIMARY KEY NOT NULL,
	`faktur_pajak_id` text NOT NULL,
	`jenis_informasi_tambahan_id` text NOT NULL,
	`dokumen_pendukung` text,
	FOREIGN KEY (`faktur_pajak_id`) REFERENCES `faktur_pajak`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`jenis_informasi_tambahan_id`) REFERENCES `jenis_informasi_tambahan_faktur_pajak`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `informasi_tambahan_faktur_pajak_faktur_unique` ON `informasi_tambahan_faktur_pajak` (`faktur_pajak_id`);--> statement-breakpoint
CREATE TABLE `transaksi_faktur_pajak` (
	`id` text PRIMARY KEY NOT NULL,
	`faktur_pajak_id` text NOT NULL,
	`nama` text NOT NULL,
	`kode_item_id` text NOT NULL,
	`satuan_ukur_id` text NOT NULL,
	`kuantitas` integer DEFAULT 0 NOT NULL,
	`harga_satuan` integer DEFAULT 0 NOT NULL,
	`harga_potongan` integer DEFAULT 0 NOT NULL,
	`dpp_nilai_lain` integer DEFAULT 0 NOT NULL,
	`tarif_ppn` integer DEFAULT 12 NOT NULL,
	`tarif_ppnbm` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`faktur_pajak_id`) REFERENCES `faktur_pajak`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`kode_item_id`) REFERENCES `kode_item_transaksi_faktur`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`satuan_ukur_id`) REFERENCES `satuan_ukur_transaksi_faktur`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `spt_ppn` (
	`id` text PRIMARY KEY NOT NULL,
	`npwp` text NOT NULL,
	`masa_pajak` integer NOT NULL,
	`tahun` integer NOT NULL,
	`pembetulan_ke` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'konsep' NOT NULL,
	`blob` text NOT NULL,
	`total_dpp_keluaran` integer DEFAULT 0 NOT NULL,
	`total_dpp_nilai_lain_keluaran` integer DEFAULT 0 NOT NULL,
	`total_ppn_keluaran` integer DEFAULT 0 NOT NULL,
	`total_ppnbm_keluaran` integer DEFAULT 0 NOT NULL,
	`total_dpp_masukan` integer DEFAULT 0 NOT NULL,
	`total_ppn_masukan` integer DEFAULT 0 NOT NULL,
	`ppn_kurang_lebih_bayar` integer DEFAULT 0 NOT NULL,
	`tanggal_posting` integer,
	`tanggal_dilaporkan` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`npwp`) REFERENCES `wajib_pajak`(`npwp`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `spt_ppn_period_unique` ON `spt_ppn` (`npwp`,`masa_pajak`,`tahun`,`pembetulan_ke`);--> statement-breakpoint
CREATE TABLE `sektor_usaha_spt_pph_badan` (
	`id` text PRIMARY KEY NOT NULL,
	`kode` text NOT NULL,
	`nama` text NOT NULL,
	`lampiran_1_kode` text,
	`aktif` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sektor_usaha_spt_pph_badan_kode_unique` ON `sektor_usaha_spt_pph_badan` (`kode`);--> statement-breakpoint
CREATE TABLE `opini_auditor_spt_pph_badan` (
	`id` text PRIMARY KEY NOT NULL,
	`kode` text NOT NULL,
	`nama` text NOT NULL,
	`aktif` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `opini_auditor_spt_pph_badan_kode_unique` ON `opini_auditor_spt_pph_badan` (`kode`);--> statement-breakpoint
CREATE TABLE `negara_spt_pph_badan` (
	`id` text PRIMARY KEY NOT NULL,
	`kode` text NOT NULL,
	`nama` text NOT NULL,
	`aktif` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `negara_spt_pph_badan_kode_unique` ON `negara_spt_pph_badan` (`kode`);--> statement-breakpoint
CREATE TABLE `mata_uang_spt_pph_badan` (
	`id` text PRIMARY KEY NOT NULL,
	`kode` text NOT NULL,
	`nama` text NOT NULL,
	`aktif` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `mata_uang_spt_pph_badan_kode_unique` ON `mata_uang_spt_pph_badan` (`kode`);--> statement-breakpoint
CREATE TABLE `jenis_harta_spt_pph_badan` (
	`id` text PRIMARY KEY NOT NULL,
	`kode` text NOT NULL,
	`nama` text NOT NULL,
	`kelompok` text NOT NULL,
	`aktif` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `jenis_harta_spt_pph_badan_kode_unique` ON `jenis_harta_spt_pph_badan` (`kode`);--> statement-breakpoint
CREATE TABLE `metode_penyusutan_spt_pph_badan` (
	`id` text PRIMARY KEY NOT NULL,
	`kode` text NOT NULL,
	`nama` text NOT NULL,
	`jenis` text NOT NULL,
	`nomor_urut` integer DEFAULT 0 NOT NULL,
	`aktif` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `metode_penyusutan_spt_pph_badan_kode_unique` ON `metode_penyusutan_spt_pph_badan` (`kode`);--> statement-breakpoint
CREATE TABLE `bentuk_hubungan_istimewa_spt_pph_badan` (
	`id` text PRIMARY KEY NOT NULL,
	`kode` text NOT NULL,
	`nama` text NOT NULL,
	`nomor_urut` integer DEFAULT 0 NOT NULL,
	`aktif` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bentuk_hubungan_istimewa_spt_pph_badan_kode_unique` ON `bentuk_hubungan_istimewa_spt_pph_badan` (`kode`);--> statement-breakpoint
CREATE TABLE `jenis_transaksi_hubungan_istimewa_spt_pph_badan` (
	`id` text PRIMARY KEY NOT NULL,
	`kode` text NOT NULL,
	`nama` text NOT NULL,
	`nomor_urut` integer DEFAULT 0 NOT NULL,
	`aktif` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `jenis_transaksi_hubungan_istimewa_spt_pph_badan_kode_unique` ON `jenis_transaksi_hubungan_istimewa_spt_pph_badan` (`kode`);--> statement-breakpoint
CREATE TABLE `metode_penentuan_harga_transfer_spt_pph_badan` (
	`id` text PRIMARY KEY NOT NULL,
	`kode` text NOT NULL,
	`nama` text NOT NULL,
	`nomor_urut` integer DEFAULT 0 NOT NULL,
	`aktif` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `metode_penentuan_harga_transfer_spt_pph_badan_kode_unique` ON `metode_penentuan_harga_transfer_spt_pph_badan` (`kode`);--> statement-breakpoint
CREATE TABLE `objek_pajak_spt_pph_badan` (
	`id` text PRIMARY KEY NOT NULL,
	`kode` text NOT NULL,
	`nama` text NOT NULL,
	`nomor_urut` integer DEFAULT 0 NOT NULL,
	`aktif` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `objek_pajak_spt_pph_badan_kode_unique` ON `objek_pajak_spt_pph_badan` (`kode`);--> statement-breakpoint
CREATE TABLE `jenis_penghasilan_bukan_objek_pajak_spt_pph_badan` (
	`id` text PRIMARY KEY NOT NULL,
	`kode` text NOT NULL,
	`nama` text NOT NULL,
	`aktif` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `jenis_penghasilan_bukan_objek_pajak_spt_pph_badan_kode_unique` ON `jenis_penghasilan_bukan_objek_pajak_spt_pph_badan` (`kode`);--> statement-breakpoint
CREATE TABLE `jenis_penghasilan_kredit_pajak_luar_negeri_spt_pph_badan` (
	`id` text PRIMARY KEY NOT NULL,
	`kode` text NOT NULL,
	`nama` text NOT NULL,
	`nomor_urut` integer DEFAULT 0 NOT NULL,
	`aktif` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `jenis_penghasilan_kredit_pajak_luar_negeri_spt_pph_badan_kode_unique` ON `jenis_penghasilan_kredit_pajak_luar_negeri_spt_pph_badan` (`kode`);--> statement-breakpoint
CREATE TABLE `jenis_pajak_dipotong_dipungut_spt_pph_badan` (
	`id` text PRIMARY KEY NOT NULL,
	`kode` text NOT NULL,
	`nama` text NOT NULL,
	`nomor_urut` integer DEFAULT 0 NOT NULL,
	`aktif` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `jenis_pajak_dipotong_dipungut_spt_pph_badan_kode_unique` ON `jenis_pajak_dipotong_dipungut_spt_pph_badan` (`kode`);--> statement-breakpoint
CREATE TABLE `kode_koreksi_fiskal_spt_pph_badan` (
	`id` text PRIMARY KEY NOT NULL,
	`kode` text NOT NULL,
	`nama` text NOT NULL,
	`jenis` text NOT NULL,
	`aktif` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `kode_koreksi_fiskal_spt_pph_badan_kode_unique` ON `kode_koreksi_fiskal_spt_pph_badan` (`kode`);--> statement-breakpoint
CREATE TABLE `spt_pph_badan_lampiran_1_akun` (
	`id` text PRIMARY KEY NOT NULL,
	`sektor_usaha_id` text NOT NULL,
	`nomor_urut` integer NOT NULL,
	`kode` text,
	`nama_akun` text NOT NULL,
	`row_type` text NOT NULL,
	`classification` text,
	`parent_kode` text,
	`sign` integer,
	FOREIGN KEY (`sektor_usaha_id`) REFERENCES `sektor_usaha_spt_pph_badan`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `spt_pph_badan_lampiran_1_akun_sektor_kode_idx` ON `spt_pph_badan_lampiran_1_akun` (`sektor_usaha_id`,`kode`);--> statement-breakpoint
CREATE TABLE `spt_pph_badan_lampiran_1_neraca_akun` (
	`id` text PRIMARY KEY NOT NULL,
	`sektor_usaha_id` text NOT NULL,
	`nomor_urut` integer NOT NULL,
	`kode` text,
	`nama_akun` text NOT NULL,
	`row_type` text NOT NULL,
	`section` text NOT NULL,
	`parent_kode` text,
	`sign` integer,
	FOREIGN KEY (`sektor_usaha_id`) REFERENCES `sektor_usaha_spt_pph_badan`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `spt_pph_badan_lampiran_1_neraca_akun_sektor_kode_idx` ON `spt_pph_badan_lampiran_1_neraca_akun` (`sektor_usaha_id`,`kode`);--> statement-breakpoint
CREATE TABLE `spt_pph_badan` (
	`id` text PRIMARY KEY NOT NULL,
	`npwp` text NOT NULL,
	`tahun_pajak` integer NOT NULL,
	`pembetulan_ke` integer DEFAULT 0 NOT NULL,
	`status_spt` text DEFAULT 'normal' NOT NULL,
	`status_draft` text DEFAULT 'konsep' NOT NULL,
	`periode_pembukuan_mulai` text NOT NULL,
	`periode_pembukuan_selesai` text NOT NULL,
	`metode_pembukuan` text NOT NULL,
	`mata_uang_pembukuan_id` text NOT NULL,
	`sektor_usaha_id` text,
	`diaudit` integer,
	`opini_auditor_id` text,
	`npwp_kantor_akuntan_publik` text,
	`nama_kantor_akuntan_publik` text,
	`menerima_penghasilan_pp23` integer,
	`hanya_penghasilan_pp23` integer,
	`menerima_penghasilan_final` integer,
	`menerima_penghasilan_bukan_objek_pajak` integer,
	`penghasilan_neto_fiskal_sebelum_fasilitas` integer DEFAULT 0,
	`d5_fasilitas_penanaman_modal` integer,
	`d6_fasilitas_bruto_vokasi` integer,
	`d8_ada_kompensasi_kerugian` integer,
	`d10_fasilitas_bruto_litbang` integer,
	`tarif_pajak` text,
	`persentase_tarif_lainnya` integer,
	`e13_ada_kredit_pajak_luar_negeri` integer,
	`e14_angsuran_pph_25_tahun_berjalan` integer DEFAULT 0,
	`e15_stp_pph_25` integer DEFAULT 0,
	`e16_fasilitas_pengurangan_pph_terutang` integer,
	`f17b_ada_sk_pengangsuran_penundaan` integer,
	`f17b_jumlah_diangsur_ditunda` integer DEFAULT 0,
	`f19a_metode_pengembalian` text,
	`g20_wajib_lapor_angsuran_pph_25` integer,
	`h21a_transaksi_hubungan_istimewa` integer,
	`h21b_dokumen_penentuan_harga_transfer` integer,
	`h21c_penanaman_modal_afiliasi` integer,
	`h21d_utang_piutang_afiliasi` integer,
	`h21e_penyusutan_amortisasi_fiskal` integer,
	`h21f_biaya_entertainment` integer,
	`h21g_fasilitas_penanaman_modal_daerah_tertentu` integer,
	`h21h_sisa_lebih_sarana_prasarana` integer,
	`h21i_dividen_luar_negeri` integer,
	`pph_kurang_lebih_bayar` integer DEFAULT 0 NOT NULL,
	`lampiran3_pengembalian_pengurangan_pph_luar_negeri_tahun_sebelumnya` integer DEFAULT 0 NOT NULL,
	`tanggal_posting` integer,
	`tanggal_dilaporkan` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`npwp`) REFERENCES `wajib_pajak`(`npwp`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`mata_uang_pembukuan_id`) REFERENCES `mata_uang_spt_pph_badan`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sektor_usaha_id`) REFERENCES `sektor_usaha_spt_pph_badan`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`opini_auditor_id`) REFERENCES `opini_auditor_spt_pph_badan`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `spt_pph_badan_period_unique` ON `spt_pph_badan` (`npwp`,`tahun_pajak`,`pembetulan_ke`);--> statement-breakpoint
CREATE TABLE `spt_pph_badan_lampiran_1_laba_rugi` (
	`id` text PRIMARY KEY NOT NULL,
	`spt_pph_badan_id` text NOT NULL,
	`akun_id` text NOT NULL,
	`nilai_komersial` integer DEFAULT 0 NOT NULL,
	`non_objek_pajak` integer DEFAULT 0 NOT NULL,
	`dikenakan_pph_final` integer DEFAULT 0 NOT NULL,
	`penyesuaian_fiskal_positif` integer DEFAULT 0 NOT NULL,
	`penyesuaian_fiskal_negatif` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`spt_pph_badan_id`) REFERENCES `spt_pph_badan`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`akun_id`) REFERENCES `spt_pph_badan_lampiran_1_akun`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `spt_pph_badan_lampiran_1_laba_rugi_spt_akun_unique` ON `spt_pph_badan_lampiran_1_laba_rugi` (`spt_pph_badan_id`,`akun_id`);--> statement-breakpoint
CREATE TABLE `spt_pph_badan_lampiran_1_laba_rugi_koreksi_fiskal` (
	`id` text PRIMARY KEY NOT NULL,
	`laba_rugi_id` text NOT NULL,
	`kode_koreksi_fiskal_id` text NOT NULL,
	FOREIGN KEY (`laba_rugi_id`) REFERENCES `spt_pph_badan_lampiran_1_laba_rugi`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`kode_koreksi_fiskal_id`) REFERENCES `kode_koreksi_fiskal_spt_pph_badan`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `spt_pph_badan_lampiran_1_laba_rugi_koreksi_fiskal_unique` ON `spt_pph_badan_lampiran_1_laba_rugi_koreksi_fiskal` (`laba_rugi_id`,`kode_koreksi_fiskal_id`);--> statement-breakpoint
CREATE TABLE `spt_pph_badan_lampiran_1_neraca` (
	`id` text PRIMARY KEY NOT NULL,
	`spt_pph_badan_id` text NOT NULL,
	`akun_id` text NOT NULL,
	`nilai` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`spt_pph_badan_id`) REFERENCES `spt_pph_badan`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`akun_id`) REFERENCES `spt_pph_badan_lampiran_1_neraca_akun`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `spt_pph_badan_lampiran_1_neraca_spt_akun_unique` ON `spt_pph_badan_lampiran_1_neraca` (`spt_pph_badan_id`,`akun_id`);--> statement-breakpoint
CREATE TABLE `spt_pph_badan_lampiran_2_afiliasi` (
	`id` text PRIMARY KEY NOT NULL,
	`spt_pph_badan_id` text NOT NULL,
	`nomor_urut` integer NOT NULL,
	`nama_pihak_afiliasi` text NOT NULL,
	`negara_id` text,
	`npwp_tin` text DEFAULT '' NOT NULL,
	`penyertaan_modal_nilai` integer DEFAULT 0 NOT NULL,
	`penyertaan_modal_persentase` integer DEFAULT 0 NOT NULL,
	`utang_nilai` integer DEFAULT 0 NOT NULL,
	`utang_tahun` integer,
	`utang_bunga_persentase` integer DEFAULT 0 NOT NULL,
	`piutang_nilai` integer DEFAULT 0 NOT NULL,
	`piutang_tahun` integer,
	`piutang_bunga_persentase` integer DEFAULT 0 NOT NULL,
	`keterangan` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`spt_pph_badan_id`) REFERENCES `spt_pph_badan`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`negara_id`) REFERENCES `negara_spt_pph_badan`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `spt_pph_badan_lampiran_2_pihak` (
	`id` text PRIMARY KEY NOT NULL,
	`spt_pph_badan_id` text NOT NULL,
	`jenis` text NOT NULL,
	`nomor_urut` integer NOT NULL,
	`nama` text NOT NULL,
	`alamat` text DEFAULT '' NOT NULL,
	`negara_id` text,
	`npwp_nik_tin` text DEFAULT '' NOT NULL,
	`jabatan` text DEFAULT '' NOT NULL,
	`modal_saham_nominal` integer DEFAULT 0 NOT NULL,
	`modal_saham_persentase` integer DEFAULT 0 NOT NULL,
	`dividen_diterima` integer DEFAULT 0 NOT NULL,
	`keterangan` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`spt_pph_badan_id`) REFERENCES `spt_pph_badan`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`negara_id`) REFERENCES `negara_spt_pph_badan`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `spt_pph_badan_lampiran_3_penghasilan_luar_negeri` (
	`id` text PRIMARY KEY NOT NULL,
	`spt_pph_badan_id` text NOT NULL,
	`nomor_urut` integer NOT NULL,
	`nama_pemberi_penghasilan` text NOT NULL,
	`negara_id` text NOT NULL,
	`tanggal` text NOT NULL,
	`jenis_penghasilan_id` text NOT NULL,
	`penghasilan_neto` integer DEFAULT 0 NOT NULL,
	`pph_luar_negeri` integer DEFAULT 0 NOT NULL,
	`mata_uang_id` text,
	`pph_luar_negeri_mata_uang_asing` integer DEFAULT 0 NOT NULL,
	`kredit_pajak_yang_dapat_dikreditkan` integer DEFAULT 0 NOT NULL,
	`keterangan` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`spt_pph_badan_id`) REFERENCES `spt_pph_badan`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`negara_id`) REFERENCES `negara_spt_pph_badan`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`jenis_penghasilan_id`) REFERENCES `jenis_penghasilan_kredit_pajak_luar_negeri_spt_pph_badan`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`mata_uang_id`) REFERENCES `mata_uang_spt_pph_badan`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `spt_pph_badan_lampiran_3_pph_dipotong` (
	`id` text PRIMARY KEY NOT NULL,
	`spt_pph_badan_id` text NOT NULL,
	`nomor_urut` integer NOT NULL,
	`nama_pemotong_pemungut` text NOT NULL,
	`npwp_pemotong_pemungut` text DEFAULT '' NOT NULL,
	`jenis_pajak_id` text NOT NULL,
	`dpp` integer DEFAULT 0 NOT NULL,
	`pph` integer DEFAULT 0 NOT NULL,
	`nomor_bukti` text DEFAULT '' NOT NULL,
	`tanggal_bukti` text DEFAULT '' NOT NULL,
	`keterangan` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`spt_pph_badan_id`) REFERENCES `spt_pph_badan`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`jenis_pajak_id`) REFERENCES `jenis_pajak_dipotong_dipungut_spt_pph_badan`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `spt_pph_badan_lampiran_4_bukan_objek_pajak` (
	`id` text PRIMARY KEY NOT NULL,
	`spt_pph_badan_id` text NOT NULL,
	`nomor_urut` integer NOT NULL,
	`jenis_penghasilan_id` text NOT NULL,
	`sumber_penghasilan` text DEFAULT '' NOT NULL,
	`penghasilan_bruto` integer DEFAULT 0 NOT NULL,
	`keterangan` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`spt_pph_badan_id`) REFERENCES `spt_pph_badan`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`jenis_penghasilan_id`) REFERENCES `jenis_penghasilan_bukan_objek_pajak_spt_pph_badan`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `spt_pph_badan_lampiran_4_pph_final` (
	`id` text PRIMARY KEY NOT NULL,
	`spt_pph_badan_id` text NOT NULL,
	`nomor_urut` integer NOT NULL,
	`npwp_pemotong_pemungut_penyetor` text DEFAULT '' NOT NULL,
	`nama_pemotong_pemungut_penyetor` text DEFAULT '' NOT NULL,
	`objek_pajak_id` text NOT NULL,
	`dasar_pengenaan_pajak` integer DEFAULT 0 NOT NULL,
	`tarif` integer DEFAULT 0 NOT NULL,
	`pph_final_terutang` integer DEFAULT 0 NOT NULL,
	`nomor_bukti_potong` text DEFAULT '' NOT NULL,
	`tanggal_bukti_potong` text,
	`keterangan` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`spt_pph_badan_id`) REFERENCES `spt_pph_badan`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`objek_pajak_id`) REFERENCES `objek_pajak_spt_pph_badan`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `spt_pph_badan_lampiran_5_pp23_bulanan` (
	`id` text PRIMARY KEY NOT NULL,
	`tku_id` text NOT NULL,
	`bulan` integer NOT NULL,
	`jumlah_peredaran_bruto` integer DEFAULT 0 NOT NULL,
	`jumlah_pph_final_terutang` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`tku_id`) REFERENCES `spt_pph_badan_lampiran_5_tku`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `spt_pph_badan_lampiran_5_pp23_bulanan_unique` ON `spt_pph_badan_lampiran_5_pp23_bulanan` (`tku_id`,`bulan`);--> statement-breakpoint
CREATE TABLE `spt_pph_badan_lampiran_5_pp23_dipotong_bulanan` (
	`id` text PRIMARY KEY NOT NULL,
	`spt_pph_badan_id` text NOT NULL,
	`bulan` integer NOT NULL,
	`nilai` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`spt_pph_badan_id`) REFERENCES `spt_pph_badan`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `spt_pph_badan_lampiran_5_pp23_dipotong_bulanan_unique` ON `spt_pph_badan_lampiran_5_pp23_dipotong_bulanan` (`spt_pph_badan_id`,`bulan`);--> statement-breakpoint
CREATE TABLE `spt_pph_badan_lampiran_5_tku` (
	`id` text PRIMARY KEY NOT NULL,
	`spt_pph_badan_id` text NOT NULL,
	`nitku` text NOT NULL,
	`nama` text NOT NULL,
	`alamat` text DEFAULT '' NOT NULL,
	`kelurahan` text DEFAULT '' NOT NULL,
	`kecamatan` text DEFAULT '' NOT NULL,
	`kabupaten` text DEFAULT '' NOT NULL,
	`provinsi` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`spt_pph_badan_id`) REFERENCES `spt_pph_badan`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `spt_pph_badan_lampiran_6_komponen` (
	`id` text PRIMARY KEY NOT NULL,
	`spt_pph_badan_id` text NOT NULL,
	`kode` text NOT NULL,
	`nama` text NOT NULL,
	`nilai` integer DEFAULT 0 NOT NULL,
	`keterangan` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`spt_pph_badan_id`) REFERENCES `spt_pph_badan`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `spt_pph_badan_lampiran_6_komponen_unique` ON `spt_pph_badan_lampiran_6_komponen` (`spt_pph_badan_id`,`kode`);--> statement-breakpoint
CREATE TABLE `spt_pph_badan_lampiran_7_kompensasi_kerugian` (
	`id` text PRIMARY KEY NOT NULL,
	`spt_pph_badan_id` text NOT NULL,
	`tahun_pajak` integer NOT NULL,
	`laba_rugi_neto_fiskal` integer DEFAULT 0 NOT NULL,
	`kompensasi_y_min_4` integer DEFAULT 0 NOT NULL,
	`kompensasi_y_min_3` integer DEFAULT 0 NOT NULL,
	`kompensasi_y_min_2` integer DEFAULT 0 NOT NULL,
	`kompensasi_y_min_1` integer DEFAULT 0 NOT NULL,
	`kompensasi_tahun_ini` integer DEFAULT 0 NOT NULL,
	`kompensasi_y_plus_1` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`spt_pph_badan_id`) REFERENCES `spt_pph_badan`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `spt_pph_badan_lampiran_7_kompensasi_kerugian_unique` ON `spt_pph_badan_lampiran_7_kompensasi_kerugian` (`spt_pph_badan_id`,`tahun_pajak`);--> statement-breakpoint
CREATE TABLE `spt_pph_badan_lampiran_8_fasilitas_31e` (
	`id` text PRIMARY KEY NOT NULL,
	`spt_pph_badan_id` text NOT NULL,
	`jumlah_peredaran_bruto` integer DEFAULT 0 NOT NULL,
	`penghasilan_kena_pajak` integer DEFAULT 0 NOT NULL,
	`penghasilan_kena_pajak_mendapat_fasilitas` integer DEFAULT 0 NOT NULL,
	`penghasilan_kena_pajak_tidak_mendapat_fasilitas` integer DEFAULT 0 NOT NULL,
	`pph_terutang_mendapat_fasilitas` integer DEFAULT 0 NOT NULL,
	`pph_terutang_tidak_mendapat_fasilitas` integer DEFAULT 0 NOT NULL,
	`pph_terutang_jumlah` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`spt_pph_badan_id`) REFERENCES `spt_pph_badan`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `spt_pph_badan_lampiran_8_spt_unique` ON `spt_pph_badan_lampiran_8_fasilitas_31e` (`spt_pph_badan_id`);--> statement-breakpoint
CREATE TABLE `spt_pph_badan_lampiran_9_harta` (
	`id` text PRIMARY KEY NOT NULL,
	`spt_pph_badan_id` text NOT NULL,
	`nomor_urut` integer NOT NULL,
	`jenis_harta_id` text NOT NULL,
	`kelompok_penyusutan` text NOT NULL,
	`kode_harta` text NOT NULL,
	`bulan_tahun_perolehan` text NOT NULL,
	`harga_perolehan` integer DEFAULT 0 NOT NULL,
	`nilai_sisa_buku_fiskal_awal_tahun` integer DEFAULT 0 NOT NULL,
	`metode_penyusutan_komersial` text DEFAULT '' NOT NULL,
	`metode_penyusutan_fiskal` text DEFAULT '' NOT NULL,
	`penyusutan_amortisasi_fiskal_tahun_ini` integer DEFAULT 0 NOT NULL,
	`penyusutan_amortisasi_komersial_tahun_ini` integer DEFAULT 0 NOT NULL,
	`akumulasi_penyusutan_amortisasi_fiskal` integer DEFAULT 0 NOT NULL,
	`nilai_sisa_buku_fiskal_akhir_tahun` integer DEFAULT 0 NOT NULL,
	`keterangan` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`spt_pph_badan_id`) REFERENCES `spt_pph_badan`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`jenis_harta_id`) REFERENCES `jenis_harta_spt_pph_badan`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `spt_pph_badan_lampiran_9_ringkasan_komersial` (
	`id` text PRIMARY KEY NOT NULL,
	`spt_pph_badan_id` text NOT NULL,
	`jumlah_penyusutan_komersial_a` integer DEFAULT 0 NOT NULL,
	`jumlah_penyusutan_komersial_b` integer DEFAULT 0 NOT NULL,
	`jumlah_amortisasi_komersial_c` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`spt_pph_badan_id`) REFERENCES `spt_pph_badan`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `spt_pph_badan_lampiran_9_ringkasan_komersial_spt_unique` ON `spt_pph_badan_lampiran_9_ringkasan_komersial` (`spt_pph_badan_id`);--> statement-breakpoint
CREATE TABLE `spt_pph_badan_lampiran_10a_transaksi` (
	`id` text PRIMARY KEY NOT NULL,
	`spt_pph_badan_id` text NOT NULL,
	`nomor_urut` integer NOT NULL,
	`nama` text NOT NULL,
	`npwp_tin` text DEFAULT '' NOT NULL,
	`negara_id` text,
	`bentuk_hubungan_id` text NOT NULL,
	`kegiatan_usaha` text DEFAULT '' NOT NULL,
	`jenis_transaksi_id` text NOT NULL,
	`nilai_transaksi` integer DEFAULT 0 NOT NULL,
	`metode_penentuan_harga_transfer_id` text NOT NULL,
	`alasan_penggunaan_metode` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`spt_pph_badan_id`) REFERENCES `spt_pph_badan`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`negara_id`) REFERENCES `negara_spt_pph_badan`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`bentuk_hubungan_id`) REFERENCES `bentuk_hubungan_istimewa_spt_pph_badan`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`jenis_transaksi_id`) REFERENCES `jenis_transaksi_hubungan_istimewa_spt_pph_badan`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`metode_penentuan_harga_transfer_id`) REFERENCES `metode_penentuan_harga_transfer_spt_pph_badan`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `spt_pph_badan_lampiran_10b_pernyataan` (
	`id` text PRIMARY KEY NOT NULL,
	`spt_pph_badan_id` text NOT NULL,
	`hubungan_a` integer,
	`hubungan_b` integer,
	`hubungan_c` integer,
	`hubungan_d` integer,
	`transaksi_a` integer,
	`transaksi_b` integer,
	`transaksi_c` integer,
	`dokumentasi_a` integer,
	`dokumentasi_b` integer,
	`dokumentasi_c` integer,
	`dokumentasi_d` integer,
	`dokumentasi_e` integer,
	`dokumen_a` integer,
	`dokumen_b` integer,
	`dokumen_c` integer,
	FOREIGN KEY (`spt_pph_badan_id`) REFERENCES `spt_pph_badan`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `spt_pph_badan_lampiran_10b_pernyataan_spt_unique` ON `spt_pph_badan_lampiran_10b_pernyataan` (`spt_pph_badan_id`);--> statement-breakpoint
CREATE TABLE `spt_pph_badan_lampiran_10c_pernyataan` (
	`id` text PRIMARY KEY NOT NULL,
	`spt_pph_badan_id` text NOT NULL,
	`ditentukan_prinsip` integer,
	FOREIGN KEY (`spt_pph_badan_id`) REFERENCES `spt_pph_badan`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `spt_pph_badan_lampiran_10c_pernyataan_spt_unique` ON `spt_pph_badan_lampiran_10c_pernyataan` (`spt_pph_badan_id`);--> statement-breakpoint
CREATE TABLE `spt_pph_badan_lampiran_10c_transaksi` (
	`id` text PRIMARY KEY NOT NULL,
	`spt_pph_badan_id` text NOT NULL,
	`nomor_urut` integer NOT NULL,
	`nama_mitra_transaksi` text NOT NULL,
	`jenis_transaksi_id` text NOT NULL,
	`negara_id` text NOT NULL,
	`nilai_transaksi` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`spt_pph_badan_id`) REFERENCES `spt_pph_badan`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`jenis_transaksi_id`) REFERENCES `jenis_transaksi_hubungan_istimewa_spt_pph_badan`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`negara_id`) REFERENCES `negara_spt_pph_badan`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `spt_pph_badan_lampiran_10d_dokumen` (
	`id` text PRIMARY KEY NOT NULL,
	`spt_pph_badan_id` text NOT NULL,
	`dokumen_induk_a` integer,
	`dokumen_induk_b` integer,
	`dokumen_induk_c` integer,
	`dokumen_induk_d` integer,
	`dokumen_induk_e` integer,
	`dokumen_lokal_a` integer,
	`dokumen_lokal_b` integer,
	`dokumen_lokal_c` integer,
	`dokumen_lokal_d` integer,
	`dokumen_lokal_e` integer,
	`tanggal_dokumen_induk_tersedia` text,
	`tanggal_dokumen_lokal_tersedia` text,
	FOREIGN KEY (`spt_pph_badan_id`) REFERENCES `spt_pph_badan`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `spt_pph_badan_lampiran_10d_dokumen_spt_unique` ON `spt_pph_badan_lampiran_10d_dokumen` (`spt_pph_badan_id`);--> statement-breakpoint
CREATE TABLE `spt_pph_badan_lampiran_11b_biaya_pinjaman` (
	`id` text PRIMARY KEY NOT NULL,
	`spt_pph_badan_id` text NOT NULL,
	`metode` text NOT NULL,
	`laba_rugi_sebelum_pajak` integer DEFAULT 0 NOT NULL,
	`biaya_pinjaman` integer DEFAULT 0 NOT NULL,
	`penyusutan_amortisasi` integer DEFAULT 0 NOT NULL,
	`ebitda` integer DEFAULT 0 NOT NULL,
	`batas_biaya_pinjaman` integer DEFAULT 0 NOT NULL,
	`biaya_pinjaman_yang_dapat_dibebankan` integer DEFAULT 0 NOT NULL,
	`rata_rata_utang` integer DEFAULT 0 NOT NULL,
	`rata_rata_modal` integer DEFAULT 0 NOT NULL,
	`rasio_der` integer DEFAULT 0 NOT NULL,
	`batas_maksimal_der` integer DEFAULT 0 NOT NULL,
	`koreksi_fiskal_positif` integer DEFAULT 0 NOT NULL,
	`keterangan` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`spt_pph_badan_id`) REFERENCES `spt_pph_badan`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `spt_pph_badan_lampiran_11b_spt_unique` ON `spt_pph_badan_lampiran_11b_biaya_pinjaman` (`spt_pph_badan_id`);--> statement-breakpoint
CREATE TABLE `spt_pph_badan_lampiran_13b_a_kerjasama` (
	`id` text PRIMARY KEY NOT NULL,
	`spt_pph_badan_id` text NOT NULL,
	`nomor_urut` integer NOT NULL,
	`perjanjian_nomor` text DEFAULT '' NOT NULL,
	`perjanjian_tanggal` text DEFAULT '' NOT NULL,
	`mitra_kegiatan` text DEFAULT '' NOT NULL,
	`keterangan` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`spt_pph_badan_id`) REFERENCES `spt_pph_badan`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `spt_pph_badan_lampiran_13b_b_biaya` (
	`id` text PRIMARY KEY NOT NULL,
	`spt_pph_badan_id` text NOT NULL,
	`kode` text NOT NULL,
	`nama` text NOT NULL,
	`nilai` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`spt_pph_badan_id`) REFERENCES `spt_pph_badan`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `spt_pph_badan_lampiran_13b_b_biaya_unique` ON `spt_pph_badan_lampiran_13b_b_biaya` (`spt_pph_badan_id`,`kode`);--> statement-breakpoint
CREATE TABLE `spt_pph_badan_lampiran_13b_c_litbang` (
	`id` text PRIMARY KEY NOT NULL,
	`spt_pph_badan_id` text NOT NULL,
	`nomor_urut` integer NOT NULL,
	`nomor_proposal` text DEFAULT '' NOT NULL,
	`jangka_waktu_dari_tahun` integer,
	`jangka_waktu_sampai_tahun` integer,
	`jumlah_biaya` integer DEFAULT 0 NOT NULL,
	`tahun_perolehan_hki` integer,
	`persentase_fasilitas_pajak` integer DEFAULT 0 NOT NULL,
	`tambahan_pengurang` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`spt_pph_badan_id`) REFERENCES `spt_pph_badan`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `spt_pph_badan_lampiran_13b_d_penghitungan` (
	`id` text PRIMARY KEY NOT NULL,
	`spt_pph_badan_id` text NOT NULL,
	`termanfaatkan_tahun_sebelumnya` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`spt_pph_badan_id`) REFERENCES `spt_pph_badan`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `spt_pph_badan_lampiran_13b_d_penghitungan_spt_unique` ON `spt_pph_badan_lampiran_13b_d_penghitungan` (`spt_pph_badan_id`);