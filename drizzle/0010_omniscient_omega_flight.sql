CREATE TABLE `spt_pph_orang_pribadi_lampiran_4` (
	`id` text PRIMARY KEY NOT NULL,
	`spt_pph_orang_pribadi_id` text NOT NULL,
	`penghasilan_neto` integer DEFAULT 0 NOT NULL,
	`kompensasi_kerugian` integer DEFAULT 0 NOT NULL,
	`zakat_sumbangan` integer DEFAULT 0 NOT NULL,
	`jumlah_penghasilan_neto` integer DEFAULT 0 NOT NULL,
	`ptkp_status` text,
	`penghasilan_kena_pajak` integer DEFAULT 0 NOT NULL,
	`pajak_terutang` integer DEFAULT 0 NOT NULL,
	`pengurang_pph_terutang` integer DEFAULT 0 NOT NULL,
	`kredit_pajak` integer DEFAULT 0 NOT NULL,
	`pph_yang_harus_dibayar` integer DEFAULT 0 NOT NULL,
	`angsuran_pph_25` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`spt_pph_orang_pribadi_id`) REFERENCES `spt_pph_orang_pribadi`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `spt_pph_orang_pribadi_lampiran_4_spt_pph_orang_pribadi_id_unique` ON `spt_pph_orang_pribadi_lampiran_4` (`spt_pph_orang_pribadi_id`);