CREATE TABLE `retur_faktur_pajak_masukan` (
	`id` text PRIMARY KEY NOT NULL,
	`faktur_pajak_id` text NOT NULL,
	`nomor_retur` text,
	`tanggal_retur` text NOT NULL,
	`masa_pajak` integer NOT NULL,
	`tahun` integer NOT NULL,
	`status` text DEFAULT 'konsep' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`faktur_pajak_id`) REFERENCES `faktur_pajak`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `retur_faktur_pajak_masukan_faktur_idx` ON `retur_faktur_pajak_masukan` (`faktur_pajak_id`);--> statement-breakpoint
CREATE INDEX `retur_faktur_pajak_masukan_period_idx` ON `retur_faktur_pajak_masukan` (`masa_pajak`,`tahun`);--> statement-breakpoint
CREATE INDEX `retur_faktur_pajak_masukan_status_idx` ON `retur_faktur_pajak_masukan` (`status`);--> statement-breakpoint
CREATE TABLE `retur_faktur_pajak_masukan_detail` (
	`id` text PRIMARY KEY NOT NULL,
	`retur_faktur_pajak_masukan_id` text NOT NULL,
	`transaksi_faktur_pajak_id` text NOT NULL,
	`jumlah_diretur` integer NOT NULL,
	`potongan_diretur` integer DEFAULT 0 NOT NULL,
	`dpp_diretur` integer NOT NULL,
	`dpp_nilai_lain_diretur` integer DEFAULT 0 NOT NULL,
	`gunakan_dpp_nilai_lain` integer DEFAULT false NOT NULL,
	`ppn_diretur` integer NOT NULL,
	`ppnbm_diretur` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`retur_faktur_pajak_masukan_id`) REFERENCES `retur_faktur_pajak_masukan`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`transaksi_faktur_pajak_id`) REFERENCES `transaksi_faktur_pajak`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `retur_faktur_pajak_masukan_detail_line_unique` ON `retur_faktur_pajak_masukan_detail` (`retur_faktur_pajak_masukan_id`,`transaksi_faktur_pajak_id`);--> statement-breakpoint
DROP INDEX `spt_ppn_period_unique`;--> statement-breakpoint
ALTER TABLE `faktur_pajak` ADD `nilai_uang_muka` integer DEFAULT 0 NOT NULL;