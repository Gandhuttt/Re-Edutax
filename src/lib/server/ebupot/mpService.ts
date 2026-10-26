import { isObjectAvailable, isValidIsoDate } from '$lib/helpers/bp-parity';
import {
	MP_DEFAULT_FASILITAS_KODE,
	MP_FASILITAS_KODE,
	MP_GENERIC_TIN,
	MP_MAX_AMOUNT,
	computeMpAmounts,
	isAllowedMpPeriod,
	resolveMp
} from '$lib/helpers/mp-parity';
import { ptkpEbupotValues, type PtkpEbupot } from '$lib/helpers/ptkp-ebupot';
import type { ResolvedBp21 } from '$lib/helpers/resolveBp21';
import { formatRupiah } from '$lib/helpers/rupiahInput';
import { db } from '$lib/server/db';
import { fasilitas_pajak_ebupot, kode_objek_pajak_pph } from '$lib/server/db/schema';
import { getBpContext, isOwnedBranch } from '$lib/server/ebupot/bpLookup';
import { and, eq, inArray } from 'drizzle-orm';

// Shared by the MP form (updateMp.remote.ts) and the XML importer, so both apply the
// same period/identity/object/branch rules and the same server-side amount derivation.

export type MpInput = {
	tahun: number;
	masaPajak: number;
	pegawaiAsing: boolean;
	nomorPaspor?: string;
	nomorIdentitasWp: string;
	nama: string;
	nitkuPemotong: string;
	statusPtkp: string;
	jabatan: string;
	kodeObjekPajakId: string;
	/** Blank defaults to Tanpa Fasilitas (kode 9). */
	fasilitasPajakId: string;
	/** Non-negative integer rupiah as a string. */
	penghasilanBruto: string;
	tarifManual?: string;
	pajakPenghasilanManual?: string;
	tanggalPemotongan?: string | null;
};

export type MpIssue = { field: string; message: string };

export type MpValues = {
	masaPajak: number;
	tahun: number;
	pegawaiAsing: boolean;
	nomorPaspor: string;
	nomorIdentitasWp: string;
	nama: string;
	statusPtkp: PtkpEbupot | null;
	jabatan: string;
	kodeObjekPajakId: string | null;
	fasilitasPajakId: string | null;
	penghasilanBruto: number;
	tarif: number;
	pajakPenghasilanDipotong: number;
	nitkuPemotong: string | null;
	tanggalPemotongan: string | null;
};

export type MpExisting = {
	tahun: number;
	masaPajak: number;
	kodeObjekPajakId: string | null;
	fasilitasPajakId: string | null;
};

export const getMpObjectByKode = async (kode: string) =>
	(
		await db
			.select()
			.from(kode_objek_pajak_pph)
			.where(
				and(
					eq(kode_objek_pajak_pph.kode, kode),
					eq(kode_objek_pajak_pph.jenisBuktiPotong, 'mp'),
					eq(kode_objek_pajak_pph.aktif, true)
				)
			)
			.limit(1)
	)[0];

export const getMpFacilityByKode = async (kode: string) =>
	(
		await db
			.select()
			.from(fasilitas_pajak_ebupot)
			.where(
				and(
					eq(fasilitas_pajak_ebupot.kode, kode),
					eq(fasilitas_pajak_ebupot.aktif, true),
					inArray(fasilitas_pajak_ebupot.kode, MP_FASILITAS_KODE)
				)
			)
			.limit(1)
	)[0];

const rupiahPattern = /^\d{1,15}$/;
const decimalPattern = /^\d+(?:\.\d+)?$/;

