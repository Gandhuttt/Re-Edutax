// PTKP status codes used by eBupot BPA1's Status PTKP field. Live-verified
// on Coretax (see docs/ui-reference/coretax/ebupot/NOTES.md "BPA1"): the
// dropdown offers only 8 options (K/0-3, TK/0-3) -- unlike BP21's 12
// (which also has HB/0-3). Split into its own helper (not resolveBpa1.ts,
// which needs $lib/server/db/schema for KodeObjekPajakParameterData) to
// avoid a schema <-> ebupot-helper import cycle, same as ptkp-ebupot.ts
// does for BP21.
export const bpa1PtkpValues = ['TK0', 'TK1', 'TK2', 'TK3', 'K0', 'K1', 'K2', 'K3'] as const;
export type Bpa1Ptkp = (typeof bpa1PtkpValues)[number];

export const bpa1PtkpOptions = bpa1PtkpValues.map((value) => ({
	value,
	label: `${value.slice(0, -1)}/${value.slice(-1)}`
}));
