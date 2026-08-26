import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { wajib_pajak } from '../wajib_pajak/wajib_pajak';

// One row per <RetailInvoice> element from a Coretax "Unggah XML"
// RetailInvoiceBulk upload, feeding induk rows I.A.5 (TrxCode=Normal), I.A.9
// (TrxCode=07/08) and I.B (TrxCode=NoVAT). Scoped by npwp + masaPajak + tahun
// rather than sptPpnId -- mirrors faktur_pajak's own scoping, since these
// invoices belong to the taxpayer/period, not to whichever SPT draft happens
// to be open when uploaded.
export const spt_ppn_retail_invoice = sqliteTable('spt_ppn_retail_invoice', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),

	npwp: text('npwp')
		.notNull()
		.references(() => wajib_pajak.npwp),
	masaPajak: integer('masa_pajak').notNull(),
	tahun: integer('tahun').notNull(),

	trxCode: text('trx_code', { enum: ['Normal', '07', '08', 'NoVAT'] }).notNull(),
	buyerName: text('buyer_name').notNull(),
	buyerIdOpt: text('buyer_id_opt', { enum: ['NPWP', 'NIK', 'PASPOR'] }).notNull(),
	buyerIdNumber: text('buyer_id_number').notNull(),
	goodServiceOpt: text('good_service_opt', { enum: ['A', 'B'] }).notNull(),
	serialNo: text('serial_no').notNull(),
	transactionDate: text('transaction_date').notNull(),
	taxBaseSellingPrice: integer('tax_base_selling_price').notNull().default(0),
	otherTaxBaseSellingPrice: integer('other_tax_base_selling_price').notNull().default(0),
	vat: integer('vat').notNull().default(0),
	stlg: integer('stlg').notNull().default(0),
	info: text('info'),

	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.notNull()
		.$defaultFn(() => new Date())
});
