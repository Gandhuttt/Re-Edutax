export type LampiranRow = Record<string, string | number>;

// How one field renders inside a row-editor modal.
//
// MODAL-FIELDS.md warns that a generic "row editor built from the column list"
// cannot work, and it is right: field counts run 3 to 10, some modal fields are
// absent from the grid and some grid columns are absent from the modal, and the
// derived/disabled behaviour differs per grid. This spec is per-grid and
// explicit rather than derived from the columns, which is what makes a single
// modal component viable.
export interface FieldSpec {
	key: string;
	label: string;
	kind: 'text' | 'rupiah' | 'tahun' | 'tanggal' | 'daftar';
	// Reference list key for kind 'daftar', matching
	// referensi_lampiran_spt_pph_orang_pribadi.daftar.
	daftar?: string;
	// Marks the field required. Kept as its own metadata because the live form's
	// asterisk is not a reliable requiredness marker in either direction:
	// Keterangan errors without one, and the disabled Kode carries one.
	wajib?: boolean;
	// Computed and rendered disabled, e.g. L-1 D's Penghasilan Neto, which is
	// genuine arithmetic (Bruto - Pengurang) rather than a lookup.
	turunan?: (row: LampiranRow) => string | number;
}

// How one column renders in the grid itself.
export interface ColumnSpec {
	key: string;
	label: string;
	kind?: 'text' | 'rupiah';
}
