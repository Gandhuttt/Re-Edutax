const BATAS_FASILITAS_PENUH = 4_800_000_000;
const BATAS_FASILITAS_SEBAGIAN = 50_000_000_000;
const TARIF_NORMAL = 0.22;

export function hitungFasilitas31E(jumlahPeredaranBruto: number, penghasilanKenaPajak: number) {
	let penghasilanKenaPajakMendapatFasilitas: number;

	if (jumlahPeredaranBruto <= BATAS_FASILITAS_PENUH) {
		penghasilanKenaPajakMendapatFasilitas = penghasilanKenaPajak;
	} else if (jumlahPeredaranBruto <= BATAS_FASILITAS_SEBAGIAN) {
		penghasilanKenaPajakMendapatFasilitas = Math.min(
			penghasilanKenaPajak,
			(BATAS_FASILITAS_PENUH / jumlahPeredaranBruto) * penghasilanKenaPajak
		);
	} else {
		penghasilanKenaPajakMendapatFasilitas = 0;
	}

	const penghasilanKenaPajakTidakMendapatFasilitas =
		penghasilanKenaPajak - penghasilanKenaPajakMendapatFasilitas;

	const pphTerutangMendapatFasilitas = Math.floor(
		penghasilanKenaPajakMendapatFasilitas * 0.5 * TARIF_NORMAL
	);
	const pphTerutangTidakMendapatFasilitas = Math.floor(
		penghasilanKenaPajakTidakMendapatFasilitas * TARIF_NORMAL
	);

	return {
		penghasilanKenaPajakMendapatFasilitas: Math.floor(penghasilanKenaPajakMendapatFasilitas),
		penghasilanKenaPajakTidakMendapatFasilitas: Math.floor(penghasilanKenaPajakTidakMendapatFasilitas),
		pphTerutangMendapatFasilitas,
		pphTerutangTidakMendapatFasilitas,
		pphTerutangJumlah: pphTerutangMendapatFasilitas + pphTerutangTidakMendapatFasilitas
	};
}
