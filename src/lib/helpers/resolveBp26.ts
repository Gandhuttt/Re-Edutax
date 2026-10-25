import type { KodeObjekPajakParameterData } from '$lib/server/db/schema';

export type ResolvedBp26 = {
	dppPercent: number;
	tarif: number;
	manualDpp: boolean;
	manualTarif: boolean;
	manualIncomeTax: boolean;
	// Coretax's own client-side ceiling on Penghasilan Bruto -- see
	// resolveBp21.ts for the identical mechanism. A no-op for BP26's real
	// data (the one object code's band Max is 1e18), kept for consistency
	// and in case the reference data ever changes.
	maxBruto?: number;
};

export type Bp26ManualInput = {
	dppManual?: string | number | null;
	tarifManual?: string | number | null;
};

export type Bp26Amounts = { dpp: number; tarif: number; pajakPenghasilan: number };

// Resolves DPP%/Tarif%/manual-override flags for a BP26 object+facility
// combination. Simpler than resolveBp21.ts -- BP26 has no PTKP/TER concept
// and no cumulative multi-payment bracket, just a single flat-rate band
// (Tanpa Fasilitas/DTP) or a manual-only entry (SKD/Fasilitas Lainnya,
// since DJP can't know a bilateral tax treaty's reduced rate in advance).
// Bands are looked up against the DPP basis (bruto x DPP%), matching BP21;
// the reference data has no Minus constant for BP26, so none is applied.
// See docs/ui-reference/coretax/ebupot/NOTES.md "BP26" for the live
// verification behind this.
export const resolveBp26 = (
	parameterData: KodeObjekPajakParameterData,
	fasilitasKode: string,
	bruto: number
): ResolvedBp26 => {
	const item = parameterData.ItemList.find(
		(entry) =>
			entry.TaxCertificateCode === fasilitasKode ||
			entry.TaxCertificateCodes?.includes(fasilitasKode)
	);

	if (!item) {
		throw new Error('Fasilitas pajak tidak berlaku untuk objek pajak ini');
	}

	const manualDpp = item.ManualDeemedRate?.toUpperCase() === 'TRUE';
	const manualTarif = item.ManualTaxRate?.toUpperCase() === 'TRUE';
	const manualIncomeTax = item.ManualIncomeTaxWithheld?.toUpperCase() === 'TRUE';
	const dppPercent = item.DeemedRate ?? 100;

	if (item.Rates?.length) {
		const taxBase = bruto * (dppPercent / 100);
		let maxBand = -Infinity;
		let tarif = 0;
		let found = false;
		for (const band of item.Rates) {
			if (band.Max > maxBand) maxBand = band.Max;
			if (!found && taxBase >= band.Min && taxBase <= band.Max) {
				tarif = band.Rate;
				found = true;
			}
		}
		return {
			dppPercent,
			tarif,
			manualDpp,
			manualTarif,
			manualIncomeTax,
			maxBruto: maxBand / (dppPercent / 100)
		};
	}

	if (typeof item.Rate === 'number') {
		return { dppPercent, tarif: item.Rate, manualDpp, manualTarif, manualIncomeTax };
	}

	return { dppPercent, tarif: 0, manualDpp, manualTarif, manualIncomeTax };
};

// Final DPP%/Tarif%/PPh from a resolved result plus manual inputs -- the exact
// derivation the save path uses. Callers validate required manual values first.
export const computeBp26Amounts = (
	resolved: ResolvedBp26,
	bruto: number,
	manual: Bp26ManualInput = {}
): Bp26Amounts => {
	const dpp = resolved.manualDpp ? Number(manual.dppManual) : resolved.dppPercent;
	const tarif = resolved.manualTarif ? Number(manual.tarifManual) : resolved.tarif;
	return { dpp, tarif, pajakPenghasilan: Math.round((bruto * dpp * tarif) / 10000) };
};
