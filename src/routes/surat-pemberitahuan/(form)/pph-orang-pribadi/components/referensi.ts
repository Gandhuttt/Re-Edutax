// Shared shapes for the lampiran dropdown data returned by getReferensiLampiran.

// daftar -> the option descriptions, in DJP's own display order.
export type DaftarReferensi = Record<string, string[]>;

// daftar -> deskripsi -> DJP's code for that option. Only the lists whose codes
// we have fetched appear here; see the seed batch 016 header.
export type KodeReferensi = Record<string, Record<string, string>>;

// Coretax fills its disabled KODE cells by deriving them from the chosen
// Deskripsi, so we do the same. An unknown description -- a list with no codes
// fetched yet, or nothing selected -- yields an empty cell, as before.
export function kodeUntuk(
	kodeReferensi: KodeReferensi,
	daftar: string,
	deskripsi: string
): string {
	return kodeReferensi[daftar]?.[deskripsi] ?? '';
}
