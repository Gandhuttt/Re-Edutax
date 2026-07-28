import { getRequestEvent, query } from '$app/server';
import { SptPpnBlobSchema } from '$lib/schemas/surat-pemberitahuan/spt-ppn';
import { error } from '@sveltejs/kit';
import * as v from 'valibot';
import { getOrCreateCurrentSptPpn } from './getOrCreateCurrentSptPpn.server';
import { getOwnedSptPpn } from './getOwnedSptPpn.server';
import { getTaxpayerForSptPpn } from './getTaxpayerForSptPpn.server';

export const getSptPpn = query(async () => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;
	const requestedId = event.url.searchParams.get('id');

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	const taxpayer = await getTaxpayerForSptPpn(activeNpwp);
	const sptPpn = requestedId
		? await getOwnedSptPpn(requestedId, activeNpwp)
		: await getOrCreateCurrentSptPpn(activeNpwp, taxpayer.nama);

	return {
		id: sptPpn.id,
		status: sptPpn.status,
		readonly: sptPpn.status !== 'konsep',
		taxpayer,
		blob: v.parse(SptPpnBlobSchema, sptPpn.blob)
	};
});
