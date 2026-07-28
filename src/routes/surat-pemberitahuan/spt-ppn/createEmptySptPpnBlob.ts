import type { SptPpnBlob } from '$lib/schemas/surat-pemberitahuan/spt-ppn';

export function createEmptySptPpnBlob({
	periodeBulan,
	periodeTahun,
	nama = ''
}: {
	periodeBulan: number;
	periodeTahun: number;
	nama?: string;
}): SptPpnBlob {
	return {
	version: 1,
	periodeBulan,
	periodeTahun,
	I: {
		A: [
			0,
			[0, 0, 0, 0],
			[0, 0, 0, 0],
			[0, 0, 0],
			[0, 0, 0, 0],
			[0, 0, 0, 0],
			[0, 0, 0, 0],
			[0, 0, 0, 0],
			[0, 0, 0, 0],
			[0, 0, 0]
		],
		B: 0,
		C: 0
	},
	II: [
		[0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0],
		[0, 0, 0, 0],
		0,
		0,
		[0, 0],
		[0, 0, 0, 0],
		0,
		0
	],
	III: [
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		{
			gantiSptSebelumnya: false,
			tindakan: null,
			lampiranNamaFile: null,
			rekening: {
				pilihRekeningBank: null,
				nomor: null,
				namaBank: null,
				namaPemilik: null
			}
		}
	],
	IV: [0, 0],
	V: 0,
	VI: [0, 0, 0, 0, 0, false],
	VII: [
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0]
	],
	VIII: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], false],
	IX: [true, true],
	X: {
		setuju: false,
		ditandatanganiOleh: null,
		kotaPenandatanganSPT: 'Jakarta',
		nama,
		jabatan: 'Direktur',
		batasWaktuPenyampaian: new Date().toISOString().slice(0, 10)
	}
};
}
