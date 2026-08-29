import type {
	KodeObjekPajakParameterData,
	KodeObjekPajakTarifBand
} from '$lib/server/db/schema';

export type ResolvedBp21 = {
	dppPercent: number;
	tarif: number;
	manualDpp: boolean;
	manualTarif: boolean;
	manualIncomeTax: boolean;
	// Only set for the cumulative-bracket (21-401-01/21-401-02) branch, where
	// Pajak Penghasilan isn't a plain bruto x dpp% x tarif% product -- see
	// docs/ui-reference/coretax/ebupot/NOTES.md "BP21: cumulative bruto".
	// Callers use this directly when present instead of deriving PPh from
	// dppPercent/tarif.
	pajakPenghasilanOverride?: number;
};

const bandContains = (band: KodeObjekPajakTarifBand, amount: number) =>
	amount >= band.Min && amount <= band.Max;

// tax(x) = x * band(x).Rate/100 - band(x).Minus, per the Pasal 17 lump-sum
// bracket schedule used by 21-401-01/02 (pesangon/pensiun). Live-verified:
// previous=60,000,000 (band Rate=5, Minus=2,500,000) -> tax=500,000;
// total=110,000,000 (band Rate=15, Minus=12,500,000) -> tax=4,000,000.
const taxAtCumulativeBracket = (bands: KodeObjekPajakTarifBand[], amount: number) => {
	if (amount <= 0) return { tax: 0, rate: 0 };
	const band = bands.find((b) => bandContains(b, amount));
	if (!band) return { tax: 0, rate: 0 };
	return { tax: amount * (band.Rate / 100) - (band.Minus ?? 0), rate: band.Rate };
};

// Resolves DPP%/Tarif%/manual-override flags (and, for the cumulative
// bracket case, Pajak Penghasilan directly) for a BP21 object+facility
// combination, given the recipient's PTKP status and Penghasilan Bruto.
// See docs/ui-reference/coretax/ebupot/NOTES.md "BP21: TER, flat, and
// cumulative-bracket formulas" for the live verification behind each branch.
export const resolveBp21 = (
	parameterData: KodeObjekPajakParameterData,
	fasilitasKode: string,
	statusPtkp: string,
	bruto: number,
	brutoSebelumnya: number
): ResolvedBp21 => {
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

	const cumulativeBands = item.Rates?.filter((band) => band.Minus !== undefined) ?? [];
	if (cumulativeBands.length > 0) {
		const total = brutoSebelumnya + bruto;
		const { tax: taxOnTotal, rate } = taxAtCumulativeBracket(cumulativeBands, total);
		const { tax: taxOnPrevious } = taxAtCumulativeBracket(cumulativeBands, brutoSebelumnya);
		return {
			dppPercent: 100,
			tarif: rate,
			manualDpp,
			manualTarif,
			manualIncomeTax,
			pajakPenghasilanOverride: Math.round(taxOnTotal - taxOnPrevious)
		};
	}

	const terBands = item.Rates?.filter((band) => band.TaxExemptionStatus !== undefined) ?? [];
	if (terBands.length > 0) {
		const applicable = terBands.filter((band) => band.TaxExemptionStatus?.includes(statusPtkp));
		const band = applicable.find((b) => bandContains(b, bruto));
		return { dppPercent, tarif: band?.Rate ?? 0, manualDpp, manualTarif, manualIncomeTax };
	}

	if (typeof item.Rate === 'number') {
		return { dppPercent, tarif: item.Rate, manualDpp, manualTarif, manualIncomeTax };
	}

	return { dppPercent, tarif: 0, manualDpp, manualTarif, manualIncomeTax };
};
