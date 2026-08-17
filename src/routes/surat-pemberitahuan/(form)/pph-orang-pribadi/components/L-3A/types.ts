export type Sektor = 'dagang' | 'jasa' | 'industri';

// Keyed by the seeded akun row's own id, sektor-namespaced at seed time
// (pph-op-lampiran-3a-akun-<sektor>-<index>), rather than by kode: several
// codes (5008, 5009, 5020, 4300, 4800...) are reused across sektors with
// different meanings, so a plain kode key risks a leftover row from an
// abandoned sektor silently reappearing under a different account after a
// sektor switch. akunId collides across sektors by construction; kode does not.
export interface BarisLabaRugi {
	akunId: string;
	nilaiKomersial: number;
	nonObjekPajak: number;
	dikenakanPphFinal: number;
	penyesuaianFiskalPositif: number;
	penyesuaianFiskalNegatif: number;
	kodePenyesuaianFiskal: string[];
}

export interface KodeKoreksiFiskal {
	kode: string;
	nama: string;
	jenis: 'positif' | 'negatif';
}
