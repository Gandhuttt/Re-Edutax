import { sql } from 'drizzle-orm';

// "SPT ke-N dari M": the position (urutanKe) and the total (urutanDari) among the normal
// SPT (pembetulan_ke = 0) one taxpayer has for the same period, oldest first. A taxpayer
// may hold several normal SPT for one period, and these two numbers are what tells them
// apart in the UI.
//
// Both are correlated subqueries on the outer table, so they only work inside a select
// that reads that same table. The outer columns are written out as qualified names rather
// than interpolated from the schema: for a single-table select drizzle strips the table
// qualifier from interpolated columns, and inside the subquery an unqualified name would
// resolve to the inner row and compare it with itself. The names are static, never user
// input.
function urutanSpt(tabel: string, kolomPeriode: string[]) {
	const luar = (kolom: string) => `"${tabel}"."${kolom}"`;
	const periode = ['npwp', ...kolomPeriode].map((kolom) => `p.${kolom} = ${luar(kolom)}`).join(' and ');
	const dariSemua = `select count(*) from ${tabel} p where ${periode} and p.pembetulan_ke = 0`;

	return {
		urutanKe: sql<number>`(${sql.raw(
			`${dariSemua} and (p.created_at < ${luar('created_at')} or (p.created_at = ${luar('created_at')} and p.id <= ${luar('id')}))`
		)})`,
		urutanDari: sql<number>`(${sql.raw(dariSemua)})`
	};
}

export const urutanSptPphBadan = urutanSpt('spt_pph_badan', ['tahun_pajak']);
export const urutanSptPphOrangPribadi = urutanSpt('spt_pph_orang_pribadi', ['tahun_pajak']);
export const urutanSptPpn = urutanSpt('spt_ppn', ['masa_pajak', 'tahun']);
