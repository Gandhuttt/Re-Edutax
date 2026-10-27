import { error, fail, redirect, type RequestEvent } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { SptUnifikasiError } from '$lib/helpers/spt-unifikasi';
import {
	getSptUnifikasi,
	refreshSptUnifikasi,
	submitSptUnifikasi,
	paySptUnifikasi,
	reopenSptUnifikasi,
	amendSptUnifikasi,
	deleteSptUnifikasi
} from '$lib/server/spt-unifikasi';

const BASE = '/surat-pemberitahuan/pph-unifikasi';

function context(event: RequestEvent) {
	const owner = event.locals.user?.username;
	if (!owner) error(401, 'Silakan masuk terlebih dahulu.');
	const id = event.url.searchParams.get('id');
	if (!id) error(400, 'Pilih konsep SPT Masa PPh Unifikasi terlebih dahulu.');
	return { owner, id };
}

const notices: Record<string, string> = {
	refreshed: 'Data BPPU berhasil diperbarui. Periksa ringkasan snapshot sebelum menyampaikan SPT.',
	submitted: 'Penyampaian simulasi berhasil diproses. Periksa status SPT dan kewajiban pembayaran.',
	reported: 'SPT simulasi berstatus dilaporkan. Tidak ada kewajiban pembayaran yang harus disetor.',
	paid: 'Pembayaran simulasi selesai. SPT berstatus dilaporkan.',
	reopened: 'SPT dikembalikan ke konsep. Perbarui data BPPU, periksa snapshot, lalu sampaikan kembali.',
	amended: 'Konsep pembetulan baru berhasil dibuat. Perbarui data BPPU sebelum menyampaikan.'
};

export const load: PageServerLoad = async (event) => {
	const { owner, id } = context(event);
	try {
		return { detail: await getSptUnifikasi(owner, id), notice: notices[event.url.searchParams.get('done') ?? ''] ?? null };
	} catch (cause) {
		if (cause instanceof SptUnifikasiError) error(cause.status, cause.message);
		throw cause;
	}
};

type Action = 'refresh' | 'submit' | 'pay' | 'reopen' | 'amend' | 'delete';

async function mutate(event: RequestEvent, action: Action) {
	const { owner, id } = context(event);
	let nextId = id;
	let done: string = action;
	try {
		if (action === 'submit') {
			const form = await event.request.formData();
			const pernyataan = ['true', 'on'].includes(String(form.get('pernyataan') ?? ''));
			const rawRevision = String(form.get('revision') ?? '').trim();
			const revision = Number(rawRevision);
			if (!pernyataan) throw new SptUnifikasiError('Centang pernyataan sebelum menyampaikan SPT.');
			if (!/^\d+$/.test(rawRevision) || !Number.isSafeInteger(revision)) throw new SptUnifikasiError('Revisi SPT tidak valid. Muat ulang halaman lalu coba lagi.');
			await submitSptUnifikasi(owner, id, true, revision);
			done = (await getSptUnifikasi(owner, id)).status === 'dilaporkan' ? 'reported' : 'submitted';
		} else if (action === 'refresh') {
			await refreshSptUnifikasi(owner, id);
			done = 'refreshed';
		} else if (action === 'pay') {
			await paySptUnifikasi(owner, id);
			done = 'paid';
		} else if (action === 'reopen') {
			await reopenSptUnifikasi(owner, id);
			done = 'reopened';
		} else if (action === 'amend') {
			nextId = await amendSptUnifikasi(owner, id);
			done = 'amended';
		} else await deleteSptUnifikasi(owner, id);
	} catch (cause) {
		if (cause instanceof SptUnifikasiError) return fail(cause.status, { message: cause.message });
		throw cause;
	}
	if (action === 'delete') redirect(303, '/surat-pemberitahuan/konsep');
	redirect(303, `${BASE}?id=${encodeURIComponent(nextId)}&done=${done}`);
}

export const actions: Actions = {
	refresh: (event) => mutate(event, 'refresh'),
	submit: (event) => mutate(event, 'submit'),
	pay: (event) => mutate(event, 'pay'),
	reopen: (event) => mutate(event, 'reopen'),
	amend: (event) => mutate(event, 'amend'),
	delete: (event) => mutate(event, 'delete')
};
