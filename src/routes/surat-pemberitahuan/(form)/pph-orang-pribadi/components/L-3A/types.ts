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

// A.2 neraca. Keyed by the seeded neraca akun row's own id for the same reason
// the laba/rugi rows are (see above): the id is sektor-namespaced, the kode is
// not, and 1401 vs 1402-1404 differ between sektors.
export interface BarisNeraca {
	akunId: string;
	nilai: number;
}

// FINANCIAL_STATEMENT reference list: TRADING = Diaudit, SELF_PREPARED = Tidak
// Diaudit. Stored in our own words rather than DJP's codes, since "TRADING"
// meaning "audited" is a trap for anyone reading the column later.
export type LaporanKeuangan = 'diaudit' | 'tidak_diaudit';

export interface FooterL3A {
	laporanKeuangan: LaporanKeuangan | null;
	npwpKonsultanPajak: string | null;
	namaKonsultanPajak: string | null;
	npwpKantorAkuntanPublik: string | null;
	namaKantorAkuntanPublik: string | null;
}
