-- Preserve existing TKU data; add the pusat only where its NITKU is missing.
INSERT INTO tempat_kegiatan_usaha (id, nitku, wajib_pajak, nama, email, nomor_telepon)
SELECT 'tku-pusat-' || id, npwp || '000000', id, 'Pusat', email, nomor_telepon
FROM wajib_pajak
WHERE length(npwp) = 16 AND npwp NOT GLOB '*[^0-9]*'
ON CONFLICT(nitku) DO NOTHING;
--> statement-breakpoint
-- Covers every WP creation path, including registration, bulk creation and seeds.
CREATE TRIGGER wajib_pajak_default_tku_pusat
AFTER INSERT ON wajib_pajak
WHEN length(NEW.npwp) = 16 AND NEW.npwp NOT GLOB '*[^0-9]*'
BEGIN
  INSERT INTO tempat_kegiatan_usaha (id, nitku, wajib_pajak, nama, email, nomor_telepon)
  VALUES ('tku-pusat-' || NEW.id, NEW.npwp || '000000', NEW.id, 'Pusat', NEW.email, NEW.nomor_telepon)
  ON CONFLICT(nitku) DO NOTHING;
END;
