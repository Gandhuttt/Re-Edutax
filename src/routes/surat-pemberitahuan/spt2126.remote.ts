import { form, getRequestEvent, query } from '$app/server';
import { error, invalid, redirect } from '@sveltejs/kit';
import * as v from 'valibot';
import { SPT2126_YEARS, Spt2126Error } from '$lib/helpers/spt-pph-2126';
import {
	amendSpt2126,
	createSpt2126,
	deleteSpt2126,
	listSpt2126,
	paySpt2126
} from '$lib/server/spt-pph-2126';
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
		if (cause instanceof Spt2126Error) invalid(cause.message);
		throw cause;
	}
}

const idSchema = v.object({ id: v.pipe(v.string(), v.uuid('ID SPT tidak valid')) });

export const listSptPph2126 = query(
	v.object({ status: v.picklist(['konsep', 'menunggu_pembayaran', 'dilaporkan']) }),
	async ({ status }) => listSpt2126(owner(), status)
);

export const newSptPph2126 = form(
	v.object({
		masaPajak: v.pipe(v.string(), v.nonEmpty('Masa pajak wajib diisi'), v.transform(Number),
			v.integer('Masa pajak harus bilangan bulat'), v.minValue(1), v.maxValue(12)),
		tahun: v.pipe(v.string(), v.nonEmpty('Tahun wajib diisi'), v.transform(Number),
			v.picklist(SPT2126_YEARS, 'Pilih tahun SPT nonmigrasi yang tersedia'))
	}),
	async ({ masaPajak, tahun }) => {
		const id = await formResult(createSpt2126(owner(), masaPajak, tahun));
		redirect(303, `/surat-pemberitahuan/pph-21-26?id=${id}`);
	}
);

export const deleteSptPph2126 = form(idSchema, async ({ id }) => {
	await formResult(deleteSpt2126(owner(), id));
	await listSptPph2126({ status: 'konsep' }).refresh();
	await listPeriodeSpt().refresh();
});

export const paySptPph2126 = form(idSchema, async ({ id }) => {
	await formResult(paySpt2126(owner(), id));
	redirect(303, '/surat-pemberitahuan/laporan');
});

export const newPembetulanSptPph2126 = form(idSchema, async ({ id }) => {
	const amendmentId = await formResult(amendSpt2126(owner(), id));
	redirect(303, `/surat-pemberitahuan/pph-21-26?id=${amendmentId}`);
});
