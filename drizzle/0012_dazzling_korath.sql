ALTER TABLE `spt_pph_orang_pribadi_lampiran_4` ADD `bruto_wp` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `spt_pph_orang_pribadi_lampiran_4` ADD `bruto_suami_istri` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `spt_pph_orang_pribadi_lampiran_4` ADD `neto_suami_istri` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `spt_pph_orang_pribadi_lampiran_4` ADD `setelah_dikurangi_suami_istri` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `spt_pph_orang_pribadi_lampiran_4` ADD `ptkp_gabungan_status` text;--> statement-breakpoint
ALTER TABLE `spt_pph_orang_pribadi_lampiran_4` ADD `nama_suami_istri` text;