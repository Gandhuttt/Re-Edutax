import type { RequestHandler } from './$types';

// Official Coretax "Unduh Format Data" body for eBupot MP (MmPayrollBulk), captured verbatim
// from POST /withholdingslipsportal/api/DownloadWithholdingSlips/download-template.
// The placeholders (xxxxxxxxxxxxxxxx, 000000, 2024 dates) are intentionally unchanged.
const TEMPLATE = `<?xml version="1.0" encoding="utf-8"?>
<!-- Created with Liquid Technologies Online Tools 1.0 (https://www.liquid-technologies.com) -->
<MmPayrollBulk xsi:noNamespaceSchemaLocation="schema.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <TIN>xxxxxxxxxxxxxxxx</TIN>
  <ListOfMmPayroll>
    <MmPayroll>
      <TaxPeriodMonth>3</TaxPeriodMonth>
      <TaxPeriodYear>2024</TaxPeriodYear>
      <CounterpartOpt>Resident</CounterpartOpt>
      <CounterpartPassport />
      <CounterpartTin>xxxxxxxxxxxxxxxx</CounterpartTin>
      <StatusTaxExemption>K/0</StatusTaxExemption>
      <Position>CEO</Position>
      <TaxCertificate>N/A</TaxCertificate>
      <TaxObjectCode>21-100-01</TaxObjectCode>
      <Gross>40000000</Gross>
      <Rate>16</Rate>
      <IDPlaceOfBusinessActivity>000000</IDPlaceOfBusinessActivity>
      <WithholdingDate>2024-03-18</WithholdingDate>
    </MmPayroll>
    <MmPayroll>
      <TaxPeriodMonth>3</TaxPeriodMonth>
      <TaxPeriodYear>2024</TaxPeriodYear>
      <CounterpartOpt>Foreign</CounterpartOpt>
      <CounterpartPassport>ABC-123</CounterpartPassport>
      <CounterpartTin>xxxxxxxxxxxxxxxx</CounterpartTin>
      <StatusTaxExemption>K/0</StatusTaxExemption>
      <Position>staff</Position>
      <TaxCertificate>N/A</TaxCertificate>
      <TaxObjectCode>21-100-32</TaxObjectCode>
      <Gross>100000000</Gross>
      <Rate>24</Rate>
      <IDPlaceOfBusinessActivity>000000</IDPlaceOfBusinessActivity>
      <WithholdingDate>2024-03-18</WithholdingDate>
    </MmPayroll>
  </ListOfMmPayroll>
</MmPayrollBulk>`;

export const GET: RequestHandler = ({ locals }) => {
	if (!locals.user?.username) return new Response('Belum login', { status: 401, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' } });
	return new Response(TEMPLATE, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Content-Disposition': 'attachment; filename="mp.xml"',
			'Cache-Control': 'private, no-store',
			'X-Content-Type-Options': 'nosniff'
		}
	});
};
