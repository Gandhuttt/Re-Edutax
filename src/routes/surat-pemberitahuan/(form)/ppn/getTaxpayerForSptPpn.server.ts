import { db } from '$lib/server/db';
import { tempat_kegiatan_usaha, wajib_pajak } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export async function getTaxpayerForSptPpn(activeNpwp: string) {
	const [taxpayer] = await db
		.select({
			id: wajib_pajak.id,
			npwp: wajib_pajak.npwp,
			nama: wajib_pajak.nama,
			nomorTelepon: wajib_pajak.nomor_telepon
		})
		.from(wajib_pajak)
		.where(eq(wajib_pajak.npwp, activeNpwp))
		.limit(1);

	if (!taxpayer) {
		error(404, 'Data wajib pajak tidak ditemukan');
	}

	const [mainPlace] = await db
		.select({
			alamat: tempat_kegiatan_usaha.alamat,
			nomorTelepon: tempat_kegiatan_usaha.nomor_telepon
		})
		.from(tempat_kegiatan_usaha)
		.where(eq(tempat_kegiatan_usaha.wajib_pajak, taxpayer.id))
		.limit(1);

	return {
		npwp: taxpayer.npwp,
		nama: taxpayer.nama,
		alamat: mainPlace?.alamat ?? '',
		noTelepon: taxpayer.nomorTelepon ?? mainPlace?.nomorTelepon ?? '',
		teleponSeluler: taxpayer.nomorTelepon ?? '',
		klasifikasiLapanganUsaha: ''
	};
}
