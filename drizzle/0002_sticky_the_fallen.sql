CREATE TABLE `batch_peserta` (
	`id` text PRIMARY KEY NOT NULL,
	`nomor` integer NOT NULL,
	`nama` text NOT NULL,
	`pola_email` text DEFAULT 'peserta{n}@example.com' NOT NULL,
	`password_default` text DEFAULT '123' NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `batch_peserta_nomor_unique` ON `batch_peserta` (`nomor`);--> statement-breakpoint
ALTER TABLE `wajib_pajak` ADD `batch_id` text REFERENCES batch_peserta(id);