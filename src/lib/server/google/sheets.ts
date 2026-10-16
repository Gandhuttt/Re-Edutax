import { env } from '$env/dynamic/private';
import { getGoogleAccessToken } from './auth';

const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets';

/** Column order of the sheet's header row; see docs/pendaftaran-otomatis.md. */
export const SHEETS_KOLOM = [
	'Waktu (WIB)',
	'Nama',
	'Email',
	'Tahun Lahir',
	'Nomor Telepon',
	'Pendidikan Terakhir',
	'Bidang Keilmuan',
	'Pekerjaan',
	'Bidang Usaha',
	'Alamat Domisili',
	'Kota/Kabupaten',
	'Provinsi',
	'Pilihan Kelas',
	'Batch',
	'NPWP (NIK untuk batch baru)',
	'Folder Berkas'
] as const;

export async function appendSheetsRow(values: string[]): Promise<void> {
	const spreadsheetId = env.GOOGLE_SHEETS_ID;

	if (!spreadsheetId) {
		throw new Error('GOOGLE_SHEETS_ID belum diset');
	}

	if (values.length !== SHEETS_KOLOM.length) {
		throw new Error(`Baris Sheets harus ${SHEETS_KOLOM.length} kolom, bukan ${values.length}`);
	}

	const range = env.GOOGLE_SHEETS_RANGE || 'Pendaftaran!A:P';
	const token = await getGoogleAccessToken(SHEETS_SCOPE);

	// RAW, not USER_ENTERED: a nama or alamat starting with "=" would otherwise be
	// evaluated as a formula by Sheets, and a phone number would lose its leading zero.
	const response = await fetch(
		`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
		{
			method: 'POST',
			headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
			body: JSON.stringify({ values: [values] }),
			signal: AbortSignal.timeout(15_000)
		}
	);

	if (!response.ok) {
		throw new Error(`Sheets ${response.status}: ${(await response.text()).slice(0, 300)}`);
	}
}
