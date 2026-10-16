CREATE TABLE `pendaftaran` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`nama` text NOT NULL,
	`tahun_lahir` integer NOT NULL,
	`telepon` text NOT NULL,
	`pendidikan` text NOT NULL,
	`bidang_keilmuan` text DEFAULT '' NOT NULL,
	`pekerjaan` text NOT NULL,
	`bidang_usaha` text DEFAULT '' NOT NULL,
	`alamat` text NOT NULL,
	`kota` text NOT NULL,
	`provinsi` text NOT NULL,
	`kelas_kode` text NOT NULL,
	`batch_id` text NOT NULL,
	`npwp` text NOT NULL,
	`status` text DEFAULT 'diproses' NOT NULL,
	`proses_error` text,
	`folder_berkas_url` text NOT NULL,
	`sheets_synced_at` integer,
	`sheets_error` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`batch_id`) REFERENCES `batch_peserta`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pendaftaran_email_unique` ON `pendaftaran` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `pendaftaran_npwp_unique` ON `pendaftaran` (`npwp`);--> statement-breakpoint
CREATE TABLE `pendaftaran_kelas` (
	`kode` text PRIMARY KEY NOT NULL,
	`batch_id` text NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`batch_id`) REFERENCES `batch_peserta`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `batch_peserta` ADD `penomoran` text DEFAULT 'urut' NOT NULL;