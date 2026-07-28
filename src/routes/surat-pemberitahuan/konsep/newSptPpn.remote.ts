import { form, getRequestEvent } from '$app/server';
import { error, redirect } from '@sveltejs/kit';
import { getOrCreateCurrentSptPpn } from '../(form)/ppn/getOrCreateCurrentSptPpn.server';
import { getTaxpayerForSptPpn } from '../(form)/ppn/getTaxpayerForSptPpn.server';

export const newSptPpn = form(async () => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	const taxpayer = await getTaxpayerForSptPpn(activeNpwp);
	const sptPpn = await getOrCreateCurrentSptPpn(activeNpwp, taxpayer.nama);

	redirect(303, `/surat-pemberitahuan/ppn?id=${sptPpn.id}`);
});
