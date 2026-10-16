import { env } from '$env/dynamic/private';

/**
 * Canonical Turnstile siteverify. Fails closed: a missing secret or hostname allowlist,
 * a network error, a non-2xx response, a wrong action or an unexpected hostname all
 * reject. `TURNSTILE_HOSTNAMES` is a comma-separated allowlist of the frontend hostnames
 * (production must not list localhost).
 */
export async function verifyTurnstile(token: unknown, remoteIp: string | undefined, expectedAction: string) {
	const secret = env.TURNSTILE_SECRET_KEY;
	const allowedHostnames = (env.TURNSTILE_HOSTNAMES ?? '')
		.split(',')
		.map((hostname) => hostname.trim())
		.filter(Boolean);

	if (!secret || allowedHostnames.length === 0) return false;
	if (typeof token !== 'string' || token.length === 0 || token.length > 2048) return false;

	const body = new URLSearchParams({ secret, response: token });
	if (remoteIp) body.set('remoteip', remoteIp);

	let result: { success?: boolean; action?: string; hostname?: string };

	try {
		const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body,
			signal: AbortSignal.timeout(10_000)
		});

		if (!response.ok) return false;

		result = await response.json();
	} catch {
		return false;
	}

	return (
		result.success === true &&
		result.action === expectedAction &&
		typeof result.hostname === 'string' &&
		allowedHostnames.includes(result.hostname)
	);
}
