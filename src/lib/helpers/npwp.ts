/**
 * Simulated NPWPs follow the 16-digit NIK layout (6 wilayah + 6 tanggal lahir + 4 nomor urut)
 * so they look plausible in the app, but the leading two digits are deliberately 00/01 —
 * real province codes run 11-96, so these can never collide with an actual NIK.
 *
 *   batched : 00 0000 00000 H BB NN   -> batch 16 peserta 1 = 0000000000001601
 *   lone    : 01 0000 000000 SSSS     -> serial 1           = 0100000000000001
 *
 * Digits 13-14 are reserved for the batch number, which is why peserta without a batch are
 * numbered from a separate population instead of being given a made-up batch. Digit 12 — the
 * last digit of the unused tanggal-lahir block — carries the hundreds of the batch number, so
 * batches run 1-999. Batches below 100 have a 0 there, which is why every number issued
 * before that extension stays valid and unchanged.
 *
 * Peserta seeded before this scheme keep their old `33...` numbers; digits 12-16 mean the same
 * thing there, so the parse helpers work for both. A number is never reissued once handed out
 * — see the npwp_terbit ledger.
 */
export const npwpBatchedPrefix = '00000000000';
export const npwpLonePrefix = '010000000000';

const pad = (value: number, length: number) => String(value).padStart(length, '0');

export const npwpForBatch = (nomorBatch: number, urut: number) =>
	`${npwpBatchedPrefix}${Math.floor(nomorBatch / 100)}${pad(nomorBatch % 100, 2)}${pad(urut, 2)}`;

export const npwpForLone = (serial: number) => `${npwpLonePrefix}${pad(serial, 4)}`;

/** Batch number encoded in digit 12 (hundreds) + digits 13-14, old or new numbers alike. */
export const batchNumberFromNpwp = (npwp: string) => {
	if (npwp.length !== 16) return Number.NaN;

	const ratusan = Number(npwp.slice(11, 12));
	const sisa = Number(npwp.slice(12, 14));

	return Number.isNaN(ratusan) || Number.isNaN(sisa) ? Number.NaN : ratusan * 100 + sisa;
};

/** Peserta number within the batch, encoded in digits 15-16. */
export const urutFromNpwp = (npwp: string) =>
	npwp.length === 16 ? Number(npwp.slice(14, 16)) : Number.NaN;

export const serialFromLoneNpwp = (npwp: string) =>
	npwp.length === 16 ? Number(npwp.slice(12, 16)) : Number.NaN;

export const isLoneNpwp = (npwp: string) => npwp.startsWith(npwpLonePrefix);

export const maxBatchNumber = 999;
export const maxUrutPerBatch = 99;
export const maxLoneSerial = 9999;
