import { error, fail, redirect, type RequestEvent } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { Spt2126Error, type Spt2126Input } from '$lib/helpers/spt-pph-2126';
import {
	getSpt2126,
	saveSpt2126,
	postSpt2126,
	submitSpt2126,
	paySpt2126,
	reopenSpt2126,
	amendSpt2126,
	deleteSpt2126
} from '$lib/server/spt-pph-2126';

function context(event: RequestEvent) {
	const owner = event.locals.user?.username;
	if (!owner) error(401, 'Silakan masuk terlebih dahulu.');
	const id = event.url.searchParams.get('id');
	if (!id) error(400, 'Pilih konsep SPT Masa PPh 21/26 terlebih dahulu.');
	return { owner, id };
}

const notices: Record<string, string> = {
	saved: 'Konsep berhasil disimpan. Posting kembali apabila perhitungan berubah.',
	posted: 'Posting berhasil. Lampiran dan perhitungan disimpan sebagai snapshot simulasi.',
	submitted: 'Pelaporan simulasi berhasil diproses. Periksa status SPT dan kewajiban pembayaran.',
	paid: 'Pembayaran simulasi selesai. SPT berstatus dilaporkan.',
	reopened: 'SPT dikembalikan ke konsep. Periksa isian dan pernyataan, simpan, lalu posting ulang.',
	amended: 'Konsep pembetulan baru berhasil dibuat. Posting ulang sebelum melaporkan.'
};

export const load: PageServerLoad = async (event) => {
	const { owner, id } = context(event);
	try {
		return { detail: await getSpt2126(owner, id), notice: notices[event.url.searchParams.get('done') ?? ''] ?? null };
	} catch (cause) {
		if (cause instanceof Spt2126Error) error(cause.status, cause.message);
		throw cause;
	}
};

function inputFrom(form: FormData): Spt2126Input {
	const amount = (name: string) => {
		const raw = String(form.get(name) ?? '').trim();
		const value = raw === '' ? 0 : Number(raw);
		if (!Number.isFinite(value) || value < 0) throw new Spt2126Error('Nilai kompensasi dan SP2D harus berupa angka nol atau positif.');
		return value;
	};
	return {
		jenisWajibPajak: form.get('jenisWajibPajak') === 'instansi_pemerintah' ? 'instansi_pemerintah' : 'perusahaan',
		kompensasi21SumberId: String(form.get('kompensasi21SumberId') ?? '').trim() || null,
		kompensasi21: amount('kompensasi21'),
		kompensasi26SumberId: String(form.get('kompensasi26SumberId') ?? '').trim() || null,
		kompensasi26: amount('kompensasi26'),
		sp2d21: amount('sp2d21'),
		sp2d26: amount('sp2d26'),
		sp2dKeterangan: String(form.get('sp2dKeterangan') ?? '').trim(),
		pernyataan: form.get('pernyataan') === 'on'
	};
}

async function mutate(event: RequestEvent, action: 'save' | 'post' | 'submit' | 'pay' | 'amend' | 'delete' | 'reopen') {
	const { owner, id } = context(event);
	let nextId = id;
	let values: Spt2126Input | undefined;
	try {
		if (action === 'save') {
			values = inputFrom(await event.request.formData());
			await saveSpt2126(owner, id, values);
		} else if (action === 'post') await postSpt2126(owner, id);
		else if (action === 'submit') await submitSpt2126(owner, id);
		else if (action === 'pay') await paySpt2126(owner, id);
		else if (action === 'reopen') await reopenSpt2126(owner, id);
		else if (action === 'amend') nextId = await amendSpt2126(owner, id);
		else await deleteSpt2126(owner, id);
	} catch (cause) {
		if (cause instanceof Spt2126Error) return fail(cause.status, { message: cause.message, values });
		throw cause;
	}
	if (action === 'delete') redirect(303, '/surat-pemberitahuan/konsep');
	const done = { save: 'saved', post: 'posted', submit: 'submitted', pay: 'paid', amend: 'amended', reopen: 'reopened' }[action];
	redirect(303, `/surat-pemberitahuan/pph-21-26?id=${encodeURIComponent(nextId)}&done=${done}`);
}

export const actions: Actions = {
	save: (event) => mutate(event, 'save'),
	post: (event) => mutate(event, 'post'),
	submit: (event) => mutate(event, 'submit'),
	pay: (event) => mutate(event, 'pay'),
	reopen: (event) => mutate(event, 'reopen'),
	amend: (event) => mutate(event, 'amend'),
	delete: (event) => mutate(event, 'delete')
};
