-- Migration number: 0037 	 2026-09-28T07:37:33.550Z
UPDATE `faktur_pajak`
SET `nomor_faktur` = printf('88%014d', rowid)
WHERE `diupload` = 1 AND `nomor_faktur` = '0000000000000000';
