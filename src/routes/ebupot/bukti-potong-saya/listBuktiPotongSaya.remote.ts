import { getRequestEvent, query } from '$app/server';
import { getBuktiPotongUntukPenerima } from '$lib/server/ebupot/getBuktiPotongUntukPenerima';
import { error } from '@sveltejs/kit';

// "Bukti Potong Saya" -- a pure recap, not a queue you act on. Per the
// real-world explanation this mirrors: a bukti potong a counterparty issues
// against your NPWP just shows up here, the same way a faktur keluaran
// lands in the buyer's Faktur Masukan -- but unlike Faktur Masukan, a
// bukti potong never needs "dikreditkan"; there is nothing to do with it
// here beyond viewing it (it gets used directly as a credit when filing
// the recipient's own annual/periodic return, via "Posting SPT" on the
// relevant SPT form -- see pph-badan/postSptPphBadan.remote.ts and
// pph-orang-pribadi/postSptPphOrangPribadi.remote.ts).
export const listBuktiPotongSaya = query(async () => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	return getBuktiPotongUntukPenerima(activeNpwp);
});
