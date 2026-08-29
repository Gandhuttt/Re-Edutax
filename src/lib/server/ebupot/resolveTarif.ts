import type { KodeObjekPajakParameterData } from '$lib/server/db/schema';

export type ResolvedTarif = {
	// Coretax's default rate for this object+facility combination, shown as
	// the field's pre-filled value whether or not it ends up editable.
	tarif: number;
	// Mirrors Coretax's own field-enable rule (confirmed in the live bundle,
	// see docs/ui-reference/coretax/ebupot/NOTES.md "BPU: Fasilitas Pajak and
	// manual-rate objects"): `ManualTaxRate: "TRUE"` on the matching
	// ItemList entry unlocks Tarif(%) for the preparer to override instead of
	// leaving it derived-and-readonly.
	manual: boolean;
};

// Resolves the Tarif% for a BPU-style object code + facility combination
// from Coretax's ParameterData shape. Always returns Coretax's own default
// rate for the combination (even when manual); callers decide whether to
// use a caller-supplied override when `manual` is true.
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

	if (typeof item.Rate === 'number') {
		return { tarif: item.Rate, manual };
	}

	if (item.Rates?.length === 1) {
		return { tarif: item.Rates[0].Rate, manual };
	}

	if (manual) {
		return { tarif: 0, manual: true };
	}

	throw new Error(
		'Tarif untuk kombinasi objek pajak dan fasilitas ini tidak dapat dihitung otomatis'
	);
};