export async function prepareMp(
	owner: string,
	input: MpInput,
	opts: { submit: boolean; existing?: MpExisting | null }
): Promise<{ errors: MpIssue[]; values: MpValues }> {
	const { submit, existing } = opts;
	const errors: MpIssue[] = [];
	const err = (field: string, message: string) => errors.push({ field, message });

	// --- Masa Pajak: validated on Submit or whenever the stored period changes ---
	const { tahun, masaPajak } = input;
	const periodChanged = !existing || tahun !== existing.tahun || masaPajak !== existing.masaPajak;
	if (!Number.isInteger(tahun) || !Number.isInteger(masaPajak) || masaPajak < 1 || masaPajak > 12) {
		err('periode', 'Masa pajak tidak valid');
	} else if ((submit || periodChanged) && !isAllowedMpPeriod(tahun, masaPajak)) {
		err('periode', 'Masa pajak di luar rentang yang diizinkan, pilih masa pajak yang tersedia (Desember tidak tersedia)');
	}

	// --- Penerima ---
	const tin = input.nomorIdentitasWp.trim();
	const ctx = await getBpContext(owner, tin);
	// The name is master data; only the confirmed generic convention may carry an original identity.
	const genericName = /^PENERIMA PENGHASILAN#(\d{3,16})$/.exec(input.nama.trim());
	const nama =
		tin === MP_GENERIC_TIN && genericName
			? `PENERIMA PENGHASILAN#${genericName[1]}`
			: (ctx.knownTaxpayer?.nama.trim() ?? '');
	if (!tin) err('nomorIdentitasWp', 'Nomor Identitas WP harus diisi');
	else if (tin === owner) {
		err('nomorIdentitasWp', 'Nomor Identitas WP penerima tidak boleh sama dengan NPWP pemotong');
	} else if (!/^\d{3,16}$/.test(tin)) {
		err('nomorIdentitasWp', 'Nomor Identitas WP harus berupa 3 sampai 16 digit angka');
	} else if (!ctx.knownTaxpayer && tin !== MP_GENERIC_TIN) {
		err(
			'nomorIdentitasWp',
			'TIN belum terdaftar. Gunakan tombol Cari NPWP dan konfirmasi penggunaan TIN generik'
		);
	}
	if (!nama) err('nama', 'Nama harus terisi melalui pencarian Nomor Identitas WP');
	else if (nama.length < 3 || nama.length > 150) err('nama', 'Nama harus 3 sampai 150 karakter');

	const nomorPaspor = (input.nomorPaspor ?? '').trim();
	if (nomorPaspor.length > 64) err('nomorPaspor', 'Nomor paspor maksimal 64 karakter');

	const jabatan = input.jabatan.trim();
	if (jabatan.length > 150) err('jabatan', 'Jabatan maksimal 150 karakter');
	else if (submit && !jabatan) err('jabatan', 'Jabatan harus diisi');

	// --- Status PTKP ---
	const statusPtkp = input.statusPtkp.trim();
	if (statusPtkp) {
		if (!ptkpEbupotValues.includes(statusPtkp as PtkpEbupot)) err('statusPtkp', 'Status PTKP tidak valid');
	} else if (submit) err('statusPtkp', 'Status PTKP harus dipilih');

	// --- Fasilitas (default Tanpa Fasilitas) ---
	let fasilitas: typeof fasilitas_pajak_ebupot.$inferSelect | undefined;
	if (input.fasilitasPajakId) {
		[fasilitas] = await db
			.select()
			.from(fasilitas_pajak_ebupot)
			.where(
				and(
					eq(fasilitas_pajak_ebupot.id, input.fasilitasPajakId),
					eq(fasilitas_pajak_ebupot.aktif, true),
					inArray(fasilitas_pajak_ebupot.kode, MP_FASILITAS_KODE)
				)
			)
			.limit(1);
		if (!fasilitas) err('fasilitasPajakId', 'Fasilitas Pajak tidak valid');
	} else {
		fasilitas = await getMpFacilityByKode(MP_DEFAULT_FASILITAS_KODE);
		if (!fasilitas && submit) err('fasilitasPajakId', 'Fasilitas Pajak harus dipilih');
	}

	// --- Objek pajak ---
	let objekPajak: typeof kode_objek_pajak_pph.$inferSelect | undefined;
	if (input.kodeObjekPajakId) {
		[objekPajak] = await db
			.select()
			.from(kode_objek_pajak_pph)
			.where(
				and(
					eq(kode_objek_pajak_pph.id, input.kodeObjekPajakId),
					eq(kode_objek_pajak_pph.jenisBuktiPotong, 'mp'),
					eq(kode_objek_pajak_pph.aktif, true)
				)
			)
			.limit(1);
		if (!objekPajak) err('kodeObjekPajakId', 'Nama Objek Pajak tidak valid');
	} else if (submit) err('kodeObjekPajakId', 'Nama Objek Pajak harus dipilih');

	// Validity/facility compatibility: required on Submit, and on a draft whenever the
	// combination changed (a legacy untouched combination may still be saved as draft).
	if (objekPajak && fasilitas && Number.isInteger(tahun) && masaPajak >= 1 && masaPajak <= 12) {
		const combinationChanged =
			!existing ||
			periodChanged ||
			existing.kodeObjekPajakId !== objekPajak.id ||
			existing.fasilitasPajakId !== fasilitas.id;
		if ((submit || combinationChanged) && !isObjectAvailable(objekPajak, fasilitas.kode, tahun, masaPajak)) {
			err(
				'kodeObjekPajakId',
				'Kombinasi objek pajak dan fasilitas tidak berlaku pada masa pajak ini, pilih ulang objek pajak'
			);
		}
	}

	// --- NITKU pemotong ---
	const nitkuPemotong = input.nitkuPemotong.trim();
	if (nitkuPemotong) {
		if (!(await isOwnedBranch(owner, nitkuPemotong))) {
			err('nitkuPemotong', 'NITKU pemotong tidak terdaftar pada akun Anda');
		}
	} else if (submit) err('nitkuPemotong', 'NITKU pemotong harus dipilih');

	// --- Tanggal pemotongan (XML WithholdingDate, preserved) ---
	const tanggalPemotongan = (input.tanggalPemotongan ?? '').trim();
	if (tanggalPemotongan && !isValidIsoDate(tanggalPemotongan)) {
		err('tanggalPemotongan', 'Tanggal pemotongan tidak valid');
	}

	// --- Amounts: finite, safe, non-negative; derived values always recomputed here ---
	const brutoText = input.penghasilanBruto.trim() || '0';
	let penghasilanBruto = 0;
	if (!rupiahPattern.test(brutoText)) {
		err('penghasilanBruto', 'Penghasilan Bruto harus berupa angka bulat nonnegatif');
	} else {
		penghasilanBruto = Number(brutoText);
		if (!Number.isSafeInteger(penghasilanBruto) || penghasilanBruto > MP_MAX_AMOUNT) {
			err('penghasilanBruto', 'Penghasilan Bruto terlalu besar');
			penghasilanBruto = 0;
		}
	}

	const tarifText = (input.tarifManual ?? '').trim();
	const pajakText = (input.pajakPenghasilanManual ?? '').trim();
	if (tarifText && (!decimalPattern.test(tarifText) || !Number.isFinite(Number(tarifText)) || Number(tarifText) >= 1000)) {
		err('tarifManual', 'Tarif harus berupa angka nonnegatif kurang dari 1000');
	}
	if (pajakText && (!rupiahPattern.test(pajakText) || Number(pajakText) > MP_MAX_AMOUNT)) {
		err('pajakPenghasilanManual', 'Pajak Penghasilan harus berupa angka bulat nonnegatif');
	}
	const manual = {
		tarifManual: errors.some((e) => e.field === 'tarifManual') ? '' : tarifText,
		pajakPenghasilanManual: errors.some((e) => e.field === 'pajakPenghasilanManual') ? '' : pajakText
	};

	let tarif = Number(manual.tarifManual || '0');
	let pajakPenghasilanDipotong = Number(manual.pajakPenghasilanManual || '0');
	if (objekPajak && fasilitas) {
		let resolved: ResolvedBp21 | undefined;
		try {
			resolved = resolveMp(objekPajak.parameterData, fasilitas.kode, statusPtkp, penghasilanBruto);
		} catch {
			resolved = undefined;
		}
		if (resolved) {
			if (submit) {
				if (penghasilanBruto <= 0) err('penghasilanBruto', 'Penghasilan Bruto harus lebih dari 0');
				if (resolved.maxBruto !== undefined && penghasilanBruto > resolved.maxBruto) {
					err(
						'penghasilanBruto',
						`Penghasilan Bruto melebihi nilai maksimum untuk objek pajak ini (Rp${formatRupiah(resolved.maxBruto)})`
					);
				}
				if (resolved.manualTarif && !tarifText) err('tarifManual', 'Tarif harus diisi untuk kombinasi ini');
				if (resolved.manualIncomeTax && !pajakText) {
					err('pajakPenghasilanManual', 'Pajak Penghasilan harus diisi untuk kombinasi ini');
				}
			}
			({ tarif, pajakPenghasilanDipotong } = computeMpAmounts(resolved, penghasilanBruto, manual));
		} else if (submit) {
			err('fasilitasPajakId', 'Fasilitas pajak tidak berlaku untuk objek pajak ini');
		}
	} else if (submit && penghasilanBruto <= 0) err('penghasilanBruto', 'Penghasilan Bruto harus lebih dari 0');

	if (!Number.isFinite(tarif) || !Number.isFinite(pajakPenghasilanDipotong) || pajakPenghasilanDipotong > MP_MAX_AMOUNT) {
		err('pajakPenghasilanManual', 'Pajak Penghasilan tidak valid');
		tarif = 0;
		pajakPenghasilanDipotong = 0;
	}

	return {
		errors,
		values: {
			masaPajak,
			tahun,
			pegawaiAsing: input.pegawaiAsing,
			nomorPaspor,
			nomorIdentitasWp: tin,
			nama,
			statusPtkp: (statusPtkp || null) as PtkpEbupot | null,
			jabatan,
			kodeObjekPajakId: objekPajak?.id ?? null,
			fasilitasPajakId: fasilitas?.id ?? null,
			penghasilanBruto,
			tarif,
			pajakPenghasilanDipotong,
			nitkuPemotong: nitkuPemotong || null,
			tanggalPemotongan: tanggalPemotongan || null
		}
	};
}
