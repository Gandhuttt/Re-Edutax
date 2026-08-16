import { getRequestEvent } from '$app/server';
import { error } from '@sveltejs/kit';

/**
 * Better Auth stores `role` as a single value or a comma-separated list, so membership
 * has to be checked per entry rather than with a plain equality test.
 */
export const hasRole = (role: string | null | undefined, wanted: string) =>
	(role ?? '')
		.split(',')
		.map((entry) => entry.trim())
		.includes(wanted);

export const isAdmin = (user: { role?: string | null } | null | undefined) =>
	hasRole(user?.role, 'admin');

/**
 * Guards admin-only remote functions. Returns the request headers so the caller can forward
 * them to `auth.api.*` admin endpoints, which re-check the permission server side.
 */
export const requireAdmin = () => {
	const event = getRequestEvent();
	const user = event.locals.user;

	if (!user) {
		error(401, 'Belum login');
	}

	if (!isAdmin(user)) {
		error(403, 'Halaman ini hanya untuk administrator');
	}

	return { user, headers: event.request.headers };
};
