CREATE TABLE `spt_pph_orang_pribadi_lampiran_3a_akun` (
	`id` text PRIMARY KEY NOT NULL,
	`sektor` text NOT NULL,
	`nomor_urut` integer NOT NULL,
	`kode` text,
	`nama_akun` text NOT NULL,
	`row_type` text NOT NULL,
	`classification` text,
	`parent_kode` text,
	`sign` integer
);
--> statement-breakpoint
CREATE INDEX `spt_pph_orang_pribadi_lampiran_3a_akun_sektor_kode_idx` ON `spt_pph_orang_pribadi_lampiran_3a_akun` (`sektor`,`kode`);--> statement-breakpoint
CREATE TABLE `spt_pph_orang_pribadi_kode_koreksi_fiskal` (
	`id` text PRIMARY KEY NOT NULL,
	`kode` text NOT NULL,
	`nama` text NOT NULL,
	`jenis` text NOT NULL,
	`aktif` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `spt_pph_orang_pribadi_kode_koreksi_fiskal_kode_unique` ON `spt_pph_orang_pribadi_kode_koreksi_fiskal` (`kode`);--> statement-breakpoint
CREATE TABLE `spt_pph_orang_pribadi_lampiran_3a_koreksi_fiskal` (
	`id` text PRIMARY KEY NOT NULL,
	`laba_rugi_id` text NOT NULL,
	`kode_koreksi_fiskal_id` text NOT NULL,
	FOREIGN KEY (`laba_rugi_id`) REFERENCES `spt_pph_orang_pribadi_lampiran_3a_laba_rugi`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`kode_koreksi_fiskal_id`) REFERENCES `spt_pph_orang_pribadi_kode_koreksi_fiskal`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `spt_pph_orang_pribadi_lampiran_3a_koreksi_fiskal_unique` ON `spt_pph_orang_pribadi_lampiran_3a_koreksi_fiskal` (`laba_rugi_id`,`kode_koreksi_fiskal_id`);--> statement-breakpoint
CREATE TABLE `spt_pph_orang_pribadi_lampiran_3a_laba_rugi` (
	`id` text PRIMARY KEY NOT NULL,
	`spt_pph_orang_pribadi_id` text NOT NULL,
	`akun_id` text NOT NULL,
	`nilai_komersial` integer DEFAULT 0 NOT NULL,
	`non_objek_pajak` integer DEFAULT 0 NOT NULL,
	`dikenakan_pph_final` integer DEFAULT 0 NOT NULL,
	`penyesuaian_fiskal_positif` integer DEFAULT 0 NOT NULL,
	`penyesuaian_fiskal_negatif` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`spt_pph_orang_pribadi_id`) REFERENCES `spt_pph_orang_pribadi`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`akun_id`) REFERENCES `spt_pph_orang_pribadi_lampiran_3a_akun`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `spt_pph_orang_pribadi_lampiran_3a_laba_rugi_spt_akun_unique` ON `spt_pph_orang_pribadi_lampiran_3a_laba_rugi` (`spt_pph_orang_pribadi_id`,`akun_id`);--> statement-breakpoint
ALTER TABLE `spt_pph_orang_pribadi` ADD `b1b4_sektor` text;