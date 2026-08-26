CREATE TABLE `spt_ppn_lampiran_a2` (
	`id` text PRIMARY KEY NOT NULL,
	`spt_ppn_id` text NOT NULL,
	`nomor_urut` integer NOT NULL,
	`faktur_pajak_id` text NOT NULL,
	`nama_lawan_transaksi` text,
	`npwp_lawan_transaksi` text NOT NULL,
	`nomor_faktur` text NOT NULL,
	`tanggal_faktur` text NOT NULL,
	`kode_transaksi` integer NOT NULL,
	`harga_jual` integer DEFAULT 0 NOT NULL,
	`dpp_nilai_lain` integer DEFAULT 0 NOT NULL,
	`ppn` integer DEFAULT 0 NOT NULL,
	`ppnbm` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`spt_ppn_id`) REFERENCES `spt_ppn`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `spt_ppn_lampiran_b2` (
	`id` text PRIMARY KEY NOT NULL,
	`spt_ppn_id` text NOT NULL,
	`nomor_urut` integer NOT NULL,
	`faktur_pajak_id` text NOT NULL,
	`nama_lawan_transaksi` text,
	`npwp_lawan_transaksi` text NOT NULL,
	`nomor_faktur` text NOT NULL,
	`tanggal_faktur` text NOT NULL,
	`kode_transaksi` integer NOT NULL,
	`harga_jual` integer DEFAULT 0 NOT NULL,
	`dpp_nilai_lain` integer DEFAULT 0 NOT NULL,
	`ppn` integer DEFAULT 0 NOT NULL,
	`ppnbm` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`spt_ppn_id`) REFERENCES `spt_ppn`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `spt_ppn_lampiran_c` (
	`id` text PRIMARY KEY NOT NULL,
	`spt_ppn_id` text NOT NULL,
	`nomor_urut` integer NOT NULL,
	`faktur_pajak_id` text NOT NULL,
	`npwp_penjual` text NOT NULL,
	`nama_penjual` text,
	`npwp_pembeli` text NOT NULL,
	`nama_pembeli` text,
	`nomor_faktur` text NOT NULL,
	`tanggal_faktur` text NOT NULL,
	`kode_transaksi` integer NOT NULL,
	`harga_jual` integer DEFAULT 0 NOT NULL,
	`dpp_nilai_lain` integer DEFAULT 0 NOT NULL,
	`ppn` integer DEFAULT 0 NOT NULL,
	`ppnbm` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`spt_ppn_id`) REFERENCES `spt_ppn`(`id`) ON UPDATE no action ON DELETE cascade
);
