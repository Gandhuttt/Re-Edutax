/**
 * Structural check of a NIK (16 digits: 6 wilayah, 6 tanggal lahir, 4 urut). It only rejects
 * numbers that cannot be a real NIK; it cannot tell whether the NIK belongs to the person
 * typing it. Returns a message to show, or null when the NIK is plausible.
 *
 * Tanggal lahir is DDMMYY, with 40 added to DD for women. Province codes run 11-96.
 * When `tahunLahir` is given, its last two digits must match the YY in the NIK.
 */
export function validasiNik(nik: string, tahunLahir?: number): string | null {
	if (!/^\d{16}$/.test(nik)) return 'NIK harus 16 digit angka';

	const provinsi = Number(nik.slice(0, 2));
	const hari = Number(nik.slice(6, 8));
	const bulan = Number(nik.slice(8, 10));

	if (provinsi < 11 || provinsi > 96) return 'NIK tidak valid: kode wilayah tidak dikenal';
	if (bulan < 1 || bulan > 12) return 'NIK tidak valid: bulan lahir tidak wajar';

	const tanggal = hari > 40 ? hari - 40 : hari;

	if (tanggal < 1 || tanggal > 31) return 'NIK tidak valid: tanggal lahir tidak wajar';

	if (tahunLahir !== undefined && nik.slice(10, 12) !== String(tahunLahir).slice(-2)) {
		return 'NIK tidak sesuai dengan tahun lahir yang Anda isi';
	}

	return null;
}
