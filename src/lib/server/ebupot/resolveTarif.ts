import type { KodeObjekPajakParameterData } from '$lib/server/db/schema';

export type ResolvedTarif = {
	// Coretax's default rate for this object+facility combination, shown as
	// the field's pre-filled value whether or not it ends up editable.
	tarif: number;
	// Mirrors Coretax's own field-enable rules (confirmed in the live
	// bundle, see docs/ui-reference/coretax/ebupot/NOTES.md "BPU: Fasilitas
	// Pajak and manual-rate objects"): `ManualTaxRate`/`ManualIncomeTaxWithheld`
	// == "TRUE" on the matching ItemList entry unlocks Tarif(%) / Pajak
	// Penghasilan(Rp) respectively for the preparer to override, instead of
	// leaving them derived-and-readonly. `ManualDeemedRate` is the same
	// mechanism for a DPP% field, but no BPU object ever sets it (checked
	// across all 206) -- BPU has no DPP% concept in its UI to begin with, so
	// it's intentionally not modeled here.
	manual: boolean;
	manualIncomeTax: boolean;
};

// Resolves the Tarif% for a BPU-style object code + facility combination
// from Coretax's ParameterData shape. Always returns Coretax's own default
// rate for the combination (even when manual); callers decide whether to
// use a caller-supplied override when `manual`/`manualIncomeTax` is true.
export const resolveTarif = (
	parameterData: KodeObjekPajakParameterData,
	fasilitasKode: string
): ResolvedTarif => {
	const item = parameterData.ItemList.find(
		(entry) =>
			entry.TaxCertificateCode === fasilitasKode ||
			entry.TaxCertificateCodes?.includes(fasilitasKode)
	);

	if (!item) {
		throw new Error('Fasilitas pajak tidak berlaku untuk objek pajak ini');
	}

	const manual = item.ManualTaxRate?.toUpperCase() === 'TRUE';
	const manualIncomeTax = item.ManualIncomeTaxWithheld?.toUpperCase() === 'TRUE';

	if (typeof item.Rate === 'number') {
		return { tarif: item.Rate, manual, manualIncomeTax };
	}

	if (item.Rates?.length === 1) {
		return { tarif: item.Rates[0].Rate, manual, manualIncomeTax };
	}

	if (manual) {
		return { tarif: 0, manual: true, manualIncomeTax };
	}

	throw new Error(
		'Tarif untuk kombinasi objek pajak dan fasilitas ini tidak dapat dihitung otomatis'
	);
};
