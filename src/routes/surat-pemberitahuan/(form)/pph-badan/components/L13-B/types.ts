export type L13BARow = {
	id: string | number;
	perjanjianNomor: string;
	perjanjianTanggal: string;
	mitraKegiatan: string;
	keterangan: string;
};

export type L13BBRow = {
	kode: string;
	nama: string;
	nilai: number;
};

export type L13BCRow = {
	id: string | number;
	nomorProposal: string;
	jangkaWaktuDariTahun: number;
	jangkaWaktuSampaiTahun: number;
	jumlahBiaya: number;
	tahunPerolehanHki: number;
	persentaseFasilitasPajak: number;
};
