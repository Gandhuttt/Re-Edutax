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
	// Coretax's own client-side ceiling on Penghasilan Bruto for this
	// object+facility combo: max(...band.Max) / (dppPercent/100), taken from
	// the resolved item's Rates array. Undefined when the item has no bands
	// (flat/exempt-manual branches -- no ceiling). For most objects the top
	// band runs to 9,999,999,999,999 so this is effectively a no-op; it only
	// bites on objects like 21-100-24/21-100-29 (daily wage) where the
	// bracket table genuinely doesn't extend past the object's real-world
	// ceiling. See docs/ui-reference/coretax/ebupot/NOTES.md "BP21: bracket
	// ceiling validation".
	maxBruto?: number;
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
	const dppPercent = item.DeemedRate ?? 0;
	const taxBase = bruto * (dppPercent / 100);
	const bands = item.Rates ?? [];

	// Coretax validates Gross Income against the resolved DPP base's band
	// ceiling: max(...band.Max) / (DeemedRate/100). A zero DPP has no useful
	// ceiling (the corresponding reference entries are manual/exempt).
	const maxBruto =
		bands.length > 0 && dppPercent > 0
			? Math.max(...bands.map((band) => band.Max)) / (dppPercent / 100)
			: undefined;

	// Only these two object codes treat the bracket as cumulative across
	// previous and current gross income. Many other BP21 objects also carry
	// `Minus` bands, but Coretax evaluates those against this payment's DPP
	// base; `Minus` alone does not identify the cumulative branch.
	const isCumulativeObject =
		parameterData.TaxObjectCode === '21-401-01' || parameterData.TaxObjectCode === '21-401-02';
	if (isCumulativeObject && bands.some((band) => band.Minus !== undefined)) {
		const total = brutoSebelumnya + bruto;
		const { tax: taxOnTotal, rate } = taxAtCumulativeBracket(bands, total);
		const { tax: taxOnPrevious } = taxAtCumulativeBracket(bands, brutoSebelumnya);
		return {
			dppPercent,
			tarif: rate,
			manualDpp,
			manualTarif,
			manualIncomeTax,
			pajakPenghasilanOverride: Math.round(
				(taxOnTotal - taxOnPrevious) * (dppPercent / 100)
			),
			maxBruto
		};
	}

	const terBands = bands.filter((band) => band.TaxExemptionStatus !== undefined);
	if (terBands.length > 0) {
		const applicable = terBands.filter((band) => band.TaxExemptionStatus?.includes(statusPtkp));
		const band = applicable.find((candidate) => bandContains(candidate, taxBase));
		return {
			dppPercent,
			tarif: band?.Rate ?? 0,
			manualDpp,
			manualTarif,
			manualIncomeTax,
			maxBruto
		};
	}

	// Coretax resolves every non-TER band against the DPP amount, not gross
	// income: `taxBase = bruto * DeemedRate/100`. Pasal 17 objects include a
	// `Minus` constant and therefore need the complete bracket formula;
	// daily-wage objects have the same lookup without `Minus`.
	if (bands.length > 0) {
		const band = bands.find((candidate) => bandContains(candidate, taxBase));
		return {
			dppPercent,
			tarif: band?.Rate ?? 0,
			manualDpp,
			manualTarif,
			manualIncomeTax,
			pajakPenghasilanOverride:
				band?.Minus !== undefined
					? Math.round(taxBase * (band.Rate / 100) - band.Minus)
					: undefined,
			maxBruto
		};
	}

	if (typeof item.Rate === 'number') {
		return { dppPercent, tarif: item.Rate, manualDpp, manualTarif, manualIncomeTax };
	}

	return { dppPercent, tarif: 0, manualDpp, manualTarif, manualIncomeTax };
};
