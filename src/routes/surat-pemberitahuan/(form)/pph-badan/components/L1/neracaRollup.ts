export type NeracaRowType = 'header' | 'data' | 'sum';
export type NeracaSection = 'aset' | 'liabilitas_ekuitas';

export interface NeracaAkunTemplate {
	id: string;
	nomorUrut: number;
	kode: string | null;
	namaAkun: string;
	rowType: NeracaRowType;
	section: NeracaSection;
	parentKode: string | null;
	sign: number | null;
}

export interface NeracaLeafInput {
	id?: string;
	akunId: string;
	nilai: number;
}

export interface NeracaComputedRow {
	rowType: NeracaRowType;
	nomorUrut: number;
	kode: string | null;
	namaAkun: string;
	section: NeracaSection;
	id: string | null;
	akunId: string | null;
	nilai: number;
}

export function computeNeracaRows(
	template: NeracaAkunTemplate[],
	leafValues: NeracaLeafInput[]
): NeracaComputedRow[] {
	const byKode = new Map<string, NeracaAkunTemplate>();
	const childrenByParentKode = new Map<string, NeracaAkunTemplate[]>();
	const leafByAkunId = new Map<string, NeracaLeafInput>();

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

	const resolved = new Map<string, number>();

	const resolve = (kode: string): number => {
		const cached = resolved.get(kode);
		if (cached !== undefined) return cached;

		const row = byKode.get(kode);
		if (!row) return 0;

		let value: number;

		if (row.rowType === 'data') {
			value = Number(leafByAkunId.get(row.id)?.nilai ?? 0);
		} else {
			value = 0;
			const children = childrenByParentKode.get(kode) ?? [];

			for (const child of children) {
				if (!child.kode) continue;
				value += (child.sign ?? 1) * resolve(child.kode);
			}
		}

		resolved.set(kode, value);
		return value;
	};

	return template
		.slice()
		.sort((a, b) => a.nomorUrut - b.nomorUrut)
		.map((row): NeracaComputedRow => {
			if (row.rowType === 'header' || !row.kode) {
				return {
					rowType: row.rowType,
					nomorUrut: row.nomorUrut,
					kode: row.kode,
					namaAkun: row.namaAkun,
					section: row.section,
					id: null,
					akunId: null,
					nilai: 0
				};
			}

			const nilai = resolve(row.kode);
			const leaf = row.rowType === 'data' ? leafByAkunId.get(row.id) : undefined;

			return {
				rowType: row.rowType,
				nomorUrut: row.nomorUrut,
				kode: row.kode,
				namaAkun: row.namaAkun,
				section: row.section,
				id: leaf?.id ?? null,
				akunId: row.rowType === 'data' ? row.id : null,
				nilai
			};
		});
}
