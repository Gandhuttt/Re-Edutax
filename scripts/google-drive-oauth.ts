import { createHash, randomBytes } from 'node:crypto';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import process from 'node:process';

// Setup and renewal for the Drive side of /daftar (docs/pendaftaran-otomatis.md).
//
//   npx tsx scripts/google-drive-oauth.ts ["Nama folder induk"]
//
// It runs the OAuth consent in your browser (loopback redirect + PKCE) and prints the refresh
// token to put in .env and in the production secrets. It needs an OAuth client of type
// "Desktop app" whose id and secret are in .env as GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET.
//
// The root folder that registrants' folders are made in is created on the first run. On later runs
// (renewal, e.g. the 7-day refresh token expiry while the OAuth app is in "Testing") it is reused
// as long as GOOGLE_DRIVE_FOLDER_ID in .env still points at it, so only the token changes.
//
// The scope is `drive.file`: the token can only see files and folders this app created, so the
// root folder has to be created by this script. An existing folder cannot be used.

try {
	process.loadEnvFile();
} catch {
	// No .env: the variables may come from the shell instead.
}

const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;

if (!clientId || !clientSecret) {
	console.error('Isi GOOGLE_OAUTH_CLIENT_ID dan GOOGLE_OAUTH_CLIENT_SECRET di .env dulu (OAuth client tipe "Aplikasi desktop").');
	process.exit(1);
}

const SCOPE = 'https://www.googleapis.com/auth/drive.file';
const WAKTU_TUNGGU_MS = 5 * 60_000;
const namaFolder = process.argv[2] ?? 'Berkas Pendaftaran Edutaxindo';

const verifier = randomBytes(32).toString('base64url');
const challenge = createHash('sha256').update(verifier).digest('base64url');
const state = randomBytes(16).toString('hex');

async function tungguKode(): Promise<{ code: string; redirectUri: string }> {
	const { promise, resolve, reject } = Promise.withResolvers<{ code: string; redirectUri: string }>();
	let redirectUri = '';

	const server = createServer((req, res) => {
		const url = new URL(req.url ?? '/', 'http://127.0.0.1');
		const jawab = (status: number, pesan: string) =>
			res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' }).end(pesan);

		if (url.pathname !== '/') return void jawab(404, 'Tidak ditemukan');

		// A request that does not carry our state is not the consent we are waiting for.
		if (url.searchParams.get('state') !== state) {
			return void jawab(400, 'State tidak cocok. Tutup tab ini dan jalankan ulang skrip.');
		}

		const galat = url.searchParams.get('error');
		const code = url.searchParams.get('code');

		clearTimeout(batas);
		server.close();

		if (galat || !code) {
			jawab(400, `Persetujuan gagal: ${galat ?? 'tidak ada kode'}`);
			return reject(new Error(`Persetujuan ditolak atau gagal: ${galat ?? 'tidak ada kode'}`));
		}

		jawab(200, 'Berhasil. Anda boleh menutup tab ini dan kembali ke terminal.');
		resolve({ code, redirectUri });
	});

	const batas = setTimeout(() => {
		server.close();
		reject(new Error('Waktu habis (5 menit) menunggu persetujuan.'));
	}, WAKTU_TUNGGU_MS);

	// Only the local machine can reach the callback; port 0 lets the OS pick a free one.
	server.listen(0, '127.0.0.1', () => {
		redirectUri = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

		const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
		url.search = new URLSearchParams({
			client_id: clientId!,
			redirect_uri: redirectUri,
			response_type: 'code',
			scope: SCOPE,
			access_type: 'offline',
			// Without prompt=consent Google only issues a refresh token on the very first consent.
			prompt: 'consent',
			code_challenge: challenge,
			code_challenge_method: 'S256',
			state
		}).toString();

		console.log('Buka alamat ini di browser, masuk dengan akun Google pemilik Drive, lalu setujui:\n');
		console.log(url.href + '\n');
		console.log('Menunggu persetujuan (maksimal 5 menit)...');
	});

	return promise;
}

async function main() {
	const { code, redirectUri } = await tungguKode();

	const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			grant_type: 'authorization_code',
			code,
			client_id: clientId!,
			client_secret: clientSecret!,
			redirect_uri: redirectUri,
			code_verifier: verifier
		})
	});
	const token = (await tokenResponse.json()) as { access_token?: string; refresh_token?: string; error?: string };

	if (!tokenResponse.ok || !token.access_token) {
		throw new Error(`Penukaran kode gagal (${tokenResponse.status} ${token.error ?? ''})`);
	}

	if (!token.refresh_token) {
		throw new Error(
			'Google tidak mengirim refresh token. Cabut akses aplikasi ini di https://myaccount.google.com/permissions lalu jalankan ulang skrip.'
		);
	}

	const auth = { Authorization: `Bearer ${token.access_token}` };
	const idLama = process.env.GOOGLE_DRIVE_FOLDER_ID;

	// Renewal: keep the folder registrants already use. The new token belongs to the same OAuth
	// client, so drive.file still sees folders this app created earlier. If the old folder is gone
	// (deleted, trashed) or unreadable, fall through and create a fresh one.
	if (idLama) {
		const lama = await fetch(
			`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(idLama)}?fields=id,name,mimeType,trashed`,
			{ headers: auth }
		);
		const info = lama.ok ? ((await lama.json()) as { id: string; name: string; mimeType: string; trashed: boolean }) : null;

		if (info && info.mimeType === 'application/vnd.google-apps.folder' && !info.trashed) {
			console.log(`\nSelesai. Folder induk "${info.name}" yang sudah ada dipakai lagi (GOOGLE_DRIVE_FOLDER_ID tidak berubah).`);
			console.log('\nGanti hanya baris ini di .env, dan di secret produksi (wrangler secret put).');
			console.log('Refresh token setara password untuk berkas yang dibuat aplikasi ini; jangan dibagikan.\n');
			console.log(`GOOGLE_OAUTH_REFRESH_TOKEN=${token.refresh_token}`);
			return;
		}

		console.log(`\nFolder induk lama (${idLama}) tidak terbaca atau sudah di sampah; membuat folder baru.`);
	}

	const folderResponse = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,webViewLink', {
		method: 'POST',
		headers: { ...auth, 'Content-Type': 'application/json' },
		body: JSON.stringify({ name: namaFolder, mimeType: 'application/vnd.google-apps.folder' })
	});

	if (!folderResponse.ok) {
		throw new Error(`Folder induk gagal dibuat (${folderResponse.status}): ${(await folderResponse.text()).slice(0, 200)}`);
	}

	const folder = (await folderResponse.json()) as { id: string; webViewLink: string };

	console.log(`\nSelesai. Folder induk "${namaFolder}" dibuat di Drive Anda: ${folder.webViewLink}`);
	console.log('\nSimpan dua baris ini di .env, dan sebagai secret produksi (wrangler secret put).');
	console.log('Refresh token setara password untuk berkas yang dibuat aplikasi ini; jangan dibagikan.\n');
	console.log(`GOOGLE_OAUTH_REFRESH_TOKEN=${token.refresh_token}`);
	console.log(`GOOGLE_DRIVE_FOLDER_ID=${folder.id}`);
}

main().catch((error) => {
	console.error(`\nGagal: ${error instanceof Error ? error.message : error}`);
	process.exit(1);
});
