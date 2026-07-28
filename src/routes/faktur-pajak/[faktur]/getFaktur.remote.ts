import { getRequestEvent, query } from '$app/server';
import { db } from '$lib/server/db';
import {
	faktur_pajak,
	informasi_tambahan_faktur_pajak,
	jenis_informasi_tambahan_faktur_pajak,
	jenis_item_transaksi_faktur,
	kode_item_transaksi_faktur,
	kode_transaksi_faktur_pajak,
	satuan_ukur_transaksi_faktur,
	transaksi_faktur_pajak
} from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { and, eq, or } from 'drizzle-orm';

export const getFaktur = query(async () => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;
	const id = event.params.faktur;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	if (!id) {
		error(400, 'Bad faktur id');
	}

	const [faktur] = await db
		.select({
			id: faktur_pajak.id,
			npwpPenjual: faktur_pajak.npwpPenjual,
			npwpPembeli: faktur_pajak.npwpPembeli,
			nomorFaktur: faktur_pajak.nomorFaktur,
			kodeTransaksi: kode_transaksi_faktur_pajak.kode,
			referensi: faktur_pajak.referensi,
			alamat: faktur_pajak.alamat,
			uangMuka: faktur_pajak.uangMuka,
			pelunasan: faktur_pajak.pelunasan,
			tanggalFaktur: faktur_pajak.tanggalFaktur,
			masaPajak: faktur_pajak.masaPajak,
			tahun: faktur_pajak.tahun,
			diupload: faktur_pajak.diupload,
			dikreditkan: faktur_pajak.dikreditkan
		})
		.from(faktur_pajak)
		.innerJoin(
			kode_transaksi_faktur_pajak,
			eq(faktur_pajak.kodeTransaksiId, kode_transaksi_faktur_pajak.id)
		)
		.where(
			and(
				eq(faktur_pajak.id, id),
				or(eq(faktur_pajak.npwpPenjual, activeNpwp), eq(faktur_pajak.npwpPembeli, activeNpwp))
			)
		)
		.limit(1);

	if (!faktur) {
		error(404, 'Faktur tidak ditemukan');
	}

	const transaksi = await db
		.select({
			id: transaksi_faktur_pajak.id,
			nama: transaksi_faktur_pajak.nama,
			kodeItem: kode_item_transaksi_faktur.kode,
			satuanUkur: satuan_ukur_transaksi_faktur.kode,
			kuantitas: transaksi_faktur_pajak.kuantitas,
			hargaSatuan: transaksi_faktur_pajak.hargaSatuan,
			hargaPotongan: transaksi_faktur_pajak.hargaPotongan,
			dppNilaiLain: transaksi_faktur_pajak.dppNilaiLain,
			tarifPPN: transaksi_faktur_pajak.tarifPpn,
			tarifPPnBM: transaksi_faktur_pajak.tarifPpnBm,
			jenisItemKode: jenis_item_transaksi_faktur.kode
		})
		.from(transaksi_faktur_pajak)
		.innerJoin(
			kode_item_transaksi_faktur,
			eq(transaksi_faktur_pajak.kodeItemId, kode_item_transaksi_faktur.id)
		)
		.innerJoin(
			jenis_item_transaksi_faktur,
			eq(kode_item_transaksi_faktur.jenisItemId, jenis_item_transaksi_faktur.id)
		)
		.innerJoin(
			satuan_ukur_transaksi_faktur,
			eq(transaksi_faktur_pajak.satuanUkurId, satuan_ukur_transaksi_faktur.id)
		)
		.where(eq(transaksi_faktur_pajak.fakturPajakId, faktur.id));

	const [informasiTambahan] = await db
		.select({
			kodeTransaksi: kode_transaksi_faktur_pajak.kode,
			kodeInformasiTambahan: jenis_informasi_tambahan_faktur_pajak.kode,
			dokumenPendukung: informasi_tambahan_faktur_pajak.dokumenPendukung
		})
		.from(informasi_tambahan_faktur_pajak)
		.innerJoin(
			jenis_informasi_tambahan_faktur_pajak,
			eq(
				informasi_tambahan_faktur_pajak.jenisInformasiTambahanId,
				jenis_informasi_tambahan_faktur_pajak.id
			)
		)
		.innerJoin(
			kode_transaksi_faktur_pajak,
			eq(jenis_informasi_tambahan_faktur_pajak.kodeTransaksiId, kode_transaksi_faktur_pajak.id)
		)
		.where(eq(informasi_tambahan_faktur_pajak.fakturPajakId, faktur.id))
		.limit(1);

	return {
		...faktur,
		nomorFaktur: faktur.nomorFaktur ?? '',
		npwpPembeli: faktur.npwpPembeli ?? '',
		canEdit: faktur.npwpPenjual === activeNpwp && !faktur.diupload,
		transaksi: transaksi.map((item) => {
			const { jenisItemKode, ...transaksiItem } = item;
			const hargaTotal = item.kuantitas * item.hargaSatuan;
			const DPP = hargaTotal - item.hargaPotongan;
			const PPN = ((item.dppNilaiLain > 0 ? item.dppNilaiLain : DPP) * item.tarifPPN) / 100;
			const PPnBM = (DPP * item.tarifPPnBM) / 100;

			return {
				...transaksiItem,
				tipe: jenisItemKode === 'jasa' ? 1 : 0,
				hargaTotal,
				DPP,
				PPN,
				PPnBM
			};
		}),
		extradata: informasiTambahan
			? {
					kodeTransaksi: informasiTambahan.kodeTransaksi as 7 | 8,
					kodeInformasiTambahan: informasiTambahan.kodeInformasiTambahan,
					dokumenPendukung: informasiTambahan.dokumenPendukung ?? undefined
				}
			: null
	};
});
