import { form, getRequestEvent } from '$app/server';
import { decimalString, isRealIsoDate, requiredString, rupiahString } from '$lib/helpers/valibot-schema';
import { formatRupiah } from '$lib/helpers/rupiahInput';
import { db } from '$lib/server/db';
import {
	bukti_potong_bp26,
	fasilitas_pajak_ebupot,
	jenis_dokumen_ebupot,
	kode_objek_pajak_pph,
	negara_spt_pph_badan
} from '$lib/server/db/schema';
import { resolveBp26 } from '$lib/server/ebupot/resolveBp26';
import { error, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import * as v from 'valibot';

const UpdateBp26Schema = v.object({
	masaPajak: v.pipe(v.string(), v.transform(Number), v.integer(), v.minValue(1), v.maxValue(12)),
	tahun: v.pipe(v.string(), v.transform(Number), v.integer(), v.minValue(2000)),
	nomorIdentitasWp: requiredString('Nomor Identitas WP harus diisi'),
	nama: requiredString('Nama harus diisi'),
	alamat: requiredString('Alamat harus diisi'),
	negaraAsalId: requiredString('Negara Asal harus dipilih'),
	tanggalLahir: v.optional(v.string(), ''),
	tempatLahir: v.optional(v.string(), ''),
	nomorPaspor: v.optional(v.string(), ''),
	nomorKitasKitap: v.optional(v.string(), ''),
	kodeObjekPajakId: requiredString('Nama Objek Pajak harus dipilih'),
	fasilitasPajakId: requiredString('Fasilitas Pajak harus dipilih'),
	penghasilanBruto: rupiahString('Penghasilan Bruto'),
	// Only used when resolveBp26 says the matched object+facility combo
	// allows a manual override (ManualDeemedRate/ManualTaxRate -- see
	// resolveBp26.ts). Ignored otherwise. No pajakPenghasilanManual --
	// ManualIncomeTaxWithheld never triggers for BP26's only object code.
	dppManual: v.optional(decimalString('DPP')),
	tarifManual: v.optional(decimalString('Tarif')),
	jenisDokumenId: requiredString('Jenis Dokumen harus dipilih'),
	nomorDokumen: requiredString('Nomor Dokumen harus diisi'),
	tanggalDokumen: v.pipe(
		v.string(),
		v.isoDate('Tanggal dokumen tidak valid'),
		v.check(isRealIsoDate, 'Tanggal dokumen tidak valid')
	)
});

export const updateBp26 = form(UpdateBp26Schema, async (input) => {
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
		.select({ id: bukti_potong_bp26.id })
		.from(bukti_potong_bp26)
		.where(
			and(
				eq(bukti_potong_bp26.id, id),
				eq(bukti_potong_bp26.npwpPemotong, activeNpwp),
				eq(bukti_potong_bp26.diterbitkan, false)
			)
		)
		.limit(1);

	if (!existing) {
		error(404, 'BP26 draft tidak ditemukan');
	}

	if (input.nomorIdentitasWp.trim() === activeNpwp) {
		error(400, 'Nomor Identitas WP penerima tidak boleh sama dengan NPWP pemotong');
	}

	const [objekPajak] = await db
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
		error(400, 'Nama Objek Pajak tidak valid');
	}

	const [fasilitas] = await db
		.select()
		.from(fasilitas_pajak_ebupot)
		.where(and(eq(fasilitas_pajak_ebupot.id, input.fasilitasPajakId), eq(fasilitas_pajak_ebupot.aktif, true)))
		.limit(1);

	if (!fasilitas) {
		error(400, 'Fasilitas Pajak tidak valid');
	}

	const [negara] = await db
		.select({ id: negara_spt_pph_badan.id })
		.from(negara_spt_pph_badan)
		.where(and(eq(negara_spt_pph_badan.id, input.negaraAsalId), eq(negara_spt_pph_badan.aktif, true)))
		.limit(1);

	if (!negara) {
		error(400, 'Negara Asal tidak valid');
	}

	const [jenisDokumen] = await db
		.select({ id: jenis_dokumen_ebupot.id })
		.from(jenis_dokumen_ebupot)
		.where(and(eq(jenis_dokumen_ebupot.id, input.jenisDokumenId), eq(jenis_dokumen_ebupot.aktif, true)))
		.limit(1);

	if (!jenisDokumen) {
		error(400, 'Jenis Dokumen tidak valid');
	}

	const penghasilanBruto = Number(input.penghasilanBruto);

	let resolved: ReturnType<typeof resolveBp26>;
	try {
		resolved = resolveBp26(objekPajak.parameterData, fasilitas.kode, penghasilanBruto);
	} catch (err) {
		error(400, err instanceof Error ? err.message : 'Tarif tidak dapat dihitung');
	}

	if (resolved.maxBruto !== undefined && penghasilanBruto > resolved.maxBruto) {
		error(
			400,
			`Penghasilan Bruto melebihi nilai maksimum untuk objek pajak ini (Rp${formatRupiah(resolved.maxBruto)})`
		);
	}

	if (resolved.manualDpp && !input.dppManual) {
		error(400, 'DPP harus diisi untuk kombinasi objek pajak dan fasilitas ini');
	}

	if (resolved.manualTarif && !input.tarifManual) {
		error(400, 'Tarif harus diisi untuk kombinasi objek pajak dan fasilitas ini');
	}

	const dpp = resolved.manualDpp ? Number(input.dppManual) : resolved.dppPercent;
	const tarif = resolved.manualTarif ? Number(input.tarifManual) : resolved.tarif;
	const pajakPenghasilan = Math.round((penghasilanBruto * dpp * tarif) / 10000);

	await db
		.update(bukti_potong_bp26)
		.set({
			masaPajak: input.masaPajak,
			tahun: input.tahun,
			nomorIdentitasWp: input.nomorIdentitasWp.trim(),
			nama: input.nama.trim(),
			alamat: input.alamat.trim(),
			negaraAsalId: negara.id,
			tanggalLahir: input.tanggalLahir || null,
			tempatLahir: input.tempatLahir.trim(),
			nomorPaspor: input.nomorPaspor.trim(),
			nomorKitasKitap: input.nomorKitasKitap.trim(),
			kodeObjekPajakId: objekPajak.id,
			fasilitasPajakId: fasilitas.id,
			penghasilanBruto,
			dpp,
			tarif,
			pajakPenghasilan,
			jenisDokumenId: jenisDokumen.id,
			nomorDokumen: input.nomorDokumen.trim(),
			tanggalDokumen: input.tanggalDokumen,
			// Matches Coretax: every Simpan Konsep save resets the draft to
			// "Disimpan Tidak Valid" -- same rule as BPU/BP21.
			status: 'SAVEDINVALID'
		})
		.where(eq(bukti_potong_bp26.id, id));

	redirect(303, '/ebupot/bp26');
});
