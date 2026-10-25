import { db } from '$lib/server/db';
import {
	ebupot_pengaturan_lokal,
	ebupot_profil_penerima,
	ebupot_receipt_skd_lokal,
	ebupot_sertifikat_lokal,
	faktur_pajak,
	tempat_kegiatan_usaha,
	wajib_pajak
} from '$lib/server/db/schema';
import { periodEnd, todayIso } from '$lib/helpers/bp-parity';
import { and, asc, eq } from 'drizzle-orm';

// Account-scoped LOCAL registries for BP21/BP26. These are EDUCATIONAL SIMULATION
// data (SIMULASI, bukan verifikasi DJP). Every function takes the owner (the
// logged-in withholder's NPWP) explicitly and only ever reads that owner's
// private rows (profile, certificate, receipt, setting).

export type LocalBranch = { nitku: string; nama: string };

export type LocalBpCertificate = {
	id: string;
	nomorIdentitasWp: string;
	fasilitasKode: string;
	nomorSertifikat: string;
	berlakuDari: string;
	berlakuSampai: string;
	aktif: boolean;
};

export type LocalBpRecipientProfile = {
	nomorIdentitasWp: string;
	nama: string;
	jenisWp: 'orang_pribadi' | 'badan' | 'luar_negeri';
	statusPtkp: string | null;
};

export type LocalBpContext = {
	ownBranches: LocalBranch[];
	recipientBranches: LocalBranch[];
	recipientProfile: LocalBpRecipientProfile | null;
	// Existing wajib_pajak match for the TIN: only to prefill the name. It says
	// nothing about the taxpayer type (orang pribadi/badan) or PTKP.
	knownTaxpayer: { npwp: string; nama: string } | null;
	certificates: LocalBpCertificate[];
	government: boolean;
};

export type LocalBpReceipt = typeof ebupot_receipt_skd_lokal.$inferSelect;

export type LocalBpInvoice = { id: string; nomorFaktur: string; tanggalFaktur: string };

// Period end for a valid (tahun, masaPajak); null for invalid input so callers
// can never bypass a registry check with an impossible period.
const safePeriodEnd = (tahun: number, masaPajak: number): string | null => {
	try {
		return periodEnd(tahun, masaPajak);
	} catch {
		return null;
	}
};

const branchesOf = async (npwp: string): Promise<LocalBranch[]> => {
	if (!npwp) return [];
	return db
		.select({ nitku: tempat_kegiatan_usaha.nitku, nama: tempat_kegiatan_usaha.nama })
		.from(tempat_kegiatan_usaha)
		.innerJoin(wajib_pajak, eq(tempat_kegiatan_usaha.wajib_pajak, wajib_pajak.id))
		.where(eq(wajib_pajak.npwp, npwp))
		.orderBy(asc(tempat_kegiatan_usaha.nitku));
};

export const isGovernmentWithholder = async (owner: string): Promise<boolean> => {
	if (!owner) return false;
	const [row] = await db
		.select({ instansiPemerintah: ebupot_pengaturan_lokal.instansiPemerintah })
		.from(ebupot_pengaturan_lokal)
		.where(eq(ebupot_pengaturan_lokal.npwpPemotong, owner))
		.limit(1);
	return row?.instansiPemerintah ?? false;
};

