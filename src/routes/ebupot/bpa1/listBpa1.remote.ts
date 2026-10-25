import { getRequestEvent, query } from '$app/server';
import { listBpaRows } from '$lib/server/ebupot/listBpa';
import { error } from '@sveltejs/kit';

export const listBpa1 = query(async () => {
	const activeNpwp = getRequestEvent().locals.user?.username;
	if (!activeNpwp) error(401, 'Belum login');
	return listBpaRows('bpa1', activeNpwp);
});
