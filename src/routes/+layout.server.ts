import { isAdmin } from '$lib/server/admin';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const isLoginPage = url.pathname === '/auth/login';

	if (!locals.user && !isLoginPage) {
		throw redirect(303, '/auth/login');
	}

	const admin = isAdmin(locals.user);

	if (locals.user && isLoginPage) {
		throw redirect(303, admin ? '/admin' : '/');
	}

	// Admins have no wajib_pajak profile, so the peserta home page has nothing to show them.
	if (admin && url.pathname === '/') {
		throw redirect(303, '/admin');
	}

	return {
		session: locals.session,
		user: locals.user,
		isAdmin: admin
	};
};
