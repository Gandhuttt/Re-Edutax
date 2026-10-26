// Pure, browser-safe helpers shared by the MP form, importer and server service.
import { isAllowedPeriod, periodOptions } from './bp-parity';
import { computeBp21Amounts, resolveBp21, type ResolvedBp21 } from './resolveBp21';
import type { KodeObjekPajakParameterData } from '$lib/server/db/schema';

// MP objects only ever reference these TaxCertificateCodes (Tanpa Fasilitas, DTP, Fasilitas Lainnya).
export const MP_FASILITAS_KODE = ['4', '8', '9'];
export const MP_DEFAULT_FASILITAS_KODE = '9';
// Unissued rows in these statuses can still be edited; DELETED/CANCELLED/AMENDED are terminal.
export const MP_EDITABLE_STATUSES = ['NORMAL', 'SAVEDINVALID', 'SUBMITTED', 'AMENDMENT'];
// Coretax's generic TIN for recipients that are not registered.
export const MP_GENERIC_TIN = '9990000000999000';
export const MP_MAX_AMOUNT = 999_999_999_999_999;

// Coretax filters December out of the MP period dropdown (December is settled by BPA).
export const isAllowedMpPeriod = (tahun: number, masaPajak: number, now: Date = new Date()): boolean =>
	masaPajak !== 12 && isAllowedPeriod(tahun, masaPajak, now);

// Newest first.
export const mpPeriodOptions = (now: Date = new Date()) =>
	periodOptions(now).filter((option) => option.masaPajak !== 12);

/** Latest period an MP may use (December falls back to November). */
export const mpDefaultPeriod = (now: Date = new Date()) => mpPeriodOptions(now)[0];

/**
 * MP reference items carry no DeemedRate: TER applies to the whole bruto, so the
 * 100% DPP is supplied explicitly (resolveBp21 would otherwise treat it as 0).
 */
export const resolveMp = (
	parameterData: KodeObjekPajakParameterData,
	fasilitasKode: string,
	statusPtkp: string,
	bruto: number
): ResolvedBp21 =>
	resolveBp21(
		{
			...parameterData,
			ItemList: parameterData.ItemList.map((item) => ({ DeemedRate: 100, ...item }))
		},
		fasilitasKode,
		statusPtkp,
		bruto,
		0
	);

export type MpManualInput = { tarifManual?: string | number; pajakPenghasilanManual?: string | number };

export const computeMpAmounts = (
	resolved: ResolvedBp21,
	bruto: number,
	manual: MpManualInput = {}
): { tarif: number; pajakPenghasilanDipotong: number } => {
	const { tarif, pajakPenghasilan } = computeBp21Amounts(resolved, bruto, {
		dppManual: '100',
		tarifManual: String(manual.tarifManual ?? '0'),
		pajakPenghasilanManual: String(manual.pajakPenghasilanManual ?? '0')
	});
	return { tarif, pajakPenghasilanDipotong: pajakPenghasilan };
};
