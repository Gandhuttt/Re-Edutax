CREATE TABLE `spt_pph_2126` (
 `id` text PRIMARY KEY NOT NULL,
 `npwp_pemotong` text NOT NULL REFERENCES `wajib_pajak`(`npwp`),
 `nama_pemotong` text NOT NULL,
 `masa_pajak` integer NOT NULL,
 `tahun` integer NOT NULL,
 `chain_id` text NOT NULL,
 `pembetulan_ke` integer DEFAULT 0 NOT NULL,
 `status` text DEFAULT 'konsep' NOT NULL,
 `revision` integer DEFAULT 0 NOT NULL,
 `input` text NOT NULL,
 `snapshot` text,
 `source_signature` text,
 `pembayaran21` integer DEFAULT 0 NOT NULL,
 `pembayaran26` integer DEFAULT 0 NOT NULL,
 `kredit21` integer DEFAULT 0 NOT NULL,
 `kredit26` integer DEFAULT 0 NOT NULL,
 `created_at` integer NOT NULL,
 `tanggal_posting` integer,
 `tanggal_dilaporkan` integer
);
--> statement-breakpoint
CREATE INDEX `spt2126_owner_idx` ON `spt_pph_2126` (`npwp_pemotong`,`tahun`,`masa_pajak`);
--> statement-breakpoint
CREATE UNIQUE INDEX `spt2126_chain_revision_idx` ON `spt_pph_2126` (`chain_id`,`pembetulan_ke`);
--> statement-breakpoint
CREATE UNIQUE INDEX `spt2126_period_idx` ON `spt_pph_2126` (`npwp_pemotong`,`tahun`,`masa_pajak`,`pembetulan_ke`);
--> statement-breakpoint
CREATE TABLE `spt_pph_2126_kompensasi` (
 `id` text PRIMARY KEY NOT NULL,
 `npwp_pemotong` text NOT NULL REFERENCES `wajib_pajak`(`npwp`),
 `source_chain_id` text NOT NULL,
 `consumer_chain_id` text NOT NULL,
 `pasal` integer NOT NULL,
 `jumlah` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `spt2126_comp_source_idx` ON `spt_pph_2126_kompensasi` (`npwp_pemotong`,`source_chain_id`,`pasal`);
--> statement-breakpoint
CREATE UNIQUE INDEX `spt2126_comp_consumer_idx` ON `spt_pph_2126_kompensasi` (`consumer_chain_id`,`pasal`,`source_chain_id`);
