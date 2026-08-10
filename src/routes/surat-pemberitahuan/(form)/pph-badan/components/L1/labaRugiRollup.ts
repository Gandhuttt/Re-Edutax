export type LabaRugiRowType = 'header' | 'data' | 'sum';
export type LabaRugiClassification = 'income' | 'expense';

export interface LabaRugiAkunTemplate {
	id: string;
	nomorUrut: number;
	kode: string | null;
	namaAkun: string;
	rowType: LabaRugiRowType;
	classification: LabaRugiClassification | null;
	parentKode: string | null;
	sign: number | null;
}

export interface LabaRugiLeafInput {
	id?: string;
	akunId: string;
	nilaiKomersial: number;
	nonObjekPajak: number;
	dikenakanPphFinal: number;
	penyesuaianFiskalPositif: number;
	penyesuaianFiskalNegatif: number;
	kodePenyesuaianFiskal: string[];
}

export interface LabaRugiComputedRow {
	rowType: LabaRugiRowType;
	nomorUrut: number;
	kode: string | null;
	namaAkun: string;
	classification: LabaRugiClassification | null;
	/**
	 * Whether this row splits into Tidak Termasuk Objek Pajak / Dikenakan PPh Final.
	 * Income rows that subtract from their parent (e.g. Retur, Potongan Penjualan under
	 * "Dikurangi:") behave like expense rows input-wise — unconfirmed rule, revisit if
	 * a counter-example turns up.
	 */
	hasFiskalSplit: boolean;
	id: string | null;
	akunId: string | null;
	nilaiKomersial: number;
	nonObjekPajak: number;
	dikenakanPphFinal: number;
	objekPajakTidakFinal: number;
	penyesuaianFiskalPositif: number;
	penyesuaianFiskalNegatif: number;
	kodePenyesuaianFiskal: string[];
	nilaiFiskal: number;
}

const NUMERIC_FIELDS = [
	'nilaiKomersial',
	'nonObjekPajak',
	'dikenakanPphFinal',
	'objekPajakTidakFinal',
	'penyesuaianFiskalPositif',
	'penyesuaianFiskalNegatif',
	'nilaiFiskal'
] as const;

type NumericValues = Pick<LabaRugiComputedRow, (typeof NUMERIC_FIELDS)[number]>;

const hasFiskalSplit = (row: LabaRugiAkunTemplate) => row.classification === 'income' && row.sign === 1;

const zeroValues = (): NumericValues => ({
	nilaiKomersial: 0,
	nonObjekPajak: 0,
	dikenakanPphFinal: 0,
	objekPajakTidakFinal: 0,
	penyesuaianFiskalPositif: 0,
	penyesuaianFiskalNegatif: 0,
	nilaiFiskal: 0
});

export function computeLabaRugiRows(
	template: LabaRugiAkunTemplate[],
	leafValues: LabaRugiLeafInput[]
): LabaRugiComputedRow[] {
	const byKode = new Map<string, LabaRugiAkunTemplate>();
	const childrenByParentKode = new Map<string, LabaRugiAkunTemplate[]>();
	const leafByAkunId = new Map<string, LabaRugiLeafInput>();

	for (const row of template) {
		if (row.kode) byKode.set(row.kode, row);
	}
	for (const row of template) {
		if (!row.kode || !row.parentKode) continue;
		const siblings = childrenByParentKode.get(row.parentKode) ?? [];
		siblings.push(row);
		childrenByParentKode.set(row.parentKode, siblings);
	}
	for (const leaf of leafValues) {
		leafByAkunId.set(leaf.akunId, leaf);
	}

	const resolved = new Map<string, NumericValues>();

	const resolve = (kode: string): NumericValues => {
		const cached = resolved.get(kode);
		if (cached) return cached;

		const row = byKode.get(kode);
		if (!row) return zeroValues();

		let values: NumericValues;

		if (row.rowType === 'data') {
			const leaf = leafByAkunId.get(row.id);
			const nilaiKomersial = Number(leaf?.nilaiKomersial ?? 0);
			const penyesuaianFiskalPositif = Number(leaf?.penyesuaianFiskalPositif ?? 0);
			const penyesuaianFiskalNegatif = Number(leaf?.penyesuaianFiskalNegatif ?? 0);

			let nonObjekPajak = 0;
			let dikenakanPphFinal = 0;
			let objekPajakTidakFinal = nilaiKomersial;

			if (hasFiskalSplit(row)) {
				nonObjekPajak = Number(leaf?.nonObjekPajak ?? 0);
				dikenakanPphFinal = Number(leaf?.dikenakanPphFinal ?? 0);
				objekPajakTidakFinal = nilaiKomersial - nonObjekPajak - dikenakanPphFinal;
			}

			const fiskalSign = row.classification === 'expense' ? -1 : 1;
			const nilaiFiskal =
				objekPajakTidakFinal + fiskalSign * (penyesuaianFiskalPositif - penyesuaianFiskalNegatif);

			values = {
				nilaiKomersial,
				nonObjekPajak,
				dikenakanPphFinal,
				objekPajakTidakFinal,
				penyesuaianFiskalPositif,
				penyesuaianFiskalNegatif,
				nilaiFiskal
			};
		} else {
			values = zeroValues();
			const children = childrenByParentKode.get(kode) ?? [];

			for (const child of children) {
				if (!child.kode) continue;
				const childValues = resolve(child.kode);
				const sign = child.sign ?? 1;

				for (const field of NUMERIC_FIELDS) {
					values[field] += sign * childValues[field];
				}
			}
		}

		resolved.set(kode, values);
		return values;
	};

	return template
		.slice()
		.sort((a, b) => a.nomorUrut - b.nomorUrut)
		.map((row): LabaRugiComputedRow => {
			if (row.rowType === 'header' || !row.kode) {
				return {
					rowType: row.rowType,
					nomorUrut: row.nomorUrut,
					kode: row.kode,
					namaAkun: row.namaAkun,
					classification: row.classification,
					hasFiskalSplit: false,
					id: null,
					akunId: null,
					kodePenyesuaianFiskal: [],
					...zeroValues()
				};
			}

			const values = resolve(row.kode);
			const leaf = row.rowType === 'data' ? leafByAkunId.get(row.id) : undefined;

			return {
				rowType: row.rowType,
				nomorUrut: row.nomorUrut,
				kode: row.kode,
				namaAkun: row.namaAkun,
				classification: row.classification,
				hasFiskalSplit: row.rowType === 'data' && hasFiskalSplit(row),
				id: leaf?.id ?? null,
				akunId: row.rowType === 'data' ? row.id : null,
				kodePenyesuaianFiskal: leaf?.kodePenyesuaianFiskal ?? [],
				...values
			};
		});
}
