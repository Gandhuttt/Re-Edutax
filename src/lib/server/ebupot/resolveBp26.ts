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

// Resolves DPP%/Tarif%/manual-override flags for a BP26 object+facility
// combination. Simpler than resolveBp21.ts -- BP26 has no PTKP/TER concept
// and no cumulative multi-payment bracket, just a single flat-rate band
// (Tanpa Fasilitas/DTP) or a manual-only entry (SKD/Fasilitas Lainnya,
// since DJP can't know a bilateral tax treaty's reduced rate in advance).
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

	const maxBruto = item.Rates?.length
		? Math.max(...item.Rates.map((band) => band.Max)) / (dppPercent / 100)
		: undefined;

	if (item.Rates?.length) {
		const band = item.Rates.find((b) => bruto >= b.Min && bruto <= b.Max);
		return { dppPercent, tarif: band?.Rate ?? 0, manualDpp, manualTarif, manualIncomeTax, maxBruto };
	}

	if (typeof item.Rate === 'number') {
		return { dppPercent, tarif: item.Rate, manualDpp, manualTarif, manualIncomeTax };
	}

	return { dppPercent, tarif: 0, manualDpp, manualTarif, manualIncomeTax };
};
