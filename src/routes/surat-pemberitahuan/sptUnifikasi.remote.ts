import { form, getRequestEvent, query } from '$app/server';
import { error, invalid, redirect } from '@sveltejs/kit';
import * as v from 'valibot';
import { SPT_UNIFIKASI_YEARS, SptUnifikasiError } from '$lib/helpers/spt-unifikasi';
import {
	amendSptUnifikasi,
	createSptUnifikasi,
	deleteSptUnifikasi,
	listSptUnifikasi,
	paySptUnifikasi
} from '$lib/server/spt-unifikasi';
import { listPeriodeSpt } from './konsep/listPeriodeSpt.remote';

function owner() {
	const npwp = getRequestEvent().locals.user?.username;
	if (!npwp) error(401, 'Belum login');
	return npwp;
}

async function formResult<T>(operation: Promise<T>): Promise<T> {
	try {
		return await operation;
	} catch (cause) {
		if (cause instanceof SptUnifikasiError) invalid(cause.message);
		throw cause;
	}
}

const idSchema = v.object({ id: v.pipe(v.string(), v.uuid('ID SPT tidak valid')) });

export const listSptPphUnifikasi = query(
	v.object({ status: v.picklist(['konsep', 'menunggu_pembayaran', 'dilaporkan']) }),
	async ({ status }) => listSptUnifikasi(owner(), status)
);

export const newSptPphUnifikasi = form(
	v.object({
		masaPajak: v.pipe(v.string(), v.nonEmpty('Masa pajak wajib diisi'), v.transform(Number),
			v.integer('Masa pajak harus bilangan bulat'), v.minValue(1), v.maxValue(12)),
		tahun: v.pipe(v.string(), v.nonEmpty('Tahun wajib diisi'), v.transform(Number),
			v.picklist(SPT_UNIFIKASI_YEARS, 'Pilih tahun SPT nonmigrasi yang tersedia'))
	}),
	async ({ masaPajak, tahun }) => {
		const id = await formResult(createSptUnifikasi(owner(), masaPajak, tahun));
		redirect(303, `/surat-pemberitahuan/pph-unifikasi?id=${id}`);
	}
);

export const deleteSptPphUnifikasi = form(idSchema, async ({ id }) => {
	await formResult(deleteSptUnifikasi(owner(), id));
	await listSptPphUnifikasi({ status: 'konsep' }).refresh();
	await listPeriodeSpt().refresh();
});

export const paySptPphUnifikasi = form(idSchema, async ({ id }) => {
	await formResult(paySptUnifikasi(owner(), id));
	redirect(303, '/surat-pemberitahuan/laporan');
});

export const newPembetulanSptPphUnifikasi = form(idSchema, async ({ id }) => {
	const amendmentId = await formResult(amendSptUnifikasi(owner(), id));
	redirect(303, `/surat-pemberitahuan/pph-unifikasi?id=${amendmentId}`);
});
