ALTER TABLE `bukti_potong_bpa1` ADD `pembetulan_dari_id` text REFERENCES bukti_potong_bpa1(id) ON DELETE set null;--> statement-breakpoint
ALTER TABLE `bukti_potong_bpa1` ADD `pembetulan_ke` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX `bukti_potong_bpa1_pembetulan_dari_idx` ON `bukti_potong_bpa1` (`pembetulan_dari_id`);--> statement-breakpoint
ALTER TABLE `bukti_potong_bpa2` ADD `pembetulan_dari_id` text REFERENCES bukti_potong_bpa2(id) ON DELETE set null;--> statement-breakpoint
ALTER TABLE `bukti_potong_bpa2` ADD `pembetulan_ke` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX `bukti_potong_bpa2_pembetulan_dari_idx` ON `bukti_potong_bpa2` (`pembetulan_dari_id`);