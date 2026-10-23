import { formatTanggalWaktu } from './date';

type UrutanSpt = { pembetulanKe: number; urutanKe: number; urutanDari: number };

// "SPT ke-2 dari 3": only for a normal SPT whose period holds several, since a lone SPT
// needs no marker and an amendment is already identified by its pembetulan number.
export function labelUrutanSpt({ pembetulanKe, urutanKe, urutanDari }: UrutanSpt) {
	return pembetulanKe === 0 && urutanDari > 1 ? `SPT ke-${urutanKe} dari ${urutanDari}` : '';
}

// What a detail page adds to its header: which SPT of the period this is, and when it
// was opened.
export function keteranganSpt(spt: UrutanSpt & { createdAt: Date }) {
	return [
		spt.pembetulanKe > 0 ? `Pembetulan ke-${spt.pembetulanKe}` : labelUrutanSpt(spt),
		`Dibuat ${formatTanggalWaktu(spt.createdAt)}`
	]
		.filter(Boolean)
		.join(' · ');
}
