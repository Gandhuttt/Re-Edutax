import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { BPA_MAX_ANNUALIZED_MONTHS } from '$lib/helpers/bpa-calc';
import { isValidIsoDate } from '$lib/helpers/bp-parity';
import type { BpaKind } from '$lib/helpers/bp-parity';
import { bpa1PtkpValues } from '$lib/helpers/ptkp-bpa1';
import type { Bpa1Ptkp } from '$lib/helpers/ptkp-bpa1';

type WithholdingStatus = 'KURANG_SETAHUN' | 'KURANG_SETAHUN_DISETAHUNKAN' | 'SETAHUN_PENUH';
export type BpaXmlRow = {
	masaPajakAwal: number; masaPajakAkhir: number; tahun: number; tin: string;
	secondEmployer: boolean; foreign: boolean; passport: string; ptkp: Bpa1Ptkp;
	position: string; nip: string; rank: string; objectCode: string;
	withholdingStatus: WithholdingStatus; months: number | null; grossUp: boolean;
	salary: number; incomeTaxBenefit: number; otherBenefit: number; honorarium: number;
	insurance: number; natura: number; bonus: number; wifeBenefit: number; childBenefit: number;
	incomeImprovement: number; structuralBenefit: number; riceBenefit: number; otherRegular: number;
	pensionContribution: number; zakat: number; previousSlip: string; certificate: string;
	article21IncomeTax: number; nitku: string; withholdingDate: string;
};
const commonFields = ['WorkForSecondEmployer', 'TaxPeriodMonthStart', 'TaxPeriodMonthEnd',
	'TaxPeriodYear', 'CounterpartTin', 'TaxExemptOpt', 'StatusOfWithholding', 'CounterpartPosition',
	'TaxObjectCode', 'NumberOfMonths', 'SalaryPensionJhtTht', 'OtherBenefit',
	'PensionContributionJhtThtFee', 'Zakat', 'PrevWhTaxSlip', 'Article21IncomeTax',
	'IDPlaceOfBusinessActivity', 'WithholdingDate'];
const extraFields = {
	bpa1: ['CounterpartOpt', 'CounterpartPassport', 'GrossUpOpt', 'IncomeTaxBenefit',
		'Honorarium', 'InsurancePaidByEmployer', 'Natura', 'TantiemBonusThr', 'TaxCertificate'],
	bpa2: ['CounterpartNipNrp', 'CounterpartRank', 'WifeBenefit', 'ChildBenefit',
		'IncomeImprovementBenefit', 'StructuralFunctionalBenefit', 'RiceBenefit', 'OtherRegularIncome']
};
const statuses: Record<string, WithholdingStatus> = {
	PartialYear: 'KURANG_SETAHUN', Annualized: 'KURANG_SETAHUN_DISETAHUNKAN', FullYear: 'SETAHUN_PENUH'
};
const record = (value: unknown): value is Record<string, unknown> =>
	value !== null && typeof value === 'object' && !Array.isArray(value);

