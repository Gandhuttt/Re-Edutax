CREATE TABLE `spt_pph_unifikasi` (
	`id` text PRIMARY KEY NOT NULL,
	`npwp_pemotong` text NOT NULL,
	`nama_pemotong` text NOT NULL,
	`masa_pajak` integer NOT NULL,
	`tahun` integer NOT NULL,
	`chain_id` text NOT NULL,
	`pembetulan_ke` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'konsep' NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`snapshot` text NOT NULL,
	`source_signature` text NOT NULL,
	`pernyataan` integer DEFAULT false NOT NULL,
	`pembayaran` text NOT NULL,
	`created_at` integer NOT NULL,
	`tanggal_diperbarui` integer,
	`tanggal_dilaporkan` integer,
	FOREIGN KEY (`npwp_pemotong`) REFERENCES `wajib_pajak`(`npwp`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `spt_unifikasi_owner_idx` ON `spt_pph_unifikasi` (`npwp_pemotong`,`tahun`,`masa_pajak`);--> statement-breakpoint
CREATE UNIQUE INDEX `spt_unifikasi_chain_revision_idx` ON `spt_pph_unifikasi` (`chain_id`,`pembetulan_ke`);--> statement-breakpoint
CREATE UNIQUE INDEX `spt_unifikasi_period_idx` ON `spt_pph_unifikasi` (`npwp_pemotong`,`tahun`,`masa_pajak`,`pembetulan_ke`);