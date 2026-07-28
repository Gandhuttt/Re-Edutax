import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const isLoginPage = url.pathname === '/auth/login';

	if (!locals.user && !isLoginPage) {
		throw redirect(303, '/auth/login');
	}

	if (locals.user && isLoginPage) {
		throw redirect(303, '/');
	}

	return {
		session: locals.session,
		user: locals.user
	};
};
