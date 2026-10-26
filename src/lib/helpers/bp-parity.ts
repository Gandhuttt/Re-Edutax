// Pure, browser-safe helpers shared by BP21/BP26 forms, registry and remotes.
// No server/runtime dependencies; time is injectable for edge-case testing.

export const bpStatusValues = [
	'NORMAL',
	'SAVEDINVALID',
	'SUBMITTED',
	'AMENDMENT',
	'AMENDED',
	'CANCELLED',
	'DELETED'
] as const;

export type BpStatus = (typeof bpStatusValues)[number];
export type BpKind = 'bp21' | 'bp26';
/** Annual recaps sharing the BP21/BP26 list lifecycle, keyed by their period end. */
export type BpaKind = 'bpa1' | 'bpa2';
export type MpKind = 'mp';
export type BpLifecycleKind = BpKind | BpaKind | MpKind;

const MIN_YEAR = 2025;
const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000;
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const PERIOD_MIN_YEARS_BACK = 5;

const monthNames = [
	'Januari',
	'Februari',
	'Maret',
	'April',
	'Mei',
	'Juni',
	'Juli',
	'Agustus',
	'September',
	'Oktober',
	'November',
	'Desember'
];

const pad2 = (n: number) => (n < 10 ? `0${n}` : String(n));
const pad4 = (n: number) => String(n).padStart(4, '0');

const daysInMonth = (tahun: number, masaPajak: number) => {
	if (masaPajak === 2) {
		const leap = (tahun % 4 === 0 && tahun % 100 !== 0) || tahun % 400 === 0;
		return leap ? 29 : 28;
	}
	return masaPajak === 4 || masaPajak === 6 || masaPajak === 9 || masaPajak === 11 ? 30 : 31;
};

const isValidMonth = (tahun: number, masaPajak: number) =>
	Number.isInteger(tahun) &&
	Number.isInteger(masaPajak) &&
	tahun >= 1 &&
	tahun <= 9999 &&
	masaPajak >= 1 &&
	masaPajak <= 12;

// Today's calendar date (YYYY-MM-DD) in Asia/Jakarta (UTC+7, no DST), independent
// of the machine/browser timezone.
export const todayIso = (now: Date = new Date()): string =>
	new Date(now.getTime() + JAKARTA_OFFSET_MS).toISOString().slice(0, 10);

// Month index (year * 12 + month - 1) of the current Asia/Jakarta month.
const currentMonthIndex = (now: Date) => {
	const shifted = new Date(now.getTime() + JAKARTA_OFFSET_MS);
	return shifted.getUTCFullYear() * 12 + shifted.getUTCMonth();
};

export const periodEnd = (tahun: number, masaPajak: number): string => {
	if (!isValidMonth(tahun, masaPajak)) {
		throw new RangeError('Masa pajak tidak valid');
	}
	return `${pad4(tahun)}-${pad2(masaPajak)}-${pad2(daysInMonth(tahun, masaPajak))}`;
};

export const isValidIsoDate = (value: string): boolean => {
	if (typeof value !== 'string') return false;
	const match = ISO_DATE.exec(value);
	if (!match) return false;
	const tahun = Number(match[1]);
	const bulan = Number(match[2]);
	const hari = Number(match[3]);
	if (tahun < 1 || bulan < 1 || bulan > 12) return false;
	return hari >= 1 && hari <= daysInMonth(tahun, bulan);
};

export const isDateInPeriod = (date: string, tahun: number, masaPajak: number): boolean => {
	if (!isValidIsoDate(date) || !isValidMonth(tahun, masaPajak)) return false;
	return date.startsWith(`${pad4(tahun)}-${pad2(masaPajak)}-`);
};

// Allowed range: >= Jan 2025 and >= (current month - 5 years), through the
// current month.
const allowedRange = (now: Date) => {
	const current = currentMonthIndex(now);
	return { min: Math.max(MIN_YEAR * 12, current - PERIOD_MIN_YEARS_BACK * 12), max: current };
};

export const isAllowedPeriod = (tahun: number, masaPajak: number, now: Date = new Date()): boolean => {
	if (!isValidMonth(tahun, masaPajak)) return false;
	const index = tahun * 12 + masaPajak - 1;
	const { min, max } = allowedRange(now);
	return index >= min && index <= max;
};

// Newest first.
export const periodOptions = (now: Date = new Date()): { tahun: number; masaPajak: number; label: string }[] => {
	const { min, max } = allowedRange(now);
	const options: { tahun: number; masaPajak: number; label: string }[] = [];
	for (let index = max; index >= min; index--) {
		const tahun = Math.floor(index / 12);
		const masaPajak = (index % 12) + 1;
		options.push({ tahun, masaPajak, label: `${monthNames[masaPajak - 1]} ${tahun}` });
	}
	return options;
};

export type BpObjectAvailabilityInput = {
	aktif?: boolean;
	validFrom?: string | null;
	validTo?: string | null;
	parameterData: {
		ItemList: { TaxCertificateCode?: string; TaxCertificateCodes?: string[] }[];
	};
};

// Available when active, valid on the (inclusive) period end date, and carrying an
// ItemList entry for the facility. Null validity bounds mean unknown/unbounded.
export const isObjectAvailable = (
	object: BpObjectAvailabilityInput,
	facilityCode: string,
	tahun: number,
	masaPajak: number
): boolean => {
	if (object.aktif === false) return false;
	if (!isValidMonth(tahun, masaPajak)) return false;
	const end = periodEnd(tahun, masaPajak);
	if (object.validFrom && object.validFrom > end) return false;
	if (object.validTo && object.validTo < end) return false;
	return object.parameterData.ItemList.some(
		(entry) =>
			entry.TaxCertificateCode === facilityCode ||
			(entry.TaxCertificateCodes?.includes(facilityCode) ?? false)
	);
};
