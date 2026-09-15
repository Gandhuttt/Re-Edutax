import { building } from '$app/environment';
import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import type { Handle, HandleServerError } from '@sveltejs/kit';

export const handleError: HandleServerError = ({ error, event }) => {
	const referenceId = crypto.randomUUID();

	console.error(`[${referenceId}] ${event.request.method} ${event.url.pathname}`, error);

	return {
		message: 'Layanan sedang mengalami gangguan. Coba kembali beberapa saat lagi.',
		referenceId
	};
};

export const handle: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	event.locals.session = session?.session ?? null;
	event.locals.user = session?.user ?? null;

	return svelteKitHandler({ event, resolve, auth, building });
};
