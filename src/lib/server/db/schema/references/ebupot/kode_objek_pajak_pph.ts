import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

// Which eBupot document type a catalog row belongs to. Matches the
// EBUPOT<X>_TAX_OBJECT reference-data type suffix on coretaxdjp.pajak.go.id
// (see docs/ui-reference/coretax/ebupot/NOTES.md) -- the same Kode Objek
// Pajak string can mean different things (or carry different rates) across
// document types, so the catalog is scoped per type rather than shared.
export const jenisBuktiPotongValues = [
	'bp21',
	'bpu',
	'bp26',
	'bpa1',
	'bpa2',
	'bpa',
	'bpnr',
	'mp',
	'sp',
	'cy'
] as const;
export type JenisBuktiPotong = (typeof jenisBuktiPotongValues)[number];

// A single tarif band inside ParameterData.ItemList[].Rates[]. Two shapes are
// observed live: TER bands (PMK 168/2023) carry TaxExemptionStatus (which
// PTKP codes the band applies to); the Pasal 17 annual/BPA1 bands carry Minus
// instead. Kept optional/union rather than split into two types since the
// evaluator needs to branch on presence, not on a schema-declared kind.
export type KodeObjekPajakTarifBand = {
	Min: number;
	Max: number;
	Rate: number;
	TaxExemptionStatus?: string[];
	Minus?: number;
};

// One entry in ParameterData.ItemList[] -- a rate/bracket-table variant keyed
// to one or more Fasilitas Pajak (EBUPOT_TAX_CERTIFICATE) codes. Either a
// flat Rate/DeemedRate applies directly, or Rates carries a bracket table to
// evaluate against PTKP status + bruto/neto amount.
export type KodeObjekPajakItem = {
	TaxCertificateCode?: string;
	TaxCertificateCodes?: string[];
	ManualTaxRate?: string;
	ManualDeemedRate?: string;
	ManualIncomeTaxWithheld?: string;
	DisableCalculation?: string;
	DeemedRate?: number;
	Rate?: number;
	Rates?: KodeObjekPajakTarifBand[];
};

// Verbatim shape of Coretax's ParameterData JSON string, parsed. See
// docs/ui-reference/coretax/ebupot/NOTES.md "The big finding" section for how
// this maps to the BP21/BPU/BPA1 create-form fields (Sifat, DPP%, Tarif%,
// KAP-KJS are all derived from this at entry time, not stored as columns).
export type KodeObjekPajakParameterData = {
	IncomeTaxStatus: 'Final' | 'Tidak Final';
	ItemList: KodeObjekPajakItem[];
	RevenueCode: string;
	TaxArticle: string;
	TaxObjectCode: string;
};

export const kode_objek_pajak_pph = sqliteTable(
	'kode_objek_pajak_pph',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),

		jenisBuktiPotong: text('jenis_bukti_potong', { enum: jenisBuktiPotongValues }).notNull(),
		// Coretax's "Code" -- an internal sequence number, distinct from kode below.
		kodeReferensi: text('kode_referensi').notNull(),
		// Coretax's "CodeName" -- the Kode Objek Pajak shown in the form (e.g. "21-100-27").
		kode: text('kode').notNull(),
		// Coretax's "CodeDescription" -- the Nama Objek Pajak combobox label.
		nama: text('nama').notNull(),
		pasal: text('pasal').notNull(),
		sifat: text('sifat', { enum: ['Final', 'Tidak Final'] }).notNull(),
		// KAP-KJS combined, e.g. "411121-100" (Coretax's RevenueCode).
		kap: text('kap').notNull(),
		parameterData: text('parameter_data', { mode: 'json' })
			.$type<KodeObjekPajakParameterData>()
			.notNull(),
		aktif: integer('aktif', { mode: 'boolean' }).notNull().default(true)
	},
	(t) => [
		uniqueIndex('kode_objek_pajak_pph_jenis_kode_unique').on(t.jenisBuktiPotong, t.kode)
	]
);
