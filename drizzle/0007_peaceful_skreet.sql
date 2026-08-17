CREATE TABLE `spt_pph_orang_pribadi_lampiran_3a4_lainnya` (
	`id` text PRIMARY KEY NOT NULL,
	`spt_pph_orang_pribadi_id` text NOT NULL,
	`nomor_urut` integer NOT NULL,
	`kode` text DEFAULT '' NOT NULL,
	`jenis_penghasilan` text DEFAULT '' NOT NULL,
	`penghasilan_neto` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`spt_pph_orang_pribadi_id`) REFERENCES `spt_pph_orang_pribadi`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `spt_pph_orang_pribadi_lampiran_5_kompensasi_kerugian` (
	`id` text PRIMARY KEY NOT NULL,
	`spt_pph_orang_pribadi_id` text NOT NULL,
	`tahun_pajak` integer NOT NULL,
	`laba_rugi_neto_fiskal` integer DEFAULT 0 NOT NULL,
	`kompensasi_y_min_4` integer DEFAULT 0 NOT NULL,
	`kompensasi_y_min_3` integer DEFAULT 0 NOT NULL,
	`kompensasi_y_min_2` integer DEFAULT 0 NOT NULL,
	`kompensasi_y_min_1` integer DEFAULT 0 NOT NULL,
	`kompensasi_tahun_ini` integer DEFAULT 0 NOT NULL,
	`kompensasi_y_plus_1` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`spt_pph_orang_pribadi_id`) REFERENCES `spt_pph_orang_pribadi`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `spt_pph_orang_pribadi_lampiran_5_kompensasi_unique` ON `spt_pph_orang_pribadi_lampiran_5_kompensasi_kerugian` (`spt_pph_orang_pribadi_id`,`tahun_pajak`);--> statement-breakpoint
CREATE TABLE `spt_pph_orang_pribadi_lampiran_5_pengurang_neto` (
	`id` text PRIMARY KEY NOT NULL,
	`spt_pph_orang_pribadi_id` text NOT NULL,
	`nomor_urut` integer NOT NULL,
	`kode` text DEFAULT '' NOT NULL,
	`jenis_pengurang` text DEFAULT '' NOT NULL,
	`jumlah` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`spt_pph_orang_pribadi_id`) REFERENCES `spt_pph_orang_pribadi`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `spt_pph_orang_pribadi_lampiran_5_pengurang_pph` (
	`id` text PRIMARY KEY NOT NULL,
	`spt_pph_orang_pribadi_id` text NOT NULL,
	`nomor_urut` integer NOT NULL,
	`kode` text DEFAULT '' NOT NULL,
	`jenis_pengurang` text DEFAULT '' NOT NULL,
	`jumlah` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`spt_pph_orang_pribadi_id`) REFERENCES `spt_pph_orang_pribadi`(`id`) ON UPDATE no action ON DELETE cascade
);
