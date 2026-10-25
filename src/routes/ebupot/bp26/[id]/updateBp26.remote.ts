import { form, getRequestEvent } from '$app/server';
import { isAllowedPeriod, isObjectAvailable, isValidIsoDate, todayIso } from '$lib/helpers/bp-parity';
import { computeBp26Amounts, resolveBp26 } from '$lib/helpers/resolveBp26';
import { formatRupiah } from '$lib/helpers/rupiahInput';
import { db } from '$lib/server/db';
import {
	bukti_potong_bp26,
	fasilitas_pajak_ebupot,
	jenis_dokumen_ebupot,
	kode_objek_pajak_pph,
	negara_spt_pph_badan
} from '$lib/server/db/schema';
import { findBpInvoice, isOwnedBranch } from '$lib/server/ebupot/bpLookup';
import { error, invalid, redirect } from '@sveltejs/kit';
import { and, eq, inArray } from 'drizzle-orm';
import * as v from 'valibot';

// Facility codes offered for BP26 (see fasilitasPajak.remote.ts).
const bp26FasilitasKode = ['4', '7', '8', '9'];
// Statuses an unissued BP26 can no longer be edited from.
const immutableStatuses = ['DELETED', 'CANCELLED', 'AMENDED'];
const MIN_BIRTH_DATE = '1900-01-01';
const decimalRegex = /^\d+(?:\.\d+)?$/;

const optionalText = (label: string, max: number) =>
	v.optional(v.pipe(v.string(), v.trim(), v.maxLength(max, `${label} maksimal ${max} karakter`)), '');

const UpdateBp26Schema = v.object({
	intent: v.optional(v.picklist(['draft', 'submit']), 'draft'),
	masaPajak: v.pipe(
		v.string(),
		v.transform(Number),
		v.integer('Masa Pajak tidak valid'),
		v.minValue(1, 'Masa Pajak tidak valid'),
		v.maxValue(12, 'Masa Pajak tidak valid')
	),
	tahun: v.pipe(
		v.string(),
		v.transform(Number),
		v.integer('Tahun tidak valid'),
		v.minValue(1, 'Tahun tidak valid'),
		v.maxValue(9999, 'Tahun tidak valid')
	),
	nomorIdentitasWp: v.pipe(
		v.string(),
		v.trim(),
		v.nonEmpty('Nomor Identitas WP harus diisi'),
		v.maxLength(50, 'Nomor Identitas WP maksimal 50 karakter')
	),
	nama: v.pipe(
		v.string(),
		v.trim(),
		v.nonEmpty('Nama harus diisi'),
		v.maxLength(100, 'Nama maksimal 100 karakter')
	),
	alamat: optionalText('Alamat', 500),
	negaraAsalId: optionalText('Negara Asal', 100),
	tanggalLahir: optionalText('Tanggal Lahir', 10),
	tempatLahir: optionalText('Tempat Lahir', 100),
	nomorPaspor: optionalText('Nomor Paspor', 50),
	nomorKitasKitap: optionalText('Nomor KITAS/KITAP', 50),
	kodeObjekPajakId: optionalText('Nama Objek Pajak', 100),
	fasilitasPajakId: optionalText('Fasilitas Pajak', 100),
	receiptNumber: optionalText('Receipt Number', 80),
	// "" (empty rupiah box) means 0; digits only after the grouping dots are stripped.
	penghasilanBruto: v.optional(
		v.pipe(
			v.string(),
			v.transform((value) => value.replaceAll('.', '').trim() || '0'),
			v.regex(/^\d+$/, 'Penghasilan Bruto harus berupa angka')
		),
		'0'
	),
	// Only used when the resolver says the object+facility combination is manual.
	dppManual: optionalText('DPP', 20),
	tarifManual: optionalText('Tarif', 20),
	jenisDokumenId: optionalText('Jenis Dokumen', 100),
	nomorDokumen: optionalText('Nomor Dokumen', 100),
	tanggalDokumen: optionalText('Tanggal Dokumen', 10),
	tanggalPemotongan: optionalText('Tanggal Pemotongan', 10),
	nitkuPemotong: optionalText('NITKU Pemotong', 30)
});

