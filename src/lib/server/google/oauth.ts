import { env } from '$env/dynamic/private';

// Drive is accessed as a real Google account, not as the service account. A service account
// has no storage quota, so it can only write into a Shared Drive (Google Workspace); on a
// personal account the files must be owned by the account's own Drive. The refresh token comes
// from scripts/google-drive-oauth.ts with the narrow `drive.file` scope: the token can only
// touch files and folders this app created, never the rest of the owner's Drive.

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const REFRESH_MARGIN_MS = 60_000;

let cached: { token: string; expiresAt: number } | null = null;

export async function getDriveAccessToken(): Promise<string> {
	if (cached && cached.expiresAt - REFRESH_MARGIN_MS > Date.now()) {
		return cached.token;
	}

	const clientId = env.GOOGLE_OAUTH_CLIENT_ID;
	const clientSecret = env.GOOGLE_OAUTH_CLIENT_SECRET;
	const refreshToken = env.GOOGLE_OAUTH_REFRESH_TOKEN;

	if (!clientId || !clientSecret || !refreshToken) {
		throw new Error('GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, dan GOOGLE_OAUTH_REFRESH_TOKEN belum diset');
	}

	const response = await fetch(TOKEN_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			grant_type: 'refresh_token',
			client_id: clientId,
			client_secret: clientSecret,
			refresh_token: refreshToken
		}),
		signal: AbortSignal.timeout(10_000)
	});

	if (!response.ok) {
		const { error } = (await response.json().catch(() => ({}))) as { error?: string };

		// invalid_grant is the one a person has to act on: the token was revoked, or has expired
		// (an OAuth app left in "Testing" expires its refresh tokens after 7 days).
		throw new Error(
			error === 'invalid_grant'
				? 'Refresh token Google Drive ditolak (invalid_grant): dicabut atau kedaluwarsa. Jalankan ulang scripts/google-drive-oauth.ts'
				: `Token Google Drive ditolak (${response.status}${error ? ` ${error}` : ''})`
		);
	}

	const { access_token, expires_in } = (await response.json()) as { access_token: string; expires_in: number };

	cached = { token: access_token, expiresAt: Date.now() + expires_in * 1000 };

	return access_token;
}
