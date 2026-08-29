// PTKP status codes used by eBupot BP21's Status PTKP field. Confirmed live
// (see docs/ui-reference/coretax/ebupot/NOTES.md): no PTKP reference-data
// type exists on Coretax -- this is a fixed 12-value client-side enum, same
// literal codes used inside kode_objek_pajak_pph.parameterData's TER
// TaxExemptionStatus arrays. Order matches the live dropdown (K/0..K/3,
// TK/0..TK/3, HB/0..HB/3).
export const ptkpEbupotValues = [
	'K0',
	'K1',
	'K2',
	'K3',
	'TK0',
	'TK1',
	'TK2',
	'TK3',
	'HB0',
	'HB1',
	'HB2',
	'HB3'
] as const;
export type PtkpEbupot = (typeof ptkpEbupotValues)[number];

export const ptkpEbupotOptions = ptkpEbupotValues.map((value) => ({
	value,
	label: `${value.slice(0, -1)}/${value.slice(-1)}`
}));