type FormField = Exclude<keyof v.InferOutput<typeof UpdateBp26Schema>, 'intent'>;

export const updateBp26 = form(UpdateBp26Schema, async (input, issue) => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;
	const id = event.params.id;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	if (!id) {
		error(400, 'Bad id');
	}

	const [existing] = await db
		.select({
			id: bukti_potong_bp26.id,
			status: bukti_potong_bp26.status,
			diterbitkan: bukti_potong_bp26.diterbitkan
		})
		.from(bukti_potong_bp26)
		.where(and(eq(bukti_potong_bp26.id, id), eq(bukti_potong_bp26.npwpPemotong, activeNpwp)))
		.limit(1);

	if (!existing) {
		error(404, 'BP26 tidak ditemukan');
	}

	if (existing.diterbitkan || immutableStatuses.includes(existing.status)) {
		error(409, 'BP26 ini sudah diterbitkan atau berstatus final dan tidak dapat diubah');
	}

	const submit = input.intent === 'submit';
	const issues: Exclude<Parameters<typeof invalid>[number], string>[] = [];
	const bad = (field: FormField, message: string) => issues.push(issue[field](message));
	const today = todayIso();

	// --- Facility / receipt ---
	let fasilitas: typeof fasilitas_pajak_ebupot.$inferSelect | undefined;
	if (input.fasilitasPajakId) {
		[fasilitas] = await db
			.select()
			.from(fasilitas_pajak_ebupot)
			.where(
				and(
					eq(fasilitas_pajak_ebupot.id, input.fasilitasPajakId),
					eq(fasilitas_pajak_ebupot.aktif, true),
					inArray(fasilitas_pajak_ebupot.kode, bp26FasilitasKode)
				)
			)
			.limit(1);
		if (!fasilitas) bad('fasilitasPajakId', 'Fasilitas Pajak tidak valid');
	} else if (submit) {
		bad('fasilitasPajakId', 'Nama Fasilitas harus dipilih');
	}

	const { nomorIdentitasWp, nama, alamat, negaraAsalId } = input;
	let receiptNumber: string | null = null;

	const periodValid = Number.isInteger(input.tahun) && Number.isInteger(input.masaPajak);

	if (fasilitas?.kode === '7') {
		receiptNumber = input.receiptNumber.toUpperCase() || null;
		if (receiptNumber && !/^[A-Z0-9][A-Z0-9./-]*$/.test(receiptNumber)) {
			bad('receiptNumber', 'Receipt Number hanya boleh berisi huruf, angka, titik, garis miring, dan tanda hubung');
		} else if (submit && !receiptNumber) {
			bad('receiptNumber', 'Receipt Number harus diisi untuk fasilitas Surat Keterangan Domisili');
		}
	}

	if (nomorIdentitasWp === activeNpwp) {
		bad('nomorIdentitasWp', 'Nomor Identitas WP penerima tidak boleh sama dengan NPWP pemotong');
	}

	if (!isAllowedPeriod(input.tahun, input.masaPajak)) {
		bad('masaPajak', 'Masa Pajak berada di luar rentang yang diperbolehkan');
	}

	// --- Foreign identity ---
	if (negaraAsalId) {
		const [negara] = await db
			.select({ id: negara_spt_pph_badan.id })
			.from(negara_spt_pph_badan)
			.where(and(eq(negara_spt_pph_badan.id, negaraAsalId), eq(negara_spt_pph_badan.aktif, true)))
			.limit(1);
		if (!negara) bad('negaraAsalId', 'Negara Asal tidak valid');
	} else if (submit) {
		bad('negaraAsalId', 'Negara Asal harus dipilih');
	}

	if (submit && !alamat) bad('alamat', 'Alamat harus diisi');

	if (input.tanggalLahir) {
		if (!isValidIsoDate(input.tanggalLahir)) {
			bad('tanggalLahir', 'Tanggal Lahir tidak valid');
		} else if (submit && (input.tanggalLahir < MIN_BIRTH_DATE || input.tanggalLahir > today)) {
			bad('tanggalLahir', 'Tanggal Lahir harus antara 1900 dan hari ini');
		}
	}

	if (input.tanggalPemotongan) {
		if (!isValidIsoDate(input.tanggalPemotongan)) {
			bad('tanggalPemotongan', 'Tanggal Pemotongan tidak valid');
		} else if (input.tanggalPemotongan > today) {
			bad('tanggalPemotongan', 'Tanggal Pemotongan tidak boleh setelah hari ini');
		}
	}

	// --- Branch (issuer's own NITKU) ---
	if (input.nitkuPemotong) {
		if (!(await isOwnedBranch(activeNpwp, input.nitkuPemotong))) {
			bad('nitkuPemotong', 'NITKU Pemotong bukan milik akun ini');
		}
	} else if (submit) {
		bad('nitkuPemotong', 'NITKU Pemotong harus dipilih');
	}

	// --- Object ---
	let objekPajak: typeof kode_objek_pajak_pph.$inferSelect | undefined;
	if (input.kodeObjekPajakId) {
		[objekPajak] = await db
			.select()
			.from(kode_objek_pajak_pph)
			.where(
				and(
					eq(kode_objek_pajak_pph.id, input.kodeObjekPajakId),
					eq(kode_objek_pajak_pph.jenisBuktiPotong, 'bp26'),
					eq(kode_objek_pajak_pph.aktif, true)
				)
			)
			.limit(1);
		if (!objekPajak) {
			bad('kodeObjekPajakId', 'Nama Objek Pajak tidak valid');
		} else if (
			fasilitas &&
			periodValid &&
			!isObjectAvailable(objekPajak, fasilitas.kode, input.tahun, input.masaPajak)
		) {
			bad('kodeObjekPajakId', 'Nama Objek Pajak tidak tersedia untuk fasilitas dan masa pajak ini');
			objekPajak = undefined;
		}
	} else if (submit) {
		bad('kodeObjekPajakId', 'Nama Objek Pajak harus dipilih');
	}

	// --- Reference document ---
	let jenisDokumen: { id: string; kode: string } | undefined;
	if (input.jenisDokumenId) {
		[jenisDokumen] = await db
			.select({ id: jenis_dokumen_ebupot.id, kode: jenis_dokumen_ebupot.kode })
			.from(jenis_dokumen_ebupot)
			.where(and(eq(jenis_dokumen_ebupot.id, input.jenisDokumenId), eq(jenis_dokumen_ebupot.aktif, true)))
			.limit(1);
		if (!jenisDokumen) bad('jenisDokumenId', 'Jenis Dokumen tidak valid');
	} else if (submit) {
		bad('jenisDokumenId', 'Jenis Dokumen harus dipilih');
	}
	if (submit && !input.nomorDokumen) bad('nomorDokumen', 'Nomor Dokumen harus diisi');

	let tanggalDokumen = input.tanggalDokumen;
	if (jenisDokumen?.kode === 'TAXINVOICE' && input.nomorDokumen) {
		const invoice = await findBpInvoice(activeNpwp, nomorIdentitasWp, input.nomorDokumen);
		if (invoice) {
			tanggalDokumen = invoice.tanggalFaktur;
		} else if (submit) {
			bad(
				'nomorDokumen',
				'Faktur pajak tidak ditemukan sebagai faktur masukan yang sudah diterbitkan dari penerima ini'
			);
		}
	}
	if (tanggalDokumen) {
		if (!isValidIsoDate(tanggalDokumen)) {
			bad('tanggalDokumen', 'Tanggal Dokumen tidak valid');
		} else if (submit && tanggalDokumen > today) {
			bad('tanggalDokumen', 'Tanggal Dokumen tidak boleh setelah hari ini');
		}
	} else if (submit) {
		bad('tanggalDokumen', 'Tanggal Dokumen harus diisi');
	}

	// --- Amounts (shared resolver; recomputed server-side) ---
	const penghasilanBruto = Number(input.penghasilanBruto);
	const dppInvalid = input.dppManual !== '' && !(decimalRegex.test(input.dppManual) && Number(input.dppManual) <= 100);
	const tarifInvalid =
		input.tarifManual !== '' && !(decimalRegex.test(input.tarifManual) && Number(input.tarifManual) < 1000);
	const brutoInvalid = !Number.isSafeInteger(penghasilanBruto) || penghasilanBruto < 0;
	if (brutoInvalid) {
		bad('penghasilanBruto', 'Penghasilan Bruto tidak valid');
	} else if (submit && penghasilanBruto <= 0) {
		bad('penghasilanBruto', 'Penghasilan Bruto harus lebih dari 0');
	}
	if (dppInvalid) bad('dppManual', 'DPP harus berupa angka 0 sampai 100');
	if (tarifInvalid) bad('tarifManual', 'Tarif harus berupa angka minimal 0 dan kurang dari 1000');

	let dpp = 0;
	let tarif = 0;
	let pajakPenghasilan = 0;
	if (objekPajak && fasilitas && !brutoInvalid && !dppInvalid && !tarifInvalid) {
		try {
			const resolved = resolveBp26(objekPajak.parameterData, fasilitas.kode, penghasilanBruto);
			if (submit && resolved.maxBruto !== undefined && penghasilanBruto > resolved.maxBruto) {
				bad(
					'penghasilanBruto',
					`Penghasilan Bruto melebihi nilai maksimum untuk objek pajak ini (Rp${formatRupiah(resolved.maxBruto)})`
				);
			}
			if (submit && resolved.manualDpp && !input.dppManual) bad('dppManual', 'DPP harus diisi');
			if (submit && resolved.manualTarif && !input.tarifManual) bad('tarifManual', 'Tarif harus diisi');
			// A draft without a manual value falls back to the resolved default.
			({ dpp, tarif, pajakPenghasilan } = computeBp26Amounts(resolved, penghasilanBruto, {
				dppManual: input.dppManual || resolved.dppPercent,
				tarifManual: input.tarifManual || resolved.tarif
			}));
			if (!Number.isFinite(pajakPenghasilan) || pajakPenghasilan < 0) {
				bad('penghasilanBruto', 'Pajak Penghasilan tidak valid');
			}
		} catch (err) {
			bad('fasilitasPajakId', err instanceof Error ? err.message : 'Tarif tidak dapat dihitung');
		}
	}

	if (issues.length > 0) invalid(...issues);

	const updated = await db
		.update(bukti_potong_bp26)
		.set({
			masaPajak: input.masaPajak,
			tahun: input.tahun,
			nomorIdentitasWp,
			nama,
			alamat,
			negaraAsalId: negaraAsalId || null,
			tanggalLahir: input.tanggalLahir || null,
			tempatLahir: input.tempatLahir,
			nomorPaspor: input.nomorPaspor,
			nomorKitasKitap: input.nomorKitasKitap,
			kodeObjekPajakId: objekPajak?.id ?? null,
			fasilitasPajakId: fasilitas?.id ?? null,
			receiptNumber,
			penghasilanBruto,
			dpp,
			tarif,
			pajakPenghasilan,
			jenisDokumenId: jenisDokumen?.id ?? null,
			nomorDokumen: input.nomorDokumen,
			tanggalDokumen: tanggalDokumen || null,
			tanggalPemotongan: input.tanggalPemotongan || null,
			nitkuPemotong: input.nitkuPemotong || null,
			// Draft always resets to "Disimpan Tidak Valid"; Submit marks SUBMITTED.
			status: submit ? 'SUBMITTED' : 'SAVEDINVALID'
		})
		.where(
			and(
				eq(bukti_potong_bp26.id, id),
				eq(bukti_potong_bp26.npwpPemotong, activeNpwp),
				eq(bukti_potong_bp26.diterbitkan, false),
				eq(bukti_potong_bp26.status, existing.status)
			)
		)
		.returning({ id: bukti_potong_bp26.id });

	if (updated.length === 0) {
		error(409, 'Status BP26 berubah saat disimpan. Muat ulang halaman lalu coba lagi.');
	}

	redirect(303, '/ebupot/bp26');
});
