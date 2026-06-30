import { browser } from '$app/environment';
import { createAuthClient } from 'better-auth/svelte';
import { inferAdditionalFields } from 'better-auth/client/plugins';
import type { auth } from '$lib/server/better-auth';

function createClient() {
	return createAuthClient({
		baseURL: browser ? `${window.location.origin}/api/auth` : undefined,
		plugins: [
			inferAdditionalFields<typeof auth>()
		]
	});
}

let authClient: ReturnType<typeof createClient> | null = null;

export function getAuthClient() {
	if (!browser) {
		throw new Error('Auth client can only be used in the browser');
	}

	if (!authClient) {
		authClient = createClient();
	}

	return authClient;
}