export const getLocalBpContext = async (
	owner: string,
	tin: string = '',
	tahun?: number,
	masaPajak?: number,
	now: Date = new Date()
): Promise<LocalBpContext> => {
	const current = todayIso(now);
	const year = tahun ?? Number(current.slice(0, 4));
	const month = masaPajak ?? Number(current.slice(5, 7));
	const end = safePeriodEnd(year, month);
	const recipient = tin.trim();

	const [ownBranches, recipientBranches, government] = await Promise.all([
		branchesOf(owner),
		branchesOf(recipient),
		isGovernmentWithholder(owner)
	]);

	let recipientProfile: LocalBpRecipientProfile | null = null;
	let knownTaxpayer: LocalBpContext['knownTaxpayer'] = null;
	let certificates: LocalBpCertificate[] = [];

	if (recipient) {
		const [profile] = await db
			.select({
				nomorIdentitasWp: ebupot_profil_penerima.nomorIdentitasWp,
				nama: ebupot_profil_penerima.nama,
				jenisWp: ebupot_profil_penerima.jenisWp,
				statusPtkp: ebupot_profil_penerima.statusPtkp
			})
			.from(ebupot_profil_penerima)
			.where(
				and(
					eq(ebupot_profil_penerima.npwpPemotong, owner),
					eq(ebupot_profil_penerima.nomorIdentitasWp, recipient)
				)
			)
			.limit(1);
		recipientProfile = profile ?? null;

		const [known] = await db
			.select({ npwp: wajib_pajak.npwp, nama: wajib_pajak.nama })
			.from(wajib_pajak)
			.where(eq(wajib_pajak.npwp, recipient))
			.limit(1);
		knownTaxpayer = known ?? null;

		if (end) {
			const rows = await db
				.select({
					id: ebupot_sertifikat_lokal.id,
					nomorIdentitasWp: ebupot_sertifikat_lokal.nomorIdentitasWp,
					fasilitasKode: ebupot_sertifikat_lokal.fasilitasKode,
					nomorSertifikat: ebupot_sertifikat_lokal.nomorSertifikat,
					berlakuDari: ebupot_sertifikat_lokal.berlakuDari,
					berlakuSampai: ebupot_sertifikat_lokal.berlakuSampai,
					aktif: ebupot_sertifikat_lokal.aktif
				})
				.from(ebupot_sertifikat_lokal)
				.where(
					and(
						eq(ebupot_sertifikat_lokal.npwpPemotong, owner),
						eq(ebupot_sertifikat_lokal.nomorIdentitasWp, recipient),
						eq(ebupot_sertifikat_lokal.aktif, true)
					)
				)
				.orderBy(asc(ebupot_sertifikat_lokal.fasilitasKode), asc(ebupot_sertifikat_lokal.berlakuDari));
			certificates = rows.filter(
				(row) => row.aktif && row.berlakuDari <= end && row.berlakuSampai >= end
			);
		}
	}

	return {
		ownBranches,
		recipientBranches,
		recipientProfile,
		knownTaxpayer,
		certificates,
		government
	};
};

// Active receipt owned by `owner` whose validity includes the inclusive period end.
export const findLocalBpReceipt = async (
	owner: string,
	receiptNumber: string,
	tahun: number,
	masaPajak: number
): Promise<LocalBpReceipt | null> => {
	const end = safePeriodEnd(tahun, masaPajak);
	const number = receiptNumber.trim().toUpperCase();
	if (!owner || !end || !number) return null;

	const [row] = await db
		.select()
		.from(ebupot_receipt_skd_lokal)
		.where(
			and(
				eq(ebupot_receipt_skd_lokal.npwpPemotong, owner),
				eq(ebupot_receipt_skd_lokal.nomorReceipt, number),
				eq(ebupot_receipt_skd_lokal.aktif, true)
			)
		)
		.limit(1);

	if (!row || row.berlakuDari > end || row.berlakuSampai < end) return null;
	return row;
};

// Issued (diupload) invoice: seller is the income recipient, buyer is the withholder.
export const findLocalBpInvoice = async (
	owner: string,
	recipientTin: string,
	nomorDokumen: string
): Promise<LocalBpInvoice | null> => {
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

// Facility "9" (Tanpa Fasilitas) needs no certificate; 4/8/10 need an owned, active
// certificate for the recipient valid on the inclusive period end. Anything else is false.
export const hasLocalBpCertificate = async (
	owner: string,
	tin: string,
	facilityCode: string,
	tahun: number,
	masaPajak: number
): Promise<boolean> => {
	if (facilityCode === '9') return true;
	if (facilityCode !== '4' && facilityCode !== '8' && facilityCode !== '10') return false;
	const end = safePeriodEnd(tahun, masaPajak);
	const recipient = tin.trim();
	if (!owner || !recipient || !end) return false;

	const rows = await db
		.select({
			aktif: ebupot_sertifikat_lokal.aktif,
			berlakuDari: ebupot_sertifikat_lokal.berlakuDari,
			berlakuSampai: ebupot_sertifikat_lokal.berlakuSampai
		})
		.from(ebupot_sertifikat_lokal)
		.where(
			and(
				eq(ebupot_sertifikat_lokal.npwpPemotong, owner),
				eq(ebupot_sertifikat_lokal.nomorIdentitasWp, recipient),
				eq(ebupot_sertifikat_lokal.fasilitasKode, facilityCode),
				eq(ebupot_sertifikat_lokal.aktif, true)
			)
		);
	return rows.some((row) => row.aktif && row.berlakuDari <= end && row.berlakuSampai >= end);
};
