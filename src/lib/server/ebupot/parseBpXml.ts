import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { isValidIsoDate } from '$lib/helpers/bp-parity';
import type { BpKind } from '$lib/helpers/bp-parity';

// Primary sources: pajak.go.id/sites/default/files/2024-12/{bp21,bp26}.zip.
// Preserve case: the official BP21 and BP26 templates use different root casing.
export type BpXmlRow = {
	masaPajak: number; tahun: number; tin: string; recipientNitku: string;
	ptkp: string; certificate: string; objectCode: string; gross: number;
	deemed: number; rate: number; document: string; documentNumber: string;
	documentDate: string | null; nitku: string; withholdingDate: string | null;
	receipt: string; name: string; country: string; address: string;
	dob: string | null; birthCity: string; passport: string; kitas: string;
};
const commonFields = ['TaxPeriodMonth', 'TaxPeriodYear', 'CounterpartTin', 'TaxCertificate',
	'TaxObjectCode', 'Gross', 'Deemed', 'Rate', 'Document', 'DocumentNumber', 'DocumentDate',
	'IDPlaceOfBusinessActivity', 'WithholdingDate'];
const extraFields = {
	bp21: ['IDPlaceOfBusinessActivityOfIncomeRecipient', 'StatusTaxExemption'],
	bp26: ['CounterpartReceiptNumber', 'CounterpartName', 'CounterpartCountry', 'CounterpartAddress',
		'CounterpartDob', 'CounterpartBirthCity', 'CounterpartPassport', 'CounterpartKitas']
};
const record = (value: unknown): value is Record<string, unknown> =>
	value !== null && typeof value === 'object' && !Array.isArray(value);

export function parseBpXml(xml: string, kind: BpKind, owner: string): BpXmlRow[] {
	if (new TextEncoder().encode(xml).byteLength > 1_048_576) throw new Error('Ukuran XML maksimum 1 MiB.');
	if (/<!\s*(?:DOCTYPE|ENTITY)\b/i.test(xml)) throw new Error('DTD dan entity XML tidak diizinkan.');
	if (XMLValidator.validate(xml) !== true) throw new Error('Struktur XML tidak valid.');
	const rowTag = kind === 'bp21' ? 'Bp21' : 'BP26';
	const rootTag = `${rowTag}Bulk`;
	const listTag = `ListOf${rowTag}`;
	const parser = new XMLParser({ ignoreAttributes: false, parseTagValue: false,
		parseAttributeValue: false, trimValues: true, isArray: (name) => name === rowTag });
	const parsed = parser.parse(xml) as Record<string, unknown>;
	const roots = Object.keys(parsed).filter((key) => key !== '?xml');
	if (roots.length !== 1 || roots[0] !== rootTag || !record(parsed[rootTag])) {
		throw new Error(`Berkas harus menggunakan akar ${rootTag}, sesuai template resmi ${kind.toUpperCase()}.`);
	}
	const root = parsed[rootTag];
	if (root.TIN !== owner) throw new Error('TIN pemotong dalam XML tidak sama dengan akun aktif.');
	if (Object.keys(root).some((key) => !key.startsWith('@_') && !['TIN', listTag].includes(key))) {
		throw new Error('Elemen akar XML tidak dikenal; gunakan template BP yang sesuai.');
	}
	const list = root[listTag];
	if (!record(list) || Object.keys(list).some((key) => key !== rowTag) || !Array.isArray(list[rowTag])) {
		throw new Error(`${listTag} harus berisi satu atau lebih ${rowTag}.`);
	}
	const entries = list[rowTag];
	if (entries.length < 1 || entries.length > 100) throw new Error('Impor mendukung 1–100 bukti potong per berkas.');
	const allowed = [...commonFields, ...extraFields[kind]];
	return entries.map((entry: unknown, index: number) => {
		const fail = (message: string): never => { throw new Error(`Baris ${index + 1}: ${message}`); };
		if (!record(entry)) return fail('elemen bukti potong tidak valid.');
		for (const key of Object.keys(entry)) if (!allowed.includes(key)) fail(`elemen ${key} tidak dikenal.`);
		const text = (key: string, required = false): string => {
			const value = entry[key];
			if (value === undefined || value === '' || (record(value) && value['@_xsi:nil'] === 'true' && !value['#text'])) {
				if (required) fail(`${key} wajib diisi.`);
				return '';
			}
			if (typeof value !== 'string') return fail(`${key} harus berisi teks tunggal.`);
			if (value.length > 500) return fail(`${key} terlalu panjang (maksimum 500 karakter).`);
			return value;
		};
		const numeric = (key: string): number => {
			const value = text(key, true);
			if (!/^\d+(?:\.\d+)?$/.test(value)) return fail(`${key} harus berupa desimal nonnegatif dengan titik, tanpa pemisah ribuan.`);
			const number = Number(value);
			if (!Number.isFinite(number) || number > Number.MAX_SAFE_INTEGER) return fail(`${key} di luar batas angka aman.`);
			return number;
		};
		const date = (key: string): string | null => {
			const value = text(key);
			if (value && !isValidIsoDate(value)) return fail(`${key} harus berupa tanggal nyata YYYY-MM-DD.`);
			return value || null;
		};
		const masaPajak = numeric('TaxPeriodMonth'); const tahun = numeric('TaxPeriodYear');
		if (!Number.isInteger(masaPajak) || masaPajak < 1 || masaPajak > 12 || !Number.isInteger(tahun) || tahun < 2025 || tahun > 9999) fail('masa/tahun tidak valid; aplikasi mendukung masa mulai Januari 2025.');
		const tin = text('CounterpartTin', true);
		if (tin === owner) fail('TIN penerima tidak boleh sama dengan pemotong.');
		if (kind === 'bp21' ? !/^\d{16}$/.test(tin) : !/^[A-Za-z0-9./_\- ]{1,50}$/.test(tin)) fail('format CounterpartTin tidak valid.');
		const deemed = numeric('Deemed'); const rate = numeric('Rate'); const gross = numeric('Gross');
		if (!Number.isInteger(gross)) fail('Gross harus berupa rupiah utuh.');
		if (deemed > 100 || rate >= 1000) fail('Deemed harus 0–100 dan Rate harus kurang dari 1000.');
		const name = text('CounterpartName', kind === 'bp26');
		if (name.length > 100) fail('CounterpartName maksimum 100 karakter.');
		return { masaPajak, tahun, tin, recipientNitku: text('IDPlaceOfBusinessActivityOfIncomeRecipient'),
			ptkp: text('StatusTaxExemption').replace('/', ''), certificate: text('TaxCertificate', true),
			objectCode: text('TaxObjectCode', true), gross, deemed, rate,
			document: text('Document', true).toUpperCase(), documentNumber: text('DocumentNumber'),
			documentDate: date('DocumentDate'), nitku: text('IDPlaceOfBusinessActivity'),
			withholdingDate: date('WithholdingDate'), receipt: text('CounterpartReceiptNumber'),
			name, country: text('CounterpartCountry'), address: text('CounterpartAddress'),
			dob: date('CounterpartDob'), birthCity: text('CounterpartBirthCity'), passport: text('CounterpartPassport'), kitas: text('CounterpartKitas') };
	});
}
