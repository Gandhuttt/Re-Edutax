import { db } from '$lib/server/db';
import { faktur_pajak } from '$lib/server/db/schema';
import { and, eq } from 'drizzle-orm';

export async function getFakturReferenceChain(referenceId: string, sellerNpwp: string) {
	const invoices = await db
		.select({
			id: faktur_pajak.id,
			npwpPembeli: faktur_pajak.npwpPembeli,
			fakturReferensiId: faktur_pajak.fakturReferensiId,
			uangMuka: faktur_pajak.uangMuka,
			nilaiUangMuka: faktur_pajak.nilaiUangMuka,
			pelunasan: faktur_pajak.pelunasan,
		})
		.from(faktur_pajak)
		.where(
			and(
				eq(faktur_pajak.npwpPenjual, sellerNpwp),
				eq(faktur_pajak.diupload, true)
			)
		);
	const invoiceById = new Map(invoices.map((invoice) => [invoice.id, invoice]));
	const invoice = invoiceById.get(referenceId);
	if (!invoice) return null;

	let totalUangMuka = 0;
	let current: typeof invoice | undefined = invoice;
	const visited = new Set<string>();

	while (current && !visited.has(current.id)) {
		visited.add(current.id);
		if (current.uangMuka) totalUangMuka += current.nilaiUangMuka;
		current = current.fakturReferensiId
			? invoiceById.get(current.fakturReferensiId)
			: undefined;
	}

	return { invoice, totalUangMuka };
}
