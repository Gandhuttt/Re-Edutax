import { form, getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import {
	mata_uang_spt_pph_badan,
	sektor_usaha_spt_pph_badan,
	spt_pph_badan,
	spt_pph_badan_lampiran_1_laba_rugi,
	spt_pph_badan_lampiran_1_neraca
} from '$lib/server/db/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';

export const newSptPphBadan = form(async () => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	const tahunPajak = new Date().getFullYear();
	const mataUang = await getOrCreateMataUangRupiah();
	const sektorUsaha = await getOrCreateSektorUsahaUmum();

	let [existing] = await db
		.select({ id: spt_pph_badan.id })
		.from(spt_pph_badan)
		.where(
			and(
				eq(spt_pph_badan.npwp, activeNpwp),
				eq(spt_pph_badan.tahunPajak, tahunPajak),
				eq(spt_pph_badan.pembetulanKe, 0)
			)
		)
		.limit(1);

	if (!existing) {
		await db.transaction(async (tx) => {
			[existing] = await tx
				.insert(spt_pph_badan)
				.values({
					npwp: activeNpwp,
					tahunPajak,
					periodePembukuanMulai: `${tahunPajak}-01-01`,
					periodePembukuanSelesai: `${tahunPajak}-12-31`,
					metodePembukuan: 'akrual',
					mataUangPembukuanId: mataUang.id,
					sektorUsahaId: sektorUsaha.id,
					menerimaPenghasilanPp23: false,
					hanyaPenghasilanPp23: false,
					menerimaPenghasilanFinal: false,
					menerimaPenghasilanBukanObjekPajak: false,
					tarifPajak: 'pasal_17_1_b'
				})
				.returning({ id: spt_pph_badan.id });

			await tx.insert(spt_pph_badan_lampiran_1_laba_rugi).values(createDefaultLabaRugiRows(existing.id));
			await tx.insert(spt_pph_badan_lampiran_1_neraca).values(createDefaultNeracaRows(existing.id));
		});
	}

	redirect(303, `/surat-pemberitahuan/pph-badan?id=${existing.id}`);
});

async function getOrCreateMataUangRupiah() {
	const [existing] = await db
		.select({ id: mata_uang_spt_pph_badan.id })
		.from(mata_uang_spt_pph_badan)
		.where(eq(mata_uang_spt_pph_badan.kode, 'IDR'))
		.limit(1);

	if (existing) return existing;

	const [created] = await db
		.insert(mata_uang_spt_pph_badan)
		.values({ kode: 'IDR', nama: 'Rupiah' })
		.returning({ id: mata_uang_spt_pph_badan.id });

	return created;
}

async function getOrCreateSektorUsahaUmum() {
	const [existing] = await db
		.select({ id: sektor_usaha_spt_pph_badan.id })
		.from(sektor_usaha_spt_pph_badan)
		.where(eq(sektor_usaha_spt_pph_badan.kode, 'umum'))
		.limit(1);

	if (existing) return existing;

	const [created] = await db
		.insert(sektor_usaha_spt_pph_badan)
		.values({ kode: 'umum', nama: 'Umum' })
		.returning({ id: sektor_usaha_spt_pph_badan.id });

	return created;
}

function createDefaultLabaRugiRows(sptPphBadanId: string) {
	return [
		{ nomorUrut: 1, kodeAkun: '4004', namaAkun: 'Penjualan Bruto', kelompokAkun: 'pendapatan', sptPphBadanId },
		{ nomorUrut: 2, kodeAkun: '4011', namaAkun: 'Retur Penjualan', kelompokAkun: 'pendapatan', sptPphBadanId },
		{ nomorUrut: 3, kodeAkun: '4020', namaAkun: 'Penjualan Bersih', kelompokAkun: 'pendapatan', sptPphBadanId },
		{ nomorUrut: 4, kodeAkun: '5020', namaAkun: 'Jumlah HPP', kelompokAkun: 'beban', sptPphBadanId },
		{ nomorUrut: 5, kodeAkun: '4300', namaAkun: 'Laba Kotor', kelompokAkun: 'hasil', sptPphBadanId },
		{ nomorUrut: 6, kodeAkun: '5400', namaAkun: 'Jumlah Beban Usaha', kelompokAkun: 'beban', sptPphBadanId },
		{ nomorUrut: 7, kodeAkun: '4800', namaAkun: 'Laba (Rugi) Sebelum Pajak', kelompokAkun: 'hasil', sptPphBadanId }
	];
}

function createDefaultNeracaRows(sptPphBadanId: string) {
	return [
		{ nomorUrut: 1, sisi: 'aktiva' as const, kodeAkun: '1500', namaAkun: 'Jumlah Aset Lancar', kelompokAkun: 'aktiva', sptPphBadanId },
		{ nomorUrut: 2, sisi: 'aktiva' as const, kodeAkun: '1700', namaAkun: 'Jumlah Aset', kelompokAkun: 'aktiva', sptPphBadanId },
		{ nomorUrut: 3, sisi: 'pasiva' as const, kodeAkun: '2229', namaAkun: 'Jumlah Liabilitas Jangka Pendek', kelompokAkun: 'pasiva', sptPphBadanId },
		{ nomorUrut: 4, sisi: 'pasiva' as const, kodeAkun: '2999', namaAkun: 'Jumlah Liabilitas', kelompokAkun: 'pasiva', sptPphBadanId },
		{ nomorUrut: 5, sisi: 'pasiva' as const, kodeAkun: '3299', namaAkun: 'Jumlah Ekuitas', kelompokAkun: 'pasiva', sptPphBadanId }
	];
}
