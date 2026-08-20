CREATE TABLE `spt_pph_orang_pribadi_lampiran_3a_neraca_akun` (
	`id` text PRIMARY KEY NOT NULL,
	`sektor` text NOT NULL,
	`nomor_urut` integer NOT NULL,
	`kode` text,
	`nama_akun` text NOT NULL,
	`row_type` text NOT NULL,
	`section` text NOT NULL,
	`parent_kode` text,
	`sign` integer
);
--> statement-breakpoint
CREATE INDEX `spt_pph_orang_pribadi_lampiran_3a_neraca_akun_sektor_kode_idx` ON `spt_pph_orang_pribadi_lampiran_3a_neraca_akun` (`sektor`,`kode`);--> statement-breakpoint
CREATE TABLE `spt_pph_orang_pribadi_lampiran_3a_neraca` (
	`id` text PRIMARY KEY NOT NULL,
	`spt_pph_orang_pribadi_id` text NOT NULL,
	`akun_id` text NOT NULL,
	`nilai` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`spt_pph_orang_pribadi_id`) REFERENCES `spt_pph_orang_pribadi`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`akun_id`) REFERENCES `spt_pph_orang_pribadi_lampiran_3a_neraca_akun`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `spt_pph_orang_pribadi_lampiran_3a_neraca_spt_akun_unique` ON `spt_pph_orang_pribadi_lampiran_3a_neraca` (`spt_pph_orang_pribadi_id`,`akun_id`);--> statement-breakpoint
ALTER TABLE `spt_pph_orang_pribadi` ADD `l3a_laporan_keuangan` text;--> statement-breakpoint
ALTER TABLE `spt_pph_orang_pribadi` ADD `l3a_npwp_konsultan_pajak` text;--> statement-breakpoint
ALTER TABLE `spt_pph_orang_pribadi` ADD `l3a_nama_konsultan_pajak` text;--> statement-breakpoint
ALTER TABLE `spt_pph_orang_pribadi` ADD `l3a_npwp_kantor_akuntan_publik` text;--> statement-breakpoint
ALTER TABLE `spt_pph_orang_pribadi` ADD `l3a_nama_kantor_akuntan_publik` text;