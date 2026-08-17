CREATE TABLE `spt_pph_orang_pribadi_lampiran_3b_bulanan` (
	`id` text PRIMARY KEY NOT NULL,
	`spt_pph_orang_pribadi_id` text NOT NULL,
	`seksi` text NOT NULL,
	`bulan` integer NOT NULL,
	`peredaran_bruto` integer DEFAULT 0 NOT NULL,
	`disetor_sendiri` integer DEFAULT 0 NOT NULL,
	`dipotong_pihak_lain` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`spt_pph_orang_pribadi_id`) REFERENCES `spt_pph_orang_pribadi`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `spt_pph_orang_pribadi_lampiran_3b_bulanan_unique` ON `spt_pph_orang_pribadi_lampiran_3b_bulanan` (`spt_pph_orang_pribadi_id`,`seksi`,`bulan`);--> statement-breakpoint
CREATE TABLE `spt_pph_orang_pribadi_lampiran_3b_tku` (
	`id` text PRIMARY KEY NOT NULL,
	`spt_pph_orang_pribadi_id` text NOT NULL,
	`nama` text DEFAULT '' NOT NULL,
	`alamat` text DEFAULT '' NOT NULL,
	`kelurahan` text DEFAULT '' NOT NULL,
	`kecamatan` text DEFAULT '' NOT NULL,
	`kabupaten` text DEFAULT '' NOT NULL,
	`provinsi` text DEFAULT '' NOT NULL,
	`jenis_usaha_pekerjaan_bebas` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`spt_pph_orang_pribadi_id`) REFERENCES `spt_pph_orang_pribadi`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `spt_pph_orang_pribadi_lampiran_3b_tku_spt_pph_orang_pribadi_id_unique` ON `spt_pph_orang_pribadi_lampiran_3b_tku` (`spt_pph_orang_pribadi_id`);