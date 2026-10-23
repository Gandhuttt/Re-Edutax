DROP INDEX `spt_pph_badan_period_unique`;--> statement-breakpoint
ALTER TABLE `spt_pph_badan` ADD `pembetulan_dari_id` text REFERENCES spt_pph_badan(id) ON DELETE set null;--> statement-breakpoint
DROP INDEX `spt_pph_orang_pribadi_period_unique`;--> statement-breakpoint
ALTER TABLE `spt_pph_orang_pribadi` ADD `pembetulan_dari_id` text REFERENCES spt_pph_orang_pribadi(id) ON DELETE set null;--> statement-breakpoint
-- Until now (npwp, tahun, pembetulan_ke) was unique, so every existing pembetulan has exactly
-- one predecessor and the link can be derived without ambiguity.
UPDATE `spt_pph_badan` SET `pembetulan_dari_id` = (SELECT p.`id` FROM `spt_pph_badan` p WHERE p.`npwp` = `spt_pph_badan`.`npwp` AND p.`tahun_pajak` = `spt_pph_badan`.`tahun_pajak` AND p.`pembetulan_ke` = `spt_pph_badan`.`pembetulan_ke` - 1) WHERE `pembetulan_ke` > 0;--> statement-breakpoint
UPDATE `spt_pph_orang_pribadi` SET `pembetulan_dari_id` = (SELECT p.`id` FROM `spt_pph_orang_pribadi` p WHERE p.`npwp` = `spt_pph_orang_pribadi`.`npwp` AND p.`tahun_pajak` = `spt_pph_orang_pribadi`.`tahun_pajak` AND p.`pembetulan_ke` = `spt_pph_orang_pribadi`.`pembetulan_ke` - 1) WHERE `pembetulan_ke` > 0;
