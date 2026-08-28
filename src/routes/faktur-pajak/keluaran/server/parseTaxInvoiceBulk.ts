import { XMLParser } from 'fast-xml-parser';
import { error } from '@sveltejs/kit';

export type TaxInvoiceGoodServiceRow = {
	opt: string;
	code: string;
	name: string;
	unit: string;
	price: number;
	qty: number;
	totalDiscount: number;
	otherTaxBase: number;
	vatRate: number;
	stlgRate: number;
};

export type TaxInvoiceRow = {
	taxInvoiceDate: string;
	trxCode: number;
	addInfo: string | null;
	customDoc: string | null;
	refDesc: string | null;
	buyerTin: string;
	buyerAdress: string | null;
	goodServices: TaxInvoiceGoodServiceRow[];
};

const parser = new XMLParser({
	ignoreAttributes: true,
	parseTagValue: false,
	isArray: (tagName) => tagName === 'TaxInvoice' || tagName === 'GoodService'
});

// Parses the real Coretax e-Faktur "Impor Data" bulk template (downloaded live
// from e-invoice-portal/output-tax -> Impor Data -> Unduh Format Data as
// TaxInvoiceTemplate.xml). Pure function -- no DB access -- so the XML shape
// and the persistence/lookup logic stay independently testable.
export function parseTaxInvoiceBulk(
	xml: string,
	activeNpwp: string
): { rows: TaxInvoiceRow[] } {
	let parsed: unknown;

	try {
		parsed = parser.parse(xml);
	} catch {
		error(400, 'File XML tidak valid.');
	}

	const bulk = (parsed as Record<string, unknown>)?.TaxInvoiceBulk as
		| Record<string, unknown>
		| undefined;

	if (!bulk) {
		error(400, 'File XML bukan format TaxInvoiceBulk yang valid.');
	}

	const tin = String(bulk.TIN ?? '').trim();
	if (tin !== activeNpwp) {
		error(400, `NPWP pada file (${tin}) tidak sesuai dengan NPWP Anda.`);
	}

	const list = bulk.ListOfTaxInvoice as Record<string, unknown> | undefined;
	const invoices = (list?.TaxInvoice as Record<string, unknown>[] | undefined) ?? [];

	const rows = invoices.map((invoice, index) => {
		const taxInvoiceDate = String(invoice.TaxInvoiceDate ?? '');
		if (!taxInvoiceDate) {
			error(400, `Faktur ke-${index + 1}: TaxInvoiceDate wajib diisi.`);
		}

		const trxCode = Number(invoice.TrxCode);
		if (!trxCode) {
			error(400, `Faktur ke-${index + 1}: TrxCode "${invoice.TrxCode}" tidak valid.`);
		}

		const buyerTin = String(invoice.BuyerTin ?? '').trim();

		const goodServiceList = invoice.ListOfGoodService as Record<string, unknown> | undefined;
		const goodServices = (goodServiceList?.GoodService as Record<string, unknown>[] | undefined) ?? [];

		if (goodServices.length === 0) {
			error(400, `Faktur ke-${index + 1}: minimal harus ada satu GoodService.`);
		}

		return {
			taxInvoiceDate,
			trxCode,
			addInfo: invoice.AddInfo ? String(invoice.AddInfo).trim() || null : null,
			customDoc: invoice.CustomDoc ? String(invoice.CustomDoc).trim() || null : null,
			refDesc: invoice.RefDesc ? String(invoice.RefDesc).trim() || null : null,
			buyerTin,
			buyerAdress: invoice.BuyerAdress ? String(invoice.BuyerAdress).trim() || null : null,
			goodServices: goodServices.map((good, goodIndex) => {
				const code = String(good.Code ?? '');
				const unit = String(good.Unit ?? '');
				const name = String(good.Name ?? '');

				if (!code || !unit || !name) {
					error(
						400,
						`Faktur ke-${index + 1}, barang/jasa ke-${goodIndex + 1}: Code, Unit dan Name wajib diisi.`
					);
				}

				return {
					opt: String(good.Opt ?? 'A'),
					code,
					name,
					unit,
					price: Number(good.Price ?? 0),
					qty: Number(good.Qty ?? 0),
					totalDiscount: Number(good.TotalDiscount ?? 0),
					otherTaxBase: Number(good.OtherTaxBase ?? 0),
					vatRate: Number(good.VATRate ?? 0),
					stlgRate: Number(good.STLGRate ?? 0)
				};
			})
		};
	});

	return { rows };
}
