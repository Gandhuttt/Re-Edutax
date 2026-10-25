import { form, getRequestEvent } from '$app/server';
import {
	isAllowedPeriod,
	isObjectAvailable,
	isValidIsoDate,
	todayIso
} from '$lib/helpers/bp-parity';
import { ptkpEbupotValues } from '$lib/helpers/ptkp-ebupot';
import { computeBp21Amounts, resolveBp21, type ResolvedBp21 } from '$lib/helpers/resolveBp21';
import { formatRupiah } from '$lib/helpers/rupiahInput';
import { db } from '$lib/server/db';
import {
	bukti_potong_bp21,
	fasilitas_pajak_ebupot,
	jenis_dokumen_ebupot,
	kode_objek_pajak_pph
} from '$lib/server/db/schema';
import {
	findLocalBpInvoice,
	getLocalBpContext,
	hasLocalBpCertificate,
	isGovernmentWithholder,
	isOwnedBranch
} from '$lib/server/ebupot/localRegistry';
import { error, invalid, redirect } from '@sveltejs/kit';
import { and, eq, inArray } from 'drizzle-orm';
import * as v from 'valibot';

// Object codes with the cumulative Pasal 17 bracket (pesangon/pensiun sekaligus);
// only these use pendapatanBrutoSebelumnya, it is 0 for every other object.
const cumulativeObjectCodes = ['21-401-01', '21-401-02'];
// BP21 only ever references these TaxCertificateCodes (see fasilitasPajak.remote.ts).
const bp21FasilitasKode = ['4', '8', '9', '10'];
// Statuses an unissued row can still be edited in.
const editableStatuses = ['NORMAL', 'SAVEDINVALID', 'SUBMITTED', 'AMENDMENT'];
// Coretax's generic TIN for recipients that are not registered.
const GENERIC_TIN = '9990000000999000';

const optionalText = v.optional(v.string(), '');
const optionalRupiah = v.optional(
	v.pipe(
		v.string(),
		v.transform((value) => value.replaceAll('.', '').trim()),
		v.regex(/^\d{0,15}$/, 'Nominal harus berupa angka bulat nonnegatif')
	),
	''
);
const optionalDecimal = v.optional(
	v.pipe(
		v.string(),
		v.trim(),
		v.regex(/^(?:\d{1,6}(?:\.\d{1,6})?)?$/, 'Nilai harus berupa angka nonnegatif')
	),
	''
);

const UpdateBp21Schema = v.object({
	intent: v.optional(v.picklist(['draft', 'submit']), 'draft'),
	periode: v.pipe(v.string(), v.regex(/^\d{4}-\d{2}$/, 'Masa pajak harus dipilih')),
	nomorIdentitasWp: optionalText,
	namaPenerima: optionalText,
	nitkuPemotong: optionalText,
	nitkuPenerima: optionalText,
	tanggalPemotongan: optionalText,
	statusPtkp: optionalText,
	fasilitasPajakId: optionalText,
	kodeObjekPajakId: optionalText,
	penghasilanBruto: optionalRupiah,
	pendapatanBrutoSebelumnya: optionalRupiah,
	dppManual: optionalDecimal,
	tarifManual: optionalDecimal,
	pajakPenghasilanManual: optionalRupiah,
	jenisDokumenId: optionalText,
	nomorDokumen: optionalText,
	tanggalDokumen: optionalText
});

