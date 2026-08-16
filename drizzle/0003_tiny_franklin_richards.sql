CREATE TABLE `npwp_terbit` (
	`npwp` text PRIMARY KEY NOT NULL,
	`batch_id` text,
	`urut` integer NOT NULL,
	`nama_pertama` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`batch_id`) REFERENCES `batch_peserta`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `npwp_terbit_batch_id_idx` ON `npwp_terbit` (`batch_id`);