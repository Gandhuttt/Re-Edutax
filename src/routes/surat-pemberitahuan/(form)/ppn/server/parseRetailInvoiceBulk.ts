import { XMLParser } from 'fast-xml-parser';
import { error } from '@sveltejs/kit';

const TRX_CODES = ['Normal', '07', '08', 'NoVAT'] as const;
const BUYER_ID_OPTS = ['NPWP', 'NIK', 'PASPOR'] as const;
const GOOD_SERVICE_OPTS = ['A', 'B'] as const;

export type RetailInvoiceRow = {
	trxCode: (typeof TRX_CODES)[number];
	buyerName: string;
	buyerIdOpt: (typeof BUYER_ID_OPTS)[number];
	buyerIdNumber: string;
	goodServiceOpt: (typeof GOOD_SERVICE_OPTS)[number];
	serialNo: string;
	transactionDate: string;
	taxBaseSellingPrice: number;
	otherTaxBaseSellingPrice: number;
	vat: number;
	stlg: number;
	info: string | null;
};

const parser = new XMLParser({
	ignoreAttributes: true,
	parseTagValue: false,
	isArray: (tagName) => tagName === 'RetailInvoice'
});

// Parses a Coretax "Unggah XML" RetailInvoiceBulk file (confirmed against the
// live templates for I.A.5/I.A.9/I.B: same <RetailInvoiceBulk> shape, rows
// differentiated only by <TrxCode>). Pure function -- no DB access -- so the
// XML format and the persistence/aggregation logic stay independently testable.
export function parseRetailInvoiceBulk(
	xml: string,
	activeNpwp: string
): { masaPajak: number; tahun: number; rows: RetailInvoiceRow[] } {
	let parsed: unknown;

	try {
		parsed = parser.parse(xml);
	} catch {
		error(400, 'File XML tidak valid.');
	}

	const bulk = (parsed as Record<string, unknown>)?.RetailInvoiceBulk as
		| Record<string, unknown>
		| undefined;

	if (!bulk) {
		error(400, 'File XML bukan format RetailInvoiceBulk yang valid.');
	}

	const tin = String(bulk.TIN ?? '').trim();
	if (tin !== activeNpwp) {
		error(400, `NPWP pada file (${tin}) tidak sesuai dengan NPWP Anda.`);
	}

	const masaPajak = Number(bulk.TaxPeriodMonth);
	const tahun = Number(bulk.TaxPeriodYear);
	if (!masaPajak || !tahun) {
		error(400, 'Masa pajak/tahun pada file XML tidak valid.');
	}

	const list = bulk.ListOfRetailInvoice as Record<string, unknown> | undefined;
	const invoices = (list?.RetailInvoice as Record<string, unknown>[] | undefined) ?? [];

	const rows = invoices.map((invoice, index) => {
		const trxCode = String(invoice.TrxCode ?? '');
		if (!TRX_CODES.includes(trxCode as (typeof TRX_CODES)[number])) {
			error(400, `Baris ${index + 1}: TrxCode "${trxCode}" tidak dikenal.`);
		}

		const buyerIdOpt = String(invoice.BuyerIdOpt ?? '');
		if (!BUYER_ID_OPTS.includes(buyerIdOpt as (typeof BUYER_ID_OPTS)[number])) {
			error(400, `Baris ${index + 1}: BuyerIdOpt "${buyerIdOpt}" tidak dikenal.`);
		}

		const goodServiceOpt = String(invoice.GoodServiceOpt ?? '');
		if (!GOOD_SERVICE_OPTS.includes(goodServiceOpt as (typeof GOOD_SERVICE_OPTS)[number])) {
			error(400, `Baris ${index + 1}: GoodServiceOpt "${goodServiceOpt}" tidak dikenal.`);
		}

		return {
			trxCode: trxCode as (typeof TRX_CODES)[number],
			buyerName: String(invoice.BuyerName ?? ''),
			buyerIdOpt: buyerIdOpt as (typeof BUYER_ID_OPTS)[number],
			buyerIdNumber: String(invoice.BuyerIdNumber ?? ''),
			goodServiceOpt: goodServiceOpt as (typeof GOOD_SERVICE_OPTS)[number],
			serialNo: String(invoice.SerialNo ?? ''),
			transactionDate: String(invoice.TransactionDate ?? ''),
			taxBaseSellingPrice: Number(invoice.TaxBaseSellingPrice ?? 0),
			otherTaxBaseSellingPrice: Number(invoice.OtherTaxBaseSellingPrice ?? 0),
			vat: Number(invoice.VAT ?? 0),
			stlg: Number(invoice.STLG ?? 0),
			info: invoice.Info ? String(invoice.Info) : null
		};
	});

	return { masaPajak, tahun, rows };
}
