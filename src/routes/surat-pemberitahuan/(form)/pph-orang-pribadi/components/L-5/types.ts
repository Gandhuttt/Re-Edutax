export interface BarisKompensasi {
	tahunPajak: number;
	labaRugiNetoFiskal: number;
	kompensasiYMin4: number;
	kompensasiYMin3: number;
	kompensasiYMin2: number;
	kompensasiYMin1: number;
	kompensasiTahunIni: number;
	kompensasiYPlus1: number;
}

export interface BarisPengurang {
	kode: string;
	jenisPengurang: string;
	jumlah: number;
}
