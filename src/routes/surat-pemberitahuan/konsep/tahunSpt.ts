// Tahun yang bisa dibuatkan SPT (Masa PPN, Tahunan PPh Badan, Tahunan PPh Orang
// Pribadi). Dipakai oleh form (opsi) dan validasi server (new*.remote.ts).
// Mulai 2022: tarif progresif UU HPP berlaku untuk semua tahun ini, sehingga mesin
// hitungPphOrangPribadi tidak punya percabangan tahun.
export const TAHUN_SPT = [2022, 2023, 2024, 2025, 2026] as const;
export const TAHUN_SPT_DEFAULT = 2025;
