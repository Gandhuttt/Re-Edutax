import type { KodeObjekPajakParameterData } from '$lib/server/db/schema';

// BPA2 shares BPA1's PTKP table, Biaya Jabatan cap formula, and month-count
// helper exactly (both live-verified identical for the same test scenario --
// see docs/ui-reference/coretax/ebupot/NOTES.md "BPA2").
export { resolvePtkpAmount, calculateBiayaJabatan, monthCountInclusive } from './resolveBpa1';

export type ResolvedBpa2Tax = { tarif: number; pajakPenghasilan: number };

// BPA2 has no "Jenis Fasilitas" selector at all (live-verified: no such
// dropdown exists on the create form, unlike BPA1) -- so unlike
// resolveBpa1Tax, this doesn't match an ItemList entry by facility code. It
// just picks the one entry that actually carries bracket data (the plain
// "9,11" combined entry BPA1 also uses for Tanpa Fasilitas/DTP), skipping
// the manual-only entries (empty Rates) that exist in the reference data but
// have no UI path to select in BPA2.
export const resolveBpa2Tax = (
	parameterData: KodeObjekPajakParameterData,
	penghasilanKenaPajak: number
): ResolvedBpa2Tax => {
	const item = parameterData.ItemList.find((entry) => entry.Rates && entry.Rates.length > 0);

	if (!item) {
		throw new Error('Tarif tidak dapat dihitung untuk objek pajak ini');
	}

	if (penghasilanKenaPajak <= 0) {
		return { tarif: 0, pajakPenghasilan: 0 };
	}

	const band = item.Rates?.find((b) => penghasilanKenaPajak >= b.Min && penghasilanKenaPajak <= b.Max);
	if (!band) {
		return { tarif: 0, pajakPenghasilan: 0 };
	}

	// tax(x) = x * band.Rate/100 - band.Minus, live-verified exact against
	// BPA1's same reference case (PKP 137,500,000 -> PPh 14,625,000).
	const pajakPenghasilan = Math.round(penghasilanKenaPajak * (band.Rate / 100) - (band.Minus ?? 0));
	return { tarif: band.Rate, pajakPenghasilan };
};
