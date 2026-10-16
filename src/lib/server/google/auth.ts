import { env } from '$env/dynamic/private';

// The official google-auth-library needs Node APIs the Worker runtime does not provide,
// so the OAuth 2.0 service-account flow (RFC 7523 JWT bearer grant) is done directly with
// WebCrypto.

type ServiceAccount = { client_email: string; private_key: string };

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const REFRESH_MARGIN_MS = 60_000;

const tokenCache = new Map<string, { token: string; expiresAt: number }>();
let signingKey: { pem: string; key: Promise<CryptoKey> } | null = null;

function readServiceAccount(): ServiceAccount {
	const raw = env.GOOGLE_SERVICE_ACCOUNT_JSON;

	if (!raw) {
		throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON belum diset');
	}

	const parsed = JSON.parse(raw) as Partial<ServiceAccount>;

	if (!parsed.client_email || !parsed.private_key) {
		throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON tidak memuat client_email dan private_key');
	}

	return { client_email: parsed.client_email, private_key: parsed.private_key };
}

function base64Url(input: string | ArrayBuffer) {
	const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : new Uint8Array(input);
	let binary = '';

	for (const byte of bytes) binary += String.fromCharCode(byte);

	return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function importPrivateKey(pem: string) {
	if (signingKey?.pem === pem) return signingKey.key;

	const body = pem.replace(/-----(BEGIN|END) PRIVATE KEY-----/g, '').replace(/\s+/g, '');
	const der = Uint8Array.from(atob(body), (char) => char.charCodeAt(0));
	const key = crypto.subtle.importKey(
		'pkcs8',
		der,
		{ name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
		false,
		['sign']
	);

	signingKey = { pem, key };

	return key;
}

export async function getGoogleAccessToken(scope: string): Promise<string> {
	const cached = tokenCache.get(scope);

	if (cached && cached.expiresAt - REFRESH_MARGIN_MS > Date.now()) {
		return cached.token;
	}

	const account = readServiceAccount();
	const issuedAt = Math.floor(Date.now() / 1000);
	const unsigned = `${base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))}.${base64Url(
		JSON.stringify({
			iss: account.client_email,
			scope,
			aud: TOKEN_URL,
			iat: issuedAt,
			exp: issuedAt + 3600
		})
	)}`;
	const signature = await crypto.subtle.sign(
		'RSASSA-PKCS1-v1_5',
		await importPrivateKey(account.private_key),
		new TextEncoder().encode(unsigned)
	);

	const response = await fetch(TOKEN_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
			assertion: `${unsigned}.${base64Url(signature)}`
		}),
		signal: AbortSignal.timeout(10_000)
	});

	if (!response.ok) {
		throw new Error(`Token Google ditolak (${response.status})`);
	}

	const { access_token, expires_in } = (await response.json()) as {
		access_token: string;
		expires_in: number;
	};

	tokenCache.set(scope, { token: access_token, expiresAt: Date.now() + expires_in * 1000 });

	return access_token;
}