export const updateBp21 = form(UpdateBp21Schema, async (input, issue) => {
	const event = getRequestEvent();
	const owner = event.locals.user?.username;
	const id = event.params.id;

	if (!owner) error(401, 'Belum login');
	if (!id) error(400, 'Bad id');

	const [existing] = await db
		.select()
		.from(bukti_potong_bp21)
		.where(
			and(
				eq(bukti_potong_bp21.id, id),
				eq(bukti_potong_bp21.npwpPemotong, owner),
				eq(bukti_potong_bp21.diterbitkan, false)
			)
		)
		.limit(1);

	if (!existing) error(404, 'BP21 draft tidak ditemukan');
	if (!editableStatuses.includes(existing.status)) {
		error(409, 'BP21 pada status ini tidak dapat diubah');
	}

	const isSubmit = input.intent === 'submit';
	const errs: Exclude<Parameters<typeof invalid>[number], string>[] = [];

	// --- Masa Pajak ---
	const tahun = Number(input.periode.slice(0, 4));
	const masaPajak = Number(input.periode.slice(5, 7));
	if (masaPajak < 1 || masaPajak > 12) {
		invalid(issue.periode('Masa pajak tidak valid'));
	}
	const government = await isGovernmentWithholder(owner);
	const periodChanged = tahun !== existing.tahun || masaPajak !== existing.masaPajak;
	if ((isSubmit || periodChanged) && !isAllowedPeriod(tahun, masaPajak, government)) {
		errs.push(issue.periode('Masa pajak di luar rentang yang diizinkan, pilih masa pajak yang tersedia'));
	}

	// --- Penerima ---
	const tin = input.nomorIdentitasWp.trim();
	const nama = input.namaPenerima.trim();
	if (!tin) errs.push(issue.nomorIdentitasWp('Nomor Identitas WP harus diisi'));
	else if (tin === owner) {
		errs.push(issue.nomorIdentitasWp('Nomor Identitas WP penerima tidak boleh sama dengan NPWP pemotong'));
	} else if (isSubmit ? !/^\d{16}$/.test(tin) : !/^\d{1,16}$/.test(tin)) {
		errs.push(
			issue.nomorIdentitasWp(
				isSubmit ? 'Nomor Identitas WP harus 16 digit angka' : 'Nomor Identitas WP harus berupa angka (maks 16 digit)'
			)
		);
	}
	if (!nama) errs.push(issue.namaPenerima('Nama penerima harus diisi'));
	else if (nama.length > 100) errs.push(issue.namaPenerima('Nama penerima maksimal 100 karakter'));

	const ctx = await getLocalBpContext(owner, tin, tahun, masaPajak);
	const profile = ctx.recipientProfile;
	if (tin && profile && profile.jenisWp !== 'orang_pribadi') {
		errs.push(
			issue.nomorIdentitasWp(
				`Penerima terdaftar sebagai ${profile.jenisWp === 'badan' ? 'Badan' : 'Luar Negeri'} pada Referensi Lokal, tidak dapat dibuatkan BP21`
			)
		);
	}
	if (isSubmit && tin && !profile && !ctx.knownTaxpayer && tin !== GENERIC_TIN) {
		errs.push(
			issue.nomorIdentitasWp(
				'TIN belum dikenal. Gunakan tombol Cari dan konfirmasi penggunaan TIN generik, atau daftarkan profil penerima di Referensi Lokal'
			)
		);
	}

	// --- Status PTKP ---
	if (input.statusPtkp) {
		if (!ptkpEbupotValues.includes(input.statusPtkp as (typeof ptkpEbupotValues)[number])) {
			errs.push(issue.statusPtkp('Status PTKP tidak valid'));
		} else if (isSubmit && profile?.statusPtkp && profile.statusPtkp !== input.statusPtkp) {
			errs.push(issue.statusPtkp(`Status PTKP harus sama dengan profil lokal penerima (${profile.statusPtkp})`));
		}
	} else if (isSubmit) {
		errs.push(issue.statusPtkp('Status PTKP harus dipilih'));
	}

	// --- Fasilitas, Objek ---
	let fasilitas: typeof fasilitas_pajak_ebupot.$inferSelect | undefined;
	if (input.fasilitasPajakId) {
		[fasilitas] = await db
			.select()
			.from(fasilitas_pajak_ebupot)
			.where(
				and(
					eq(fasilitas_pajak_ebupot.id, input.fasilitasPajakId),
					eq(fasilitas_pajak_ebupot.aktif, true),
					inArray(fasilitas_pajak_ebupot.kode, bp21FasilitasKode)
				)
			)
			.limit(1);
		if (!fasilitas) errs.push(issue.fasilitasPajakId('Fasilitas Pajak tidak valid'));
	} else if (isSubmit) {
		errs.push(issue.fasilitasPajakId('Fasilitas Pajak harus dipilih'));
	}

	let objekPajak: typeof kode_objek_pajak_pph.$inferSelect | undefined;
	if (input.kodeObjekPajakId) {
		[objekPajak] = await db
			.select()
			.from(kode_objek_pajak_pph)
			.where(
				and(
					eq(kode_objek_pajak_pph.id, input.kodeObjekPajakId),
					eq(kode_objek_pajak_pph.jenisBuktiPotong, 'bp21'),
					eq(kode_objek_pajak_pph.aktif, true)
				)
			)
			.limit(1);
		if (!objekPajak) errs.push(issue.kodeObjekPajakId('Nama Objek Pajak tidak valid'));
	} else if (isSubmit) {
		errs.push(issue.kodeObjekPajakId('Nama Objek Pajak harus dipilih'));
	}

	const combinationValid =
		fasilitas && objekPajak
			? isObjectAvailable(objekPajak, fasilitas.kode, tahun, masaPajak)
			: false;
	if (isSubmit && fasilitas && objekPajak && !combinationValid) {
		errs.push(
			issue.kodeObjekPajakId(
				'Kombinasi objek pajak dan fasilitas tidak berlaku pada masa pajak ini, pilih ulang objek pajak'
			)
		);
	}

	if (isSubmit && fasilitas && fasilitas.kode !== '9' && tin) {
		const certified = await hasLocalBpCertificate(owner, tin, fasilitas.kode, tahun, masaPajak);
		if (!certified) {
			errs.push(
				issue.fasilitasPajakId(
					'Tidak ada sertifikat lokal aktif milik Anda untuk penerima ini pada masa pajak tersebut (kelola di Referensi Lokal)'
				)
			);
		}
	}

	// --- NITKU ---
	const nitkuPemotong = input.nitkuPemotong.trim();
	const nitkuPenerima = input.nitkuPenerima.trim();
	if (nitkuPemotong) {
		if (!(await isOwnedBranch(owner, nitkuPemotong))) {
			errs.push(issue.nitkuPemotong('NITKU pemotong tidak terdaftar pada akun Anda'));
		}
	} else if (isSubmit) {
		errs.push(issue.nitkuPemotong('NITKU pemotong harus dipilih'));
	}
	if (nitkuPenerima) {
		if (!ctx.recipientBranches.some((branch) => branch.nitku === nitkuPenerima)) {
			errs.push(issue.nitkuPenerima('NITKU penerima tidak terdaftar untuk penerima ini'));
		}
	} else if (isSubmit) {
		errs.push(issue.nitkuPenerima('NITKU penerima harus dipilih; penerima perlu memiliki cabang di referensi lokal akunnya'));
	}

	// --- Dokumen referensi ---
	const today = todayIso();
	let jenisDokumen: { id: string; kode: string } | undefined;
	if (input.jenisDokumenId) {
		[jenisDokumen] = await db
			.select({ id: jenis_dokumen_ebupot.id, kode: jenis_dokumen_ebupot.kode })
			.from(jenis_dokumen_ebupot)
			.where(and(eq(jenis_dokumen_ebupot.id, input.jenisDokumenId), eq(jenis_dokumen_ebupot.aktif, true)))
			.limit(1);
		if (!jenisDokumen) errs.push(issue.jenisDokumenId('Jenis Dokumen tidak valid'));
	} else if (isSubmit) {
		errs.push(issue.jenisDokumenId('Jenis Dokumen harus dipilih'));
	}

	const nomorDokumen = input.nomorDokumen.trim();
	if (isSubmit && !nomorDokumen) errs.push(issue.nomorDokumen('Nomor Dokumen harus diisi'));

	let tanggalDokumen = input.tanggalDokumen.trim();
	if (jenisDokumen?.kode === 'TAXINVOICE' && nomorDokumen && tin) {
		const invoice = await findLocalBpInvoice(owner, tin, nomorDokumen);
		if (invoice) tanggalDokumen = invoice.tanggalFaktur;
		else if (isSubmit) {
			errs.push(
				issue.nomorDokumen(
					'Faktur pajak tidak ditemukan: harus faktur terbit dari penerima (penjual) kepada Anda (pembeli)'
				)
			);
		}
	}
	if (tanggalDokumen) {
		if (!isValidIsoDate(tanggalDokumen)) errs.push(issue.tanggalDokumen('Tanggal dokumen tidak valid'));
		else if (isSubmit && tanggalDokumen > today) {
			errs.push(issue.tanggalDokumen('Tanggal dokumen tidak boleh melebihi hari ini'));
		}
	} else if (isSubmit) {
		errs.push(issue.tanggalDokumen('Tanggal dokumen harus diisi'));
	}

	const tanggalPemotongan = input.tanggalPemotongan.trim();
	if (tanggalPemotongan) {
		if (!isValidIsoDate(tanggalPemotongan)) {
			errs.push(issue.tanggalPemotongan('Tanggal pemotongan tidak valid'));
		} else if (tanggalPemotongan > today) {
			errs.push(issue.tanggalPemotongan('Tanggal pemotongan tidak boleh melebihi hari ini'));
		}
	}

	// --- Penghasilan & derived amounts (always recomputed server-side) ---
	const penghasilanBruto = Number(input.penghasilanBruto || '0');
	const isCumulativeObject = objekPajak ? cumulativeObjectCodes.includes(objekPajak.kode) : false;
	const pendapatanBrutoSebelumnya = isCumulativeObject ? Number(input.pendapatanBrutoSebelumnya || '0') : 0;

	let resolved: ResolvedBp21 | undefined;
	if (objekPajak && fasilitas) {
		try {
			resolved = resolveBp21(
				objekPajak.parameterData,
				fasilitas.kode,
				input.statusPtkp,
				penghasilanBruto,
				pendapatanBrutoSebelumnya
			);
		} catch {
			resolved = undefined;
		}
	}

	if (isSubmit) {
		if (penghasilanBruto <= 0) errs.push(issue.penghasilanBruto('Penghasilan Bruto harus lebih dari 0'));
		if (resolved) {
			if (resolved.maxBruto !== undefined && penghasilanBruto > resolved.maxBruto) {
				errs.push(
					issue.penghasilanBruto(
						`Penghasilan Bruto melebihi nilai maksimum untuk objek pajak ini (Rp${formatRupiah(resolved.maxBruto)})`
					)
				);
			}
			if (resolved.manualDpp && !input.dppManual) errs.push(issue.dppManual('DPP harus diisi untuk kombinasi ini'));
			if (resolved.manualTarif && !input.tarifManual) {
				errs.push(issue.tarifManual('Tarif harus diisi untuk kombinasi ini'));
			}
			if (resolved.manualIncomeTax && !input.pajakPenghasilanManual) {
				errs.push(issue.pajakPenghasilanManual('Pajak Penghasilan harus diisi untuk kombinasi ini'));
			}
		}
	}

	if (errs.length > 0) invalid(...errs);

	const amounts = resolved
		? computeBp21Amounts(resolved, penghasilanBruto, {
				dppManual: input.dppManual || '0',
				tarifManual: input.tarifManual || '0',
				pajakPenghasilanManual: input.pajakPenghasilanManual || '0'
			})
		: { dpp: 0, tarif: 0, pajakPenghasilan: 0 };

	// Guarded update: the row must still be this owner's, unissued and in the status we
	// validated against, so a stale save cannot clobber a concurrent transition.
	const updated = await db
		.update(bukti_potong_bp21)
		.set({
			masaPajak,
			tahun,
			nomorIdentitasWp: tin,
			namaPenerima: nama,
			statusPtkp: (input.statusPtkp || null) as (typeof ptkpEbupotValues)[number] | null,
			kodeObjekPajakId: objekPajak?.id ?? null,
			fasilitasPajakId: fasilitas?.id ?? null,
			penghasilanBruto,
			pendapatanBrutoSebelumnya,
			dpp: amounts.dpp,
			tarif: amounts.tarif,
			pajakPenghasilan: amounts.pajakPenghasilan,
			jenisDokumenId: jenisDokumen?.id ?? null,
			nomorDokumen,
			tanggalDokumen: tanggalDokumen || null,
			tanggalPemotongan: tanggalPemotongan || null,
			nitkuPemotong: nitkuPemotong || null,
			nitkuPenerima: nitkuPenerima || null,
			// Draft always resets to "Disimpan Tidak Valid"; only a complete Submit validates.
			status: isSubmit ? 'SUBMITTED' : 'SAVEDINVALID'
		})
		.where(
			and(
				eq(bukti_potong_bp21.id, id),
				eq(bukti_potong_bp21.npwpPemotong, owner),
				eq(bukti_potong_bp21.diterbitkan, false),
				eq(bukti_potong_bp21.status, existing.status)
			)
		)
		.returning({ id: bukti_potong_bp21.id });

	if (updated.length === 0) {
		invalid('BP21 sudah berubah atau diterbitkan dari sesi lain. Muat ulang halaman sebelum menyimpan.');
	}

	redirect(303, '/ebupot/bp21');
});
