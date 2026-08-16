import { query } from '$app/server';
import { npwpPattern } from '$lib/helpers/username';
import { requireAdmin } from '$lib/server/admin';
import { db } from '$lib/server/db';
import {
	batch_peserta,
	faktur_pajak,
	kode_transaksi_faktur_pajak,
	spt_pph_badan,
	spt_ppn,
	user,
	wajib_pajak
} from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { desc, eq, or } from 'drizzle-orm';
import * as v from 'valibot';

const GetPesertaDetailSchema = v.pipe(v.string(), v.regex(npwpPattern, 'NPWP tidak valid'));

/** Read-only window into a peserta's work, for monitoring and grading from the dashboard. */
export const getPesertaDetail = query(GetPesertaDetailSchema, async (npwp) => {
	requireAdmin();

	const [akun] = await db
		.select({
			id: user.id,
			nama: user.name,
			email: user.email,
			npwp: user.username,
			banned: user.banned,
			createdAt: user.createdAt
		})
		.from(user)
		.where(eq(user.username, npwp))
		.limit(1);

	if (!akun) {
		error(404, 'Peserta tidak ditemukan');
	}

	const [profil] = await db
		.select({
			id: wajib_pajak.id,
			npwp: wajib_pajak.npwp,
			nama: wajib_pajak.nama,
			email: wajib_pajak.email,
			nomor_telepon: wajib_pajak.nomor_telepon,
			batchNomor: batch_peserta.nomor,
			batchNama: batch_peserta.nama
		})
		.from(wajib_pajak)
		.leftJoin(batch_peserta, eq(batch_peserta.id, wajib_pajak.batchId))
		.where(eq(wajib_pajak.npwp, npwp))
		.limit(1);

	const [sptPphBadan, sptPpn, faktur] = await Promise.all([
		db
			.select({
				id: spt_pph_badan.id,
				tahunPajak: spt_pph_badan.tahunPajak,
				pembetulanKe: spt_pph_badan.pembetulanKe,
				statusSpt: spt_pph_badan.statusSpt,
				statusDraft: spt_pph_badan.statusDraft,
				pphKurangLebihBayar: spt_pph_badan.pphKurangLebihBayar,
				tanggalDilaporkan: spt_pph_badan.tanggalDilaporkan
			})
			.from(spt_pph_badan)
			.where(eq(spt_pph_badan.npwp, npwp))
			.orderBy(desc(spt_pph_badan.tahunPajak), desc(spt_pph_badan.pembetulanKe)),
		db
			.select({
				id: spt_ppn.id,
				masaPajak: spt_ppn.masaPajak,
				tahun: spt_ppn.tahun,
				pembetulanKe: spt_ppn.pembetulanKe,
				status: spt_ppn.status,
				ppnKurangLebihBayar: spt_ppn.ppnKurangLebihBayar,
				tanggalDilaporkan: spt_ppn.tanggalDilaporkan
			})
			.from(spt_ppn)
			.where(eq(spt_ppn.npwp, npwp))
			.orderBy(desc(spt_ppn.tahun), desc(spt_ppn.masaPajak), desc(spt_ppn.pembetulanKe)),
		db
			.select({
				id: faktur_pajak.id,
				nomorFaktur: faktur_pajak.nomorFaktur,
				kodeTransaksi: kode_transaksi_faktur_pajak.kode,
				npwpPenjual: faktur_pajak.npwpPenjual,
				npwpPembeli: faktur_pajak.npwpPembeli,
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
			.where(or(eq(faktur_pajak.npwpPenjual, npwp), eq(faktur_pajak.npwpPembeli, npwp)))
			.orderBy(desc(faktur_pajak.tahun), desc(faktur_pajak.masaPajak))
	]);

	return {
		akun: { ...akun, npwp: akun.npwp ?? npwp },
		profil: profil ?? null,
		sptPphBadan,
		sptPpn,
		fakturKeluaran: faktur.filter((row) => row.npwpPenjual === npwp),
		fakturMasukan: faktur.filter((row) => row.npwpPembeli === npwp)
	};
});
