import { db } from '$lib/server/db';
import { spt_pph_badan_lampiran_8_fasilitas_31e } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function getLampiranL8(sptPphBadanId: string) {
	const [l8] = await db
		.select({
			jumlahPeredaranBruto: spt_pph_badan_lampiran_8_fasilitas_31e.jumlahPeredaranBruto,
			penghasilanKenaPajak: spt_pph_badan_lampiran_8_fasilitas_31e.penghasilanKenaPajak,
			penghasilanKenaPajakMendapatFasilitas: spt_pph_badan_lampiran_8_fasilitas_31e.penghasilanKenaPajakMendapatFasilitas,
			penghasilanKenaPajakTidakMendapatFasilitas:
				spt_pph_badan_lampiran_8_fasilitas_31e.penghasilanKenaPajakTidakMendapatFasilitas,
			pphTerutangMendapatFasilitas: spt_pph_badan_lampiran_8_fasilitas_31e.pphTerutangMendapatFasilitas,
			pphTerutangTidakMendapatFasilitas: spt_pph_badan_lampiran_8_fasilitas_31e.pphTerutangTidakMendapatFasilitas,
			pphTerutangJumlah: spt_pph_badan_lampiran_8_fasilitas_31e.pphTerutangJumlah
		})
		.from(spt_pph_badan_lampiran_8_fasilitas_31e)
		.where(eq(spt_pph_badan_lampiran_8_fasilitas_31e.sptPphBadanId, sptPphBadanId));

	return {
		jumlahPeredaranBruto: l8?.jumlahPeredaranBruto ?? 0,
		penghasilanKenaPajak: l8?.penghasilanKenaPajak ?? 0,
		penghasilanKenaPajakMendapatFasilitas: l8?.penghasilanKenaPajakMendapatFasilitas ?? 0,
		penghasilanKenaPajakTidakMendapatFasilitas: l8?.penghasilanKenaPajakTidakMendapatFasilitas ?? 0,
		pphTerutangMendapatFasilitas: l8?.pphTerutangMendapatFasilitas ?? 0,
		pphTerutangTidakMendapatFasilitas: l8?.pphTerutangTidakMendapatFasilitas ?? 0,
		pphTerutangJumlah: l8?.pphTerutangJumlah ?? 0
	};
}
