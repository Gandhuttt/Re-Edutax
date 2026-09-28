import { getRequestEvent, query } from '$app/server';
import { db } from '$lib/server/db';
import {
	jenis_item_transaksi_faktur,
	kode_item_transaksi_faktur,
	satuan_ukur_transaksi_faktur,
	transaksi_faktur_pajak
} from '$lib/server/db/schema';
import { getFakturReferenceChain } from '$lib/server/fakturPayment';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';

const GetFakturReferensiSchema = v.object({
	id: v.string()
});

export const getFakturReferensi = query(GetFakturReferensiSchema, async ({ id }) => {
	const activeNpwp = getRequestEvent().locals.user?.username;
	if (!activeNpwp) error(401, 'Belum login');

	const reference = await getFakturReferenceChain(id, activeNpwp);
	if (!reference) error(404, 'Faktur referensi tidak ditemukan atau belum diunggah');
	const { invoice, totalUangMuka: totalUangMukaSebelumnya } = reference;

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
		.where(eq(transaksi_faktur_pajak.fakturPajakId, invoice.id));


	return {
		npwpPembeli: invoice.npwpPembeli ?? '',
		totalUangMukaSebelumnya,
		transaksi: transaksi.map((item) => {
			const { jenisItemKode, ...line } = item;
			const hargaTotal = item.kuantitas * item.hargaSatuan;
			const DPP = hargaTotal - item.hargaPotongan;
			const PPN = ((item.dppNilaiLain > 0 ? item.dppNilaiLain : DPP) * item.tarifPPN) / 100;
			const PPnBM = (DPP * item.tarifPPnBM) / 100;

			return {
				...line,
				id: `referensi-${invoice.id}-${item.id}`,
				tipe: jenisItemKode === 'jasa' ? 1 : 0,
				hargaTotal,
				DPP,
				PPN,
				PPnBM
			};
		})
	};
});
