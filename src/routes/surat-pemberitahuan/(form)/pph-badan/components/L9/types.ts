export type L9Row = {
	id: string | number;
	kelompokPenyusutan:
		| 'kelompok_1'
		| 'kelompok_2'
		| 'kelompok_3'
		| 'kelompok_4'
		| 'kelompok_lainnya'
		| 'permanen'
		| 'tidak_permanen';
	jenisHarta: string;
	kodeHarta: string;
	bulanTahunPerolehan: string;
	hargaPerolehan: number;
	nilaiSisaBukuFiskalAwalTahun: number;
	metodePenyusutanKomersial: string;
	metodePenyusutanFiskal: string;
	penyusutanAmortisasiFiskalTahunIni: number;
	penyusutanAmortisasiKomersialTahunIni: number;
	akumulasiPenyusutanAmortisasiFiskal: number;
	nilaiSisaBukuFiskalAkhirTahun: number;
	keterangan: string;
};
