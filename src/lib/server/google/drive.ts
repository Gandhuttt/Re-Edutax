import { getDriveAccessToken } from './oauth';

const FOLDER_MIME = 'application/vnd.google-apps.folder';

async function driveFetch(url: string, init: RequestInit): Promise<Response> {
	const token = await getDriveAccessToken();
	const response = await fetch(url, {
		...init,
		headers: { ...init.headers, Authorization: `Bearer ${token}` },
		signal: AbortSignal.timeout(60_000)
	});

	if (!response.ok) {
		throw new Error(`Drive ${response.status}: ${(await response.text()).slice(0, 300)}`);
	}

	return response;
}

/** Drive rejects nothing here, but "/" and control characters make folders hard to browse. */
export function safeDriveName(name: string) {
	return (
		// eslint-disable-next-line no-control-regex
		name.replace(/[\u0000-\u001f\u007f/\\]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80) ||
		'tanpa-nama'
	);
}

export type DriveFolder = { id: string; url: string };

/** `parentId` must be a folder this app created (see scripts/google-drive-oauth.ts): `drive.file` cannot see others. */
export async function createDriveFolder(name: string, parentId: string): Promise<DriveFolder> {
	const response = await driveFetch('https://www.googleapis.com/drive/v3/files?fields=id,webViewLink', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ name: safeDriveName(name), mimeType: FOLDER_MIME, parents: [parentId] })
	});
	const { id, webViewLink } = (await response.json()) as { id: string; webViewLink: string };

	return { id, url: webViewLink };
}

export async function uploadDriveFile(folderId: string, name: string, file: Blob, mimeType: string) {
	const boundary = `edutax-${crypto.randomUUID()}`;
	// A Blob body keeps the file out of an extra in-memory copy; the Worker has 128 MB.
	const body = new Blob([
		`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n`,
		JSON.stringify({ name, parents: [folderId] }),
		`\r\n--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`,
		file,
		`\r\n--${boundary}--`
	]);

	await driveFetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
		method: 'POST',
		headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
		body
	});
}

/** Permanent delete. The account owns what the app created, so no extra role is needed. */
export async function deleteDriveFile(id: string) {
	await driveFetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}`, {
		method: 'DELETE'
	});
}
