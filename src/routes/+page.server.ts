import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

/**
 * Flag to control landing page visibility on production.
 * Set to true when ready to launch the public landing page on edutaxindo.warsidi.com.
 * Can be bypassed anytime by visiting /?landing=true.
 */
const ENABLE_LANDING_ON_PROD = false;

const PROD_DOMAINS = ['edutaxindo.warsidi.com'];

export const load: PageServerLoad = async ({ url }) => {
	const isProdDomain =
		PROD_DOMAINS.includes(url.hostname) || url.hostname.endsWith('.warsidi.com');
	const bypassFlag =
		url.searchParams.get('landing') === 'true' || url.searchParams.has('preview');

	if (isProdDomain && !ENABLE_LANDING_ON_PROD && !bypassFlag) {
		throw redirect(303, '/dashboard');
	}
};
