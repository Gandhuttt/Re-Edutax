// Row shapes for L-2's three sections.

export interface BarisFinal {
	npwpPemotong: string;
	namaPemotong: string;
	// The live form derives this from Jenis Penghasilan using the real DJP
	// object-code format (pasal-objek-sub). Ours is typed.
	kodeObjekPajak: string;
	jenisPenghasilan: string;
	dasarPengenaanPajak: number;
	pphTerutang: number;
}

export interface BarisBukanObjek {
	kode: string;
	jenisPenghasilan: string;
	npwpSumber: string;
	namaSumber: string;
	penghasilanBruto: number;
}

export interface BarisLuarNegeri {
	namaSumber: string;
	negara: string;
	tanggalTransaksi: string;
	jenisPenghasilan: string;
	kodePenghasilan: string;
	penghasilanNeto: number;
	mataUang: string;
	pajakLuarNegeriAsing: number;
	pajakLuarNegeriRupiah: number;
	kreditPajakDiperhitungkan: number;
}
