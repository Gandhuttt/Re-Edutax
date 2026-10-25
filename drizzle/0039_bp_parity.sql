CREATE TABLE `ebupot_pengaturan_lokal` (
	`npwp_pemotong` text PRIMARY KEY NOT NULL,
	`instansi_pemerintah` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`npwp_pemotong`) REFERENCES `wajib_pajak`(`npwp`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `ebupot_profil_penerima` (
	`id` text PRIMARY KEY NOT NULL,
	`npwp_pemotong` text NOT NULL,
	`nomor_identitas_wp` text NOT NULL,
	`nama` text NOT NULL,
	`jenis_wp` text NOT NULL,
	`status_ptkp` text,
	FOREIGN KEY (`npwp_pemotong`) REFERENCES `wajib_pajak`(`npwp`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ebupot_profil_penerima_owner_identitas_unique` ON `ebupot_profil_penerima` (`npwp_pemotong`,`nomor_identitas_wp`);--> statement-breakpoint
CREATE TABLE `ebupot_receipt_skd_lokal` (
	`id` text PRIMARY KEY NOT NULL,
	`npwp_pemotong` text NOT NULL,
	`nomor_receipt` text NOT NULL,
	`nomor_identitas_wp` text NOT NULL,
	`nama` text NOT NULL,
	`alamat` text NOT NULL,
	`negara_asal_id` text NOT NULL,
	`berlaku_dari` text NOT NULL,
	`berlaku_sampai` text NOT NULL,
	`aktif` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`npwp_pemotong`) REFERENCES `wajib_pajak`(`npwp`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`negara_asal_id`) REFERENCES `negara_spt_pph_badan`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ebupot_receipt_skd_lokal_owner_receipt_unique` ON `ebupot_receipt_skd_lokal` (`npwp_pemotong`,`nomor_receipt`);--> statement-breakpoint
CREATE TABLE `ebupot_sertifikat_lokal` (
	`id` text PRIMARY KEY NOT NULL,
	`npwp_pemotong` text NOT NULL,
	`nomor_identitas_wp` text NOT NULL,
	`fasilitas_kode` text NOT NULL,
	`nomor_sertifikat` text NOT NULL,
	`berlaku_dari` text NOT NULL,
	`berlaku_sampai` text NOT NULL,
	`aktif` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`npwp_pemotong`) REFERENCES `wajib_pajak`(`npwp`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `ebupot_sertifikat_lokal_lookup_idx` ON `ebupot_sertifikat_lokal` (`npwp_pemotong`,`nomor_identitas_wp`,`fasilitas_kode`);--> statement-breakpoint
ALTER TABLE `kode_objek_pajak_pph` ADD `valid_from` text;--> statement-breakpoint
ALTER TABLE `kode_objek_pajak_pph` ADD `valid_to` text;--> statement-breakpoint
ALTER TABLE `bukti_potong_bp21` ADD `tanggal_pemotongan` text;--> statement-breakpoint
ALTER TABLE `bukti_potong_bp21` ADD `nitku_pemotong` text;--> statement-breakpoint
ALTER TABLE `bukti_potong_bp21` ADD `nitku_penerima` text;--> statement-breakpoint
ALTER TABLE `bukti_potong_bp21` ADD `pembetulan_dari_id` text REFERENCES bukti_potong_bp21(id) ON DELETE set null;--> statement-breakpoint
ALTER TABLE `bukti_potong_bp21` ADD `pembetulan_ke` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX `bukti_potong_bp21_pembetulan_dari_idx` ON `bukti_potong_bp21` (`pembetulan_dari_id`);--> statement-breakpoint
CREATE INDEX `bukti_potong_bp21_owner_idx` ON `bukti_potong_bp21` (`npwp_pemotong`,`tahun`,`masa_pajak`);--> statement-breakpoint
ALTER TABLE `bukti_potong_bp26` ADD `tanggal_pemotongan` text;--> statement-breakpoint
ALTER TABLE `bukti_potong_bp26` ADD `nitku_pemotong` text;--> statement-breakpoint
ALTER TABLE `bukti_potong_bp26` ADD `receipt_number` text;--> statement-breakpoint
ALTER TABLE `bukti_potong_bp26` ADD `pembetulan_dari_id` text REFERENCES bukti_potong_bp26(id) ON DELETE set null;--> statement-breakpoint
ALTER TABLE `bukti_potong_bp26` ADD `pembetulan_ke` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX `bukti_potong_bp26_pembetulan_dari_idx` ON `bukti_potong_bp26` (`pembetulan_dari_id`);--> statement-breakpoint
CREATE INDEX `bukti_potong_bp26_owner_idx` ON `bukti_potong_bp26` (`npwp_pemotong`,`tahun`,`masa_pajak`);--> statement-breakpoint
CREATE INDEX `bukti_potong_bp26_receipt_idx` ON `bukti_potong_bp26` (`npwp_pemotong`,`receipt_number`);--> statement-breakpoint
-- Backfill persisted NITKU only from existing tempat_kegiatan_usaha rows, and only when the
-- branch is unambiguous (exactly one branch for that wajib pajak). Nothing is invented.
UPDATE `bukti_potong_bp21` SET `nitku_pemotong` = (SELECT t.`nitku` FROM `tempat_kegiatan_usaha` t JOIN `wajib_pajak` w ON w.`id` = t.`wajib_pajak` WHERE w.`npwp` = `bukti_potong_bp21`.`npwp_pemotong`) WHERE `nitku_pemotong` IS NULL AND (SELECT COUNT(*) FROM `tempat_kegiatan_usaha` t JOIN `wajib_pajak` w ON w.`id` = t.`wajib_pajak` WHERE w.`npwp` = `bukti_potong_bp21`.`npwp_pemotong`) = 1;--> statement-breakpoint
UPDATE `bukti_potong_bp21` SET `nitku_penerima` = (SELECT t.`nitku` FROM `tempat_kegiatan_usaha` t JOIN `wajib_pajak` w ON w.`id` = t.`wajib_pajak` WHERE w.`npwp` = `bukti_potong_bp21`.`nomor_identitas_wp`) WHERE `nitku_penerima` IS NULL AND `nomor_identitas_wp` <> '' AND (SELECT COUNT(*) FROM `tempat_kegiatan_usaha` t JOIN `wajib_pajak` w ON w.`id` = t.`wajib_pajak` WHERE w.`npwp` = `bukti_potong_bp21`.`nomor_identitas_wp`) = 1;--> statement-breakpoint
UPDATE `bukti_potong_bp26` SET `nitku_pemotong` = (SELECT t.`nitku` FROM `tempat_kegiatan_usaha` t JOIN `wajib_pajak` w ON w.`id` = t.`wajib_pajak` WHERE w.`npwp` = `bukti_potong_bp26`.`npwp_pemotong`) WHERE `nitku_pemotong` IS NULL AND (SELECT COUNT(*) FROM `tempat_kegiatan_usaha` t JOIN `wajib_pajak` w ON w.`id` = t.`wajib_pajak` WHERE w.`npwp` = `bukti_potong_bp26`.`npwp_pemotong`) = 1;--> statement-breakpoint
-- Default Fasilitas Pajak "Tanpa Fasilitas" (kode 9) for existing rows without one; skipped when the
-- reference row is absent so the FK is never violated.
UPDATE `bukti_potong_bp21` SET `fasilitas_pajak_id` = (SELECT f.`id` FROM `fasilitas_pajak_ebupot` f WHERE f.`kode` = '9') WHERE `fasilitas_pajak_id` IS NULL;--> statement-breakpoint
UPDATE `bukti_potong_bp26` SET `fasilitas_pajak_id` = (SELECT f.`id` FROM `fasilitas_pajak_ebupot` f WHERE f.`kode` = '9') WHERE `fasilitas_pajak_id` IS NULL;