/** Official DJP bpa1.zip / bpa2.zip use A1Bulk/A2Bulk, not BPA1Bulk/BPA2Bulk. */
export function parseBpaXml(xml: string, kind: BpaKind, owner: string): BpaXmlRow[] {
	if (new TextEncoder().encode(xml).byteLength > 1_048_576) throw new Error('Ukuran XML maksimum 1 MiB.');
	if (/<!\s*(?:DOCTYPE|ENTITY)\b/i.test(xml)) throw new Error('DTD dan entity XML tidak diizinkan.');
	if (XMLValidator.validate(xml) !== true) throw new Error('Struktur XML tidak valid.');
	const tag = kind === 'bpa1' ? 'A1' : 'A2';
	const rootTag = `${tag}Bulk`; const listTag = `ListOf${tag}`;
	const parser = new XMLParser({ ignoreAttributes: false, parseTagValue: false,
		parseAttributeValue: false, trimValues: true, isArray: (name) => name === tag });
	const parsed = parser.parse(xml) as Record<string, unknown>;
	const roots = Object.keys(parsed).filter((key) => key !== '?xml');
	if (roots.length !== 1 || roots[0] !== rootTag || !record(parsed[rootTag])) {
		throw new Error(`Berkas harus menggunakan akar ${rootTag}, sesuai template resmi ${kind.toUpperCase()}.`);
	}
	const root = parsed[rootTag];
	if (root.TIN !== owner) throw new Error('TIN pemotong dalam XML tidak sama dengan akun aktif.');
	if (Object.keys(root).some((key) => !key.startsWith('@_') && !['TIN', listTag].includes(key))) {
		throw new Error('Elemen akar XML tidak dikenal; gunakan template BPA yang sesuai.');
	}
	const list = root[listTag];
	if (!record(list) || Object.keys(list).some((key) => key !== tag) || !Array.isArray(list[tag])) {
		throw new Error(`${listTag} harus berisi satu atau lebih ${tag}.`);
	}
	const entries = list[tag];
	if (entries.length < 1 || entries.length > 100) throw new Error('Impor mendukung 1–100 bukti potong per berkas.');
	const allowed = [...commonFields, ...extraFields[kind]];
	return entries.map((entry: unknown, index: number) => {
		const fail = (message: string): never => { throw new Error(`Baris ${index + 1}: ${message}`); };
		if (!record(entry)) return fail('elemen bukti potong tidak valid.');
		for (const key of Object.keys(entry)) if (!allowed.includes(key)) fail(`elemen ${key} tidak dikenal.`);
		const text = (key: string, required = false): string => {
			const value = entry[key];
			if (value === undefined || value === '' || (record(value) && value['@_xsi:nil'] === 'true' &&
				Object.keys(value).every((name) => name === '@_xsi:nil'))) {
				if (required) fail(`${key} wajib diisi.`);
				return '';
			}
			if (typeof value !== 'string') return fail(`${key} harus berisi teks tunggal.`);
			if (value.length > 500) return fail(`${key} maksimum 500 karakter.`);
			return value;
		};
		const number = (key: string): number => {
			const value = text(key, true);
			if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value))) return fail(`${key} harus berupa bilangan bulat nonnegatif dalam batas angka aman, tanpa pemisah ribuan.`);
			return Number(value);
		};
		const yesNo = (key: string): boolean => {
			const value = text(key, true);
			if (value !== 'Yes' && value !== 'No') fail(`${key} harus Yes atau No.`);
			return value === 'Yes';
		};
		const masaPajakAwal = number('TaxPeriodMonthStart'); const masaPajakAkhir = number('TaxPeriodMonthEnd');
		const tahun = number('TaxPeriodYear');
		if (masaPajakAwal < 1 || masaPajakAkhir > 12 || masaPajakAkhir < masaPajakAwal || tahun < 2000 || tahun > 9999) fail('masa/tahun pajak tidak valid.');
		const tin = text('CounterpartTin', true);
		if (!/^\d{16}$/.test(tin) || tin === owner) fail('CounterpartTin harus 16 digit dan berbeda dari TIN pemotong.');
		const ptkp = text('TaxExemptOpt', true).replace('/', '');
		if (!bpa1PtkpValues.includes(ptkp as Bpa1Ptkp)) fail('TaxExemptOpt tidak valid.');
		const withholdingStatus = statuses[text('StatusOfWithholding', true)];
		if (!withholdingStatus) fail('StatusOfWithholding harus PartialYear, Annualized, atau FullYear.');
		const months = number('NumberOfMonths');
		if (withholdingStatus === 'KURANG_SETAHUN_DISETAHUNKAN' ? months < 1 || months > BPA_MAX_ANNUALIZED_MONTHS : months !== 0) fail('NumberOfMonths harus 1–11 untuk Annualized, atau 0 untuk jenis lainnya.');
		const counterpart = kind === 'bpa1' ? text('CounterpartOpt', true) : 'Resident';
		if (counterpart !== 'Resident' && counterpart !== 'Foreign') fail('CounterpartOpt harus Resident atau Foreign.');
		const withholdingDate = text('WithholdingDate', true);
		if (!isValidIsoDate(withholdingDate)) fail('WithholdingDate harus berupa tanggal nyata YYYY-MM-DD.');
		const nitku = text('IDPlaceOfBusinessActivity', true);
		if (!/^\d{22}$/.test(nitku)) fail('IDPlaceOfBusinessActivity harus 22 digit.');
		return { masaPajakAwal, masaPajakAkhir, tahun, tin, ptkp: ptkp as Bpa1Ptkp,
			secondEmployer: yesNo('WorkForSecondEmployer'), foreign: counterpart === 'Foreign',
			passport: text('CounterpartPassport'), position: text('CounterpartPosition', true),
			nip: text('CounterpartNipNrp', kind === 'bpa2'), rank: text('CounterpartRank', kind === 'bpa2'),
			objectCode: text('TaxObjectCode', true), withholdingStatus,
			months: withholdingStatus === 'KURANG_SETAHUN_DISETAHUNKAN' ? months : null,
			grossUp: kind === 'bpa1' ? yesNo('GrossUpOpt') : false,
			salary: number('SalaryPensionJhtTht'), incomeTaxBenefit: kind === 'bpa1' ? number('IncomeTaxBenefit') : 0,
			otherBenefit: number('OtherBenefit'), honorarium: kind === 'bpa1' ? number('Honorarium') : 0,
			insurance: kind === 'bpa1' ? number('InsurancePaidByEmployer') : 0,
			natura: kind === 'bpa1' ? number('Natura') : 0, bonus: kind === 'bpa1' ? number('TantiemBonusThr') : 0,
			wifeBenefit: kind === 'bpa2' ? number('WifeBenefit') : 0, childBenefit: kind === 'bpa2' ? number('ChildBenefit') : 0,
			incomeImprovement: kind === 'bpa2' ? number('IncomeImprovementBenefit') : 0,
			structuralBenefit: kind === 'bpa2' ? number('StructuralFunctionalBenefit') : 0,
			riceBenefit: kind === 'bpa2' ? number('RiceBenefit') : 0, otherRegular: kind === 'bpa2' ? number('OtherRegularIncome') : 0,
			pensionContribution: number('PensionContributionJhtThtFee'), zakat: number('Zakat'),
			previousSlip: text('PrevWhTaxSlip'), certificate: kind === 'bpa1' ? text('TaxCertificate', true) : '',
			article21IncomeTax: number('Article21IncomeTax'), nitku, withholdingDate };
	});
}
