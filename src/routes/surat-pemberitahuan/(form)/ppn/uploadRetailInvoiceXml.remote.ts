import { form, getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { spt_ppn_retail_invoice } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { and, eq, inArray } from 'drizzle-orm';
import { parseRetailInvoiceBulk } from './server/parseRetailInvoiceBulk';
import { computePostedSptPpnFields } from './server/computePostedSptPpnFields.server';
import { getOwnedSptPpn } from './server/getOwnedSptPpn.server';

// "Unggah XML" for induk rows I.A.5/I.A.9/I.B -- see parseRetailInvoiceBulk
// for the RetailInvoiceBulk format. Matches real Coretax: the taxpayer picks
// "Tambah" (add to whatever's already there for this npwp/period) or "Ganti"
// (replace it) at upload time. "Ganti" only clears the TrxCodes present in
// the uploaded file -- e.g. an I.A.5-only file doesn't touch I.A.9/I.B rows.
export const uploadRetailInvoiceXml = form('unchecked', async ({ id, file, mode }) => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}
	if (!(file instanceof File)) {
		error(400, 'File XML wajib diunggah.');
	}

	const sptPpn = await getOwnedSptPpn(String(id), activeNpwp);

	if (sptPpn.status !== 'konsep') {
		error(400, 'SPT yang sudah dilaporkan tidak dapat diubah.');
	}

	const xml = await file.text();
	const { masaPajak, tahun, rows } = parseRetailInvoiceBulk(xml, activeNpwp);

	if (mode === 'replace' && rows.length > 0) {
		const trxCodes = [...new Set(rows.map((row) => row.trxCode))];

		await db
			.delete(spt_ppn_retail_invoice)
			.where(
				and(
					eq(spt_ppn_retail_invoice.npwp, activeNpwp),
					eq(spt_ppn_retail_invoice.masaPajak, masaPajak),
					eq(spt_ppn_retail_invoice.tahun, tahun),
					inArray(spt_ppn_retail_invoice.trxCode, trxCodes)
				)
			);
	}

	if (rows.length > 0) {
		await db.insert(spt_ppn_retail_invoice).values(
			rows.map((row) => ({
				npwp: activeNpwp,
				masaPajak,
				tahun,
				...row
			}))
		);
	}

	const { penyerahan, perolehan, ...induk } = await computePostedSptPpnFields({
		npwp: activeNpwp,
		periodeBulan: sptPpn.masaPajak,
		periodeTahun: sptPpn.tahun
	});

	return { fields: { ...penyerahan, ...perolehan, ...induk }, rowsImported: rows.length };
});
