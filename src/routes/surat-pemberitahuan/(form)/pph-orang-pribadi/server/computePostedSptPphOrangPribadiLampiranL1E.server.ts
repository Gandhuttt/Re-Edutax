import { getBuktiPotongUntukPenerima } from '$lib/server/ebupot/getBuktiPotongUntukPenerima';

export type PostedLampiranL1ERow = {
	namaPemotong: string;
	npwpPemotong: string;
	nomorBukti: string;
	tanggalBukti: string;
	jenisPajak: string;
	penghasilanBruto: number;
	pphDipotong: number;
	sumberBuktiPotongJenis: 'BPU' | 'BP21' | 'BP26' | 'BPA1' | 'BPA2' | 'MP';
	sumberBuktiPotongId: string;
};

// Bulk-computes L-1 Bagian E rows from every eligible eBupot bukti potong
// this taxpayer received (as recipient) for the given tax year -- the
// "Posting SPT" pull, mirrored on
// pph-badan/server/computePostedSptPphBadanLampiranL3B.server.ts and
// modeled directly on ppn/server/computePostedSptPpnLampiran.server.ts.
//
// All 6 eBupot bukti types are eligible here (BP21/BP26/BPA1/BPA2/MP are
// always personal-income withholding; BPU can be either an individual or
// corporate recipient, so it's eligible on both the OP and Badan side --
// the taxpayer just picks whichever SPT type actually matches who they
// are, same as every other field on these forms). Only non-final
// withholding is creditable -- final tax settles the obligation on its
// own and was never meant to land in a credit line here.
//
// jenisPajak on this table is a free-text column (not a FK, unlike
// Badan's), so no reference-table mapping is needed -- the object's own
// `pasal` is used directly, prefixed to match the existing L-1E reference
// list's style ("PPh Pasal 21" etc).
export async function computePostedSptPphOrangPribadiLampiranL1E({
	npwp,
	tahunPajak
}: {
	npwp: string;
	tahunPajak: number;
}): Promise<PostedLampiranL1ERow[]> {
	const semua = await getBuktiPotongUntukPenerima(npwp);
	const eligible = semua.filter((row) => row.sifat === 'Tidak Final' && row.tahun === tahunPajak);

	return eligible.map((row) => ({
		namaPemotong: row.namaPemotong,
		npwpPemotong: row.npwpPemotong,
		nomorBukti: row.nomorPemotongan ?? '',
		tanggalBukti: row.tanggalBukti,
		jenisPajak: `PPh ${row.pasal ?? ''}`.trim(),
		penghasilanBruto: row.penghasilanBruto,
		pphDipotong: row.pajakPenghasilan,
		sumberBuktiPotongJenis: row.jenis,
		sumberBuktiPotongId: row.id
	}));
}
