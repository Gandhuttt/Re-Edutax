import { form, getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { spt_ppn_retail_invoice } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { parseRetailInvoiceBulk } from './server/parseRetailInvoiceBulk';
import { computePostedSptPpnFields } from './server/computePostedSptPpnFields.server';
import { getOwnedSptPpn } from './server/getOwnedSptPpn.server';

// "Unggah XML" for induk rows I.A.5/I.A.9/I.B -- see parseRetailInvoiceBulk
// for the RetailInvoiceBulk format. Each upload is one batch: rows are
// appended to whatever retail invoices already exist for this npwp/period,
// matching how faktur_pajak already accumulates over multiple uploads rather
// than being replaced wholesale.
export const uploadRetailInvoiceXml = form('unchecked', async ({ id, file }) => {
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
