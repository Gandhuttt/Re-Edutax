import { isAdmin } from '$lib/server/admin';
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	// The root layout already redirects anonymous visitors to /auth/login; here only the
	// role matters, and a peserta poking at /admin should be told no rather than bounced.
	if (!isAdmin(locals.user)) {
		error(403, 'Halaman ini hanya untuk administrator');
	}

	return {};
};
