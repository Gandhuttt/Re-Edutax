import { building } from '$app/environment';
import type { Handle } from '@sveltejs/kit';
import { svelteKitHandler } from 'better-auth/svelte-kit';

import { auth } from '$lib/server/better-auth';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.session = await auth.api.getSession({
		headers: event.request.headers,
	});

	return svelteKitHandler({
		auth,
		event,
		resolve,
		building,
	});
};
