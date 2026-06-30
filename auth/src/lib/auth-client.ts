import { browser } from '$app/environment';
import { createAuthClient } from 'better-auth/svelte';

let authClient: ReturnType<typeof createAuthClient> | null = null;

export function getAuthClient() {
	if (!browser) {
		throw new Error('Auth client can only be used in the browser');
	}

	authClient ??= createAuthClient({
		baseURL: `${window.location.origin}/api/auth`,
	});

	return authClient;
}
