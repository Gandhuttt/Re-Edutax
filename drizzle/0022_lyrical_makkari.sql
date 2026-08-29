CREATE TABLE `kode_objek_pajak_pph` (
	`id` text PRIMARY KEY NOT NULL,
	`jenis_bukti_potong` text NOT NULL,
	`kode_referensi` text NOT NULL,
	`kode` text NOT NULL,
	`nama` text NOT NULL,
	`pasal` text NOT NULL,
	`sifat` text NOT NULL,
	`kap` text NOT NULL,
	`parameter_data` text NOT NULL,
	`aktif` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `kode_objek_pajak_pph_jenis_kode_unique` ON `kode_objek_pajak_pph` (`jenis_bukti_potong`,`kode`);--> statement-breakpoint
CREATE TABLE `jenis_dokumen_ebupot` (
	`id` text PRIMARY KEY NOT NULL,
	`kode` text NOT NULL,
	`nama` text NOT NULL,
	`aktif` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `jenis_dokumen_ebupot_kode_unique` ON `jenis_dokumen_ebupot` (`kode`);--> statement-breakpoint
CREATE TABLE `fasilitas_pajak_ebupot` (
	`id` text PRIMARY KEY NOT NULL,
	`kode` text NOT NULL,
	`nama` text NOT NULL,
	`aktif` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `fasilitas_pajak_ebupot_kode_unique` ON `fasilitas_pajak_ebupot` (`kode`);