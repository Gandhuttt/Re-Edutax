import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { isValidIsoDate } from '$lib/helpers/bp-parity';
import { ptkpEbupotValues } from '$lib/helpers/ptkp-ebupot';

// Primary source: https://pajak.go.id/sites/default/files/2024-12/bpmp.zip (bpmp.xml) and the
// XSD embedded in "BPMP Excel to XML v.3.xlsx" (pajak.go.id/sites/default/files/2025-04/).
// Root MmPayrollBulk > TIN + ListOfMmPayroll > MmPayroll*. The XSD enumerates TaxCertificate as
// N/A | DTP | ECT while the shipped sample uses ETC; both spellings map to facility 8.
export type MpXmlRow = {
	masaPajak: number; tahun: number; foreign: boolean; passport: string; tin: string;
	ptkp: (typeof ptkpEbupotValues)[number]; position: string; certificate: 'N/A' | 'DTP' | 'ETC';
	objectCode: string; gross: number; rate: number; nitku: string; withholdingDate: string;
};
const fields = ['TaxPeriodMonth', 'TaxPeriodYear', 'CounterpartOpt', 'CounterpartPassport',
	'CounterpartTin', 'StatusTaxExemption', 'Position', 'TaxCertificate', 'TaxObjectCode', 'Gross',
	'Rate', 'IDPlaceOfBusinessActivity', 'WithholdingDate'];
const certificates: Record<string, MpXmlRow['certificate']> = { 'N/A': 'N/A', DTP: 'DTP', ETC: 'ETC', ECT: 'ETC' };
const record = (value: unknown): value is Record<string, unknown> =>
	value !== null && typeof value === 'object' && !Array.isArray(value);

export function parseMpXml(xml: string, owner: string): MpXmlRow[] {
	if (new TextEncoder().encode(xml).byteLength > 1_048_576) throw new Error('Ukuran XML maksimum 1 MiB.');
	if (/<!\s*(?:DOCTYPE|ENTITY)\b/i.test(xml)) throw new Error('DTD dan entity XML tidak diizinkan.');
	if (XMLValidator.validate(xml) !== true) throw new Error('Struktur XML tidak valid.');
	const parser = new XMLParser({ ignoreAttributes: false, parseTagValue: false,
		parseAttributeValue: false, trimValues: true, isArray: (name) => name === 'MmPayroll' });
	const parsed = parser.parse(xml) as Record<string, unknown>;
	const roots = Object.keys(parsed).filter((key) => key !== '?xml');
	if (roots.length !== 1 || roots[0] !== 'MmPayrollBulk' || !record(parsed.MmPayrollBulk)) {
		throw new Error('Berkas harus menggunakan akar MmPayrollBulk, sesuai template resmi MP (bpmp.zip).');
	}
	const root = parsed.MmPayrollBulk;
	if (root.TIN !== owner) throw new Error('TIN pemotong dalam XML tidak sama dengan akun aktif.');
	if (Object.keys(root).some((key) => !key.startsWith('@_') && !['TIN', 'ListOfMmPayroll'].includes(key))) {
		throw new Error('Elemen akar XML tidak dikenal; gunakan template MP resmi.');
	}
	const list = root.ListOfMmPayroll;
	if (!record(list) || Object.keys(list).some((key) => key !== 'MmPayroll') || !Array.isArray(list.MmPayroll)) {
		throw new Error('ListOfMmPayroll harus berisi satu atau lebih MmPayroll.');
	}
	const entries = list.MmPayroll;
	if (entries.length < 1 || entries.length > 100) throw new Error('Impor mendukung 1–100 bukti potong per berkas.');
	return entries.map((entry: unknown, index: number) => {
		const fail = (message: string): never => { throw new Error(`Baris ${index + 1}: ${message}`); };
		if (!record(entry)) return fail('elemen bukti potong tidak valid.');
		for (const key of Object.keys(entry)) if (!fields.includes(key)) fail(`elemen ${key} tidak dikenal.`);
		const text = (key: string, required = false): string => {
			const value = entry[key];
			if (value === undefined || value === '' || (record(value) && value['@_xsi:nil'] === 'true' &&
				Object.keys(value).every((name) => name === '@_xsi:nil'))) {
				if (required) fail(`${key} wajib diisi.`);
				return '';
			}
			if (typeof value !== 'string') return fail(`${key} harus berisi teks tunggal.`);
			if (value.length > 500) return fail(`${key} terlalu panjang (maksimum 500 karakter).`);
			return value;
		};
		const integer = (key: string): number => {
			const value = text(key, true);
			if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value))) return fail(`${key} harus berupa bilangan bulat nonnegatif tanpa pemisah ribuan.`);
			return Number(value);
		};
		const masaPajak = integer('TaxPeriodMonth'); const tahun = integer('TaxPeriodYear');
		if (masaPajak < 1 || masaPajak > 12 || tahun < 2025 || tahun > 9999) fail('masa/tahun tidak valid; aplikasi mendukung masa mulai Januari 2025.');
		const opt = text('CounterpartOpt', true);
		if (opt !== 'Resident' && opt !== 'Foreign') fail('CounterpartOpt harus Resident atau Foreign.');
		const passport = text('CounterpartPassport');
		if (opt === 'Foreign' && !passport) fail('CounterpartPassport wajib diisi untuk pegawai asing.');
		if (opt === 'Resident' && passport) fail('CounterpartPassport hanya untuk pegawai asing.');
		const tin = text('CounterpartTin', true);
		if (!/^\d{16}$/.test(tin) || tin === owner) fail('CounterpartTin harus 16 digit dan berbeda dari TIN pemotong.');
		const ptkp = text('StatusTaxExemption', true).replace('/', '');
		if (!ptkpEbupotValues.includes(ptkp as (typeof ptkpEbupotValues)[number])) fail('StatusTaxExemption tidak valid.');
		const position = text('Position', true);
		if (position.length > 100) fail('Position maksimum 100 karakter.');
		const certificate = certificates[text('TaxCertificate', true)];
		if (!certificate) fail('TaxCertificate harus N/A, DTP, atau ETC.');
		const gross = text('Gross', true); const rate = text('Rate', true);
		if (!/^\d+$/.test(gross) || !Number.isSafeInteger(Number(gross)) || Number(gross) <= 0) fail('Gross harus rupiah utuh lebih dari 0.');
		if (!/^\d+(?:\.\d+)?$/.test(rate) || Number(rate) > 100) fail('Rate harus desimal 0–100 dengan titik.');
		const branch = text('IDPlaceOfBusinessActivity', true);
		// Coretax's own template uses the six-digit branch suffix; also accept full NITKU.
		if (!/^(?:\d{6}|\d{22})$/.test(branch)) fail('IDPlaceOfBusinessActivity harus 6 digit subunit atau 22 digit NITKU.');
		const nitku = branch.length === 6 ? owner + branch : branch;
		const withholdingDate = text('WithholdingDate', true);
		if (!isValidIsoDate(withholdingDate)) fail('WithholdingDate harus berupa tanggal nyata YYYY-MM-DD.');
		return { masaPajak, tahun, foreign: opt === 'Foreign', passport, tin,
			ptkp: ptkp as MpXmlRow['ptkp'], position, certificate, objectCode: text('TaxObjectCode', true),
			gross: Number(gross), rate: Number(rate), nitku, withholdingDate };
	});
}
