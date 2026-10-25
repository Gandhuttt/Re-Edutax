import { db } from '$lib/server/db';
import { faktur_pajak, tempat_kegiatan_usaha, wajib_pajak } from '$lib/server/db/schema';
import { and, asc, eq } from 'drizzle-orm';

// Lookups BP21/BP26 need from data the app already owns: branches (NITKU) come
// from Profil Saya › Tempat Kegiatan Usaha, names from registered taxpayers, and
// document dates from issued invoices. Every function takes the owner (the
// logged-in withholder's NPWP) explicitly.

export type BpBranch = { nitku: string; nama: string };

export type BpContext = {
	ownBranches: BpBranch[];
	recipientBranches: BpBranch[];
	// Registered taxpayer matching the TIN; only used to prefill the name.
	knownTaxpayer: { npwp: string; nama: string } | null;
};

export type BpInvoice = { id: string; nomorFaktur: string; tanggalFaktur: string };

const branchesOf = async (npwp: string): Promise<BpBranch[]> => {
	if (!npwp) return [];
	return db
		.select({ nitku: tempat_kegiatan_usaha.nitku, nama: tempat_kegiatan_usaha.nama })
		.from(tempat_kegiatan_usaha)
		.innerJoin(wajib_pajak, eq(tempat_kegiatan_usaha.wajib_pajak, wajib_pajak.id))
		.where(eq(wajib_pajak.npwp, npwp))
		.orderBy(asc(tempat_kegiatan_usaha.nitku));
};

export const getBpContext = async (owner: string, tin: string = ''): Promise<BpContext> => {
	const recipient = tin.trim();
	const [ownBranches, recipientBranches, known] = await Promise.all([
		branchesOf(owner),
		branchesOf(recipient),
		recipient
			? db
					.select({ npwp: wajib_pajak.npwp, nama: wajib_pajak.nama })
					.from(wajib_pajak)
					.where(eq(wajib_pajak.npwp, recipient))
					.limit(1)
			: Promise.resolve([])
	]);
	return { ownBranches, recipientBranches, knownTaxpayer: known[0] ?? null };
};

// Issued (diupload) invoice: seller is the income recipient, buyer is the withholder.
export const findBpInvoice = async (
	owner: string,
	recipientTin: string,
	nomorDokumen: string
): Promise<BpInvoice | null> => {
	const recipient = recipientTin.trim();
	const nomor = nomorDokumen.trim();
	if (!owner || !recipient || !nomor) return null;

	const [row] = await db
		.select({
			id: faktur_pajak.id,
			nomorFaktur: faktur_pajak.nomorFaktur,
			tanggalFaktur: faktur_pajak.tanggalFaktur
		})
		.from(faktur_pajak)
		.where(
			and(
				eq(faktur_pajak.nomorFaktur, nomor),
				eq(faktur_pajak.npwpPenjual, recipient),
				eq(faktur_pajak.npwpPembeli, owner),
				eq(faktur_pajak.diupload, true)
			)
		)
		.limit(1);

	if (!row) return null;
	return { id: row.id, nomorFaktur: row.nomorFaktur ?? nomor, tanggalFaktur: row.tanggalFaktur };
};

const branchExists = async (npwp: string, nitku: string): Promise<boolean> => {
	const value = nitku.trim();
	if (!npwp || !value) return false;
	const [row] = await db
		.select({ id: tempat_kegiatan_usaha.id })
		.from(tempat_kegiatan_usaha)
		.innerJoin(wajib_pajak, eq(tempat_kegiatan_usaha.wajib_pajak, wajib_pajak.id))
		.where(and(eq(wajib_pajak.npwp, npwp), eq(tempat_kegiatan_usaha.nitku, value)))
		.limit(1);
	return Boolean(row);
};

export const isOwnedBranch = (owner: string, nitku: string): Promise<boolean> =>
	branchExists(owner, nitku);

export const isRecipientBranch = (tin: string, nitku: string): Promise<boolean> =>
	branchExists(tin.trim(), nitku);
