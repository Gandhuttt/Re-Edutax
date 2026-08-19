import { L3C_SUB_GRID, type BarisHartaFiskal, type BarisPerTabel } from './types';

// L-3C's twelve sub-grids round-trip through a single flat array, because that
// is how Coretax stores them too: one row set distinguished by TableIndex.
// Both directions live here so the page and the loader cannot drift apart.

export type BarisBertabel = BarisHartaFiskal & { tableIndex: number };

// Flatten for submission: tag every row with the grid it came from.
export function ratakanPerTabel(perTabel: BarisPerTabel): BarisBertabel[] {
	return Object.entries(perTabel).flatMap(([indeks, baris]) =>
		baris.map((row) => ({ ...row, tableIndex: Number(indeks) }))
	);
}

// Group for display. Every one of the twelve indexes is present even when
// empty, so each grid can bind its own array unconditionally. A row whose
// tableIndex is outside 1-12 is dropped rather than creating a thirteenth grid:
// that can only be data from an older shape.
export function kelompokkanPerTabel(baris: readonly BarisBertabel[]): BarisPerTabel {
	const perTabel: BarisPerTabel = {};
	for (const { tableIndex } of L3C_SUB_GRID) perTabel[tableIndex] = [];

	for (const row of baris) {
		const { tableIndex, ...sisa } = row;
		perTabel[tableIndex]?.push({ ...sisa });
	}

	return perTabel;
}
