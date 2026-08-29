import type { KodeObjekPajakParameterData } from '$lib/server/db/schema';

// Resolves the flat Tarif% for a BPU-style object code + facility
// combination from Coretax's ParameterData shape (see
// docs/ui-reference/coretax/ebupot/NOTES.md "The big finding"). Only covers
// the auto-resolvable cases confirmed live: a scalar Rate on the matching
// ItemList entry, or a single all-amounts band in Rates. Objects that need a
// manually-entered rate (ManualTaxRate: "TRUE", e.g. SKB facilities) throw --
// not supported in this first slice.
export const resolveTarif = (
	parameterData: KodeObjekPajakParameterData,
	fasilitasKode: string
): number => {
	const item = parameterData.ItemList.find(
		(entry) =>
			entry.TaxCertificateCode === fasilitasKode ||
			entry.TaxCertificateCodes?.includes(fasilitasKode)
	);

	if (!item) {
		throw new Error('Fasilitas pajak tidak berlaku untuk objek pajak ini');
	}

	if (typeof item.Rate === 'number') {
		return item.Rate;
	}

	if (item.Rates?.length === 1) {
		return item.Rates[0].Rate;
	}

	throw new Error(
		'Tarif untuk kombinasi objek pajak dan fasilitas ini harus diinput manual (belum didukung)'
	);
};
