import { form, getRequestEvent } from '$app/server';
import { decimalString, isRealIsoDate, requiredString, rupiahString } from '$lib/helpers/valibot-schema';
import { ptkpEbupotValues } from '$lib/helpers/ptkp-ebupot';
import { db } from '$lib/server/db';
import { bukti_potong_bp21, fasilitas_pajak_ebupot, jenis_dokumen_ebupot, kode_objek_pajak_pph } from '$lib/server/db/schema';
import { resolveBp21 } from '$lib/server/ebupot/resolveBp21';
import { error, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import * as v from 'valibot';

// Object codes with the cumulative Pasal 17 bracket (pesangon/pensiun
// sekaligus) -- see resolveBp21.ts and docs/ui-reference/coretax/ebupot/
// NOTES.md "BP21: cumulative bruto". Only these two use
// pendapatanBrutoSebelumnya; harmless 0 for every other object.
const cumulativeObjectCodes = ['21-401-01', '21-401-02'];

const UpdateBp21Schema = v.object({
	masaPajak: v.pipe(v.string(), v.transform(Number), v.integer(), v.minValue(1), v.maxValue(12)),
	tahun: v.pipe(v.string(), v.transform(Number), v.integer(), v.minValue(2000)),
	nomorIdentitasWp: requiredString('Nomor Identitas WP harus diisi'),
	namaPenerima: requiredString('Nama penerima harus diisi'),
	statusPtkp: requiredString('Status PTKP harus dipilih'),
	kodeObjekPajakId: requiredString('Nama Objek Pajak harus dipilih'),
	fasilitasPajakId: requiredString('Fasilitas Pajak harus dipilih'),
	penghasilanBruto: rupiahString('Penghasilan Bruto'),
	pendapatanBrutoSebelumnya: v.optional(rupiahString('Pendapatan Bruto yang Telah Dibayar Sebelumnya')),
	// Only used when resolveBp21 says the matched object+facility combo
	// allows a manual override (ManualDeemedRate/ManualTaxRate/
	// ManualIncomeTaxWithheld -- see resolveBp21.ts). Ignored otherwise.
	dppManual: v.optional(decimalString('DPP')),
	tarifManual: v.optional(decimalString('Tarif')),
	pajakPenghasilanManual: v.optional(rupiahString('Pajak Penghasilan')),
	jenisDokumenId: requiredString('Jenis Dokumen harus dipilih'),
	nomorDokumen: requiredString('Nomor Dokumen harus diisi'),
	tanggalDokumen: v.pipe(
		v.string(),
		v.isoDate('Tanggal dokumen tidak valid'),
		v.check(isRealIsoDate, 'Tanggal dokumen tidak valid')
	)
});

export const updateBp21 = form(UpdateBp21Schema, async (input) => {
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
		.select({ id: bukti_potong_bp21.id })
		.from(bukti_potong_bp21)
		.where(
			and(
				eq(bukti_potong_bp21.id, id),
				eq(bukti_potong_bp21.npwpPemotong, activeNpwp),
				eq(bukti_potong_bp21.diterbitkan, false)
			)
		)
		.limit(1);

	if (!existing) {
		error(404, 'BP21 draft tidak ditemukan');
	}

	if (input.nomorIdentitasWp.trim() === activeNpwp) {
		error(400, 'Nomor Identitas WP penerima tidak boleh sama dengan NPWP pemotong');
	}

	if (!ptkpEbupotValues.includes(input.statusPtkp as (typeof ptkpEbupotValues)[number])) {
		error(400, 'Status PTKP tidak valid');
	}

	const [objekPajak] = await db
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

	const [jenisDokumen] = await db
		.select({ id: jenis_dokumen_ebupot.id })
		.from(jenis_dokumen_ebupot)
		.where(and(eq(jenis_dokumen_ebupot.id, input.jenisDokumenId), eq(jenis_dokumen_ebupot.aktif, true)))
		.limit(1);

	if (!jenisDokumen) {
		error(400, 'Jenis Dokumen tidak valid');
	}

	const penghasilanBruto = Number(input.penghasilanBruto);
	const isCumulativeObject = cumulativeObjectCodes.includes(objekPajak.kode);
	const pendapatanBrutoSebelumnya = isCumulativeObject
		? Number(input.pendapatanBrutoSebelumnya ?? '0')
		: 0;

	let resolved: ReturnType<typeof resolveBp21>;
	try {
		resolved = resolveBp21(
			objekPajak.parameterData,
			fasilitas.kode,
			input.statusPtkp,
			penghasilanBruto,
			pendapatanBrutoSebelumnya
		);
	} catch (err) {
		error(400, err instanceof Error ? err.message : 'Tarif tidak dapat dihitung');
	}

	if (resolved.manualDpp && !input.dppManual) {
		error(400, 'DPP harus diisi untuk kombinasi objek pajak dan fasilitas ini');
	}

	if (resolved.manualTarif && !input.tarifManual) {
		error(400, 'Tarif harus diisi untuk kombinasi objek pajak dan fasilitas ini');
	}

	if (resolved.manualIncomeTax && !input.pajakPenghasilanManual) {
		error(400, 'Pajak Penghasilan harus diisi untuk kombinasi objek pajak dan fasilitas ini');
	}

	const dpp = resolved.manualDpp ? Number(input.dppManual) : resolved.dppPercent;
	const tarif = resolved.manualTarif ? Number(input.tarifManual) : resolved.tarif;
	const pajakPenghasilan = resolved.manualIncomeTax
		? Number(input.pajakPenghasilanManual)
		: (resolved.pajakPenghasilanOverride ??
			Math.round((penghasilanBruto * dpp * tarif) / 10000));

	await db
		.update(bukti_potong_bp21)
		.set({
			masaPajak: input.masaPajak,
			tahun: input.tahun,
			nomorIdentitasWp: input.nomorIdentitasWp.trim(),
			namaPenerima: input.namaPenerima.trim(),
			statusPtkp: input.statusPtkp as (typeof ptkpEbupotValues)[number],
			kodeObjekPajakId: objekPajak.id,
			fasilitasPajakId: fasilitas.id,
			penghasilanBruto,
			pendapatanBrutoSebelumnya,
			dpp,
			tarif,
			pajakPenghasilan,
			jenisDokumenId: jenisDokumen.id,
			nomorDokumen: input.nomorDokumen.trim(),
			tanggalDokumen: input.tanggalDokumen,
			// Matches Coretax: every Simpan Konsep save resets the draft to
			// "Disimpan Tidak Valid" regardless of whether the data is
			// correct -- same rule as BPU (see updateBpu.remote.ts).
			status: 'SAVEDINVALID'
		})
		.where(eq(bukti_potong_bp21.id, id));

	redirect(303, '/ebupot/bp21');
});
