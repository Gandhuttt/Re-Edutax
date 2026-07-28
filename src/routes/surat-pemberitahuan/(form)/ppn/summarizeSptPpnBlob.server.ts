import type { SptPpnBlob } from '$lib/schemas/surat-pemberitahuan/spt-ppn';

export function summarizeSptPpnBlob(blob: SptPpnBlob) {
	return {
		totalDppKeluaran: blob.I.A[9][0],
		totalDppNilaiLainKeluaran:
			blob.I.A[1][1] +
			blob.I.A[2][1] +
			blob.I.A[4][1] +
			blob.I.A[5][1] +
			blob.I.A[6][1] +
			blob.I.A[7][1],
		totalPpnKeluaran: blob.I.A[9][1],
		totalPpnBmKeluaran: blob.I.A[9][2],
		totalDppMasukan: blob.II[6][0],
		totalPpnMasukan: blob.II[6][1],
		ppnKurangLebihBayar: blob.III[4]
	};
}
