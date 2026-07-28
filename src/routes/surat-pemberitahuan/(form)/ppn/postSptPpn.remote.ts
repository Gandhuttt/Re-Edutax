import { form, getRequestEvent } from '$app/server';
import { SptPpnBlobSchema } from '$lib/schemas/surat-pemberitahuan/spt-ppn';
import { error } from '@sveltejs/kit';
import * as v from 'valibot';
import { createPostedSptPpnBlob } from './createPostedSptPpnBlob.server';
import { getOwnedSptPpn } from './getOwnedSptPpn.server';

const SptPpnIdSchema = v.object({
	id: v.string()
});

export const postSptPpn = form(SptPpnIdSchema, async ({ id }) => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	const sptPpn = await getOwnedSptPpn(id, activeNpwp);

	if (sptPpn.status !== 'konsep') {
		error(400, 'SPT yang sudah dilaporkan tidak dapat diposting ulang');
	}

	const blob = await createPostedSptPpnBlob({
		npwp: activeNpwp,
		periodeBulan: sptPpn.masaPajak,
		periodeTahun: sptPpn.tahun,
		existingBlob: v.parse(SptPpnBlobSchema, sptPpn.blob)
	});

	return { blob };
});
