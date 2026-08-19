// Row shapes for L-2's three sections.

export interface BarisFinal {
	npwpPemotong: string;
	namaPemotong: string;
	// Derived from Jenis Penghasilan, like the live form: the TAX_CODE reference
	// list supplies DJP's real object-code format (pasal-objek-sub, e.g.
	// "21-100-29"), so this is no longer typed by hand.
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
	// Would be derived from jenisPenghasilan like the other lampiran, but L-2 C's
	// list is the one with no reference type, so this stays blank. See seed 016.
	kodePenghasilan: string;
	penghasilanNeto: number;
	mataUang: string;
	pajakLuarNegeriAsing: number;
	pajakLuarNegeriRupiah: number;
	kreditPajakDiperhitungkan: number;
}
