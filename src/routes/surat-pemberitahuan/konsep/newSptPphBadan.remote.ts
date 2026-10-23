import { form, getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import {
	mata_uang_spt_pph_badan,
	sektor_usaha_spt_pph_badan,
	spt_pph_badan
} from '$lib/server/db/schema';
import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';
import { TAHUN_SPT } from './tahunSpt';

const NewSptPphBadanSchema = v.object({
	tahunPajak: v.pipe(
		v.string(),
		v.nonEmpty('Tahun pajak'),
		v.transform(Number),
		v.integer('Tahun pajak harus berupa bilangan bulat'),
		v.picklist(TAHUN_SPT, `Tahun pajak yang didukung: ${TAHUN_SPT.join(', ')}`)
	)
});

export const newSptPphBadan = form(NewSptPphBadanSchema, async ({ tahunPajak }) => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	const mataUang = await getOrCreateMataUangRupiah();
	const sektorUsaha = await getOrCreateSektorUsahaUmum();

	// Every call opens a new normal SPT (pembetulanKe 0): a taxpayer may file more than
	// one per tahun pajak. Amendments are a separate flow (newPembetulanSptPphBadan).
	const [created] = await db
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

	redirect(303, `/surat-pemberitahuan/pph-badan?id=${created.id}`);
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

