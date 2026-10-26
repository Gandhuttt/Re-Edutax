ALTER TABLE `bukti_potong_mp` ADD `nomor_paspor` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `bukti_potong_mp` ADD `tanggal_pemotongan` text;--> statement-breakpoint
ALTER TABLE `bukti_potong_mp` ADD `nitku_pemotong` text;--> statement-breakpoint
ALTER TABLE `bukti_potong_mp` ADD `pembetulan_dari_id` text REFERENCES bukti_potong_mp(id) ON DELETE set null;--> statement-breakpoint
ALTER TABLE `bukti_potong_mp` ADD `pembetulan_ke` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX `bukti_potong_mp_pembetulan_dari_idx` ON `bukti_potong_mp` (`pembetulan_dari_id`);--> statement-breakpoint
CREATE INDEX `bukti_potong_mp_owner_idx` ON `bukti_potong_mp` (`npwp_pemotong`,`tahun`,`masa_pajak`);