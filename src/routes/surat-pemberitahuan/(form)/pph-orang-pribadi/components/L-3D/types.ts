// L-3D row shapes. Three independent grids, no totals, no derived amounts.
export interface BarisEntertainment {
	tanggal: string;
	namaTempat: string;
	alamat: string;
	jenis: string;
	jumlahPemberian: number;
	namaRelasi: string;
	posisiJabatan: string;
	namaPerusahaan: string;
	jenisUsahaRelasi: string;
	keterangan: string;
}

export interface BarisPromosi {
	nomorIdentitasPenerima: string;
	namaPenerima: string;
	alamatPenerima: string;
	tanggal: string;
	// Derived from bentukJenisBiaya.
	kodeBentukJenisBiaya: string;
	bentukJenisBiaya: string;
	nilai: number;
	keterangan: string;
	jumlahPemotongan: number;
	nomorBuktiPotong: string;
}

export interface BarisPiutang {
	nomorIdentitasDebitur: string;
	namaDebitur: string;
	alamatDebitur: string;
	jumlahPlafon: number;
	jumlahTidakDapatDitagih: number;
	// Both derived from their description.
	kodeMetodePembebanan: string;
	metodePembebanan: string;
	kodeJenisDokumen: string;
	jenisDokumen: string;
}
