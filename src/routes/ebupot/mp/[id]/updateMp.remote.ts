import { form, getRequestEvent } from '$app/server';
import { decimalString, requiredString, rupiahString } from '$lib/helpers/valibot-schema';
import { ptkpEbupotValues } from '$lib/helpers/ptkp-ebupot';
import { formatRupiah } from '$lib/helpers/rupiahInput';
import { db } from '$lib/server/db';
import { bukti_potong_mp, fasilitas_pajak_ebupot, kode_objek_pajak_pph } from '$lib/server/db/schema';
import { resolveBp21 } from '$lib/server/ebupot/resolveBp21';
import { error, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import * as v from 'valibot';

// MP reuses resolveBp21() directly rather than a separate resolver -- its
// object codes' ItemList shape (TER bands keyed to TaxExemptionStatus, plus
// one manual-facility entry) is a strict subset of what resolveBp21 already
// handles, and MP never has a cumulative-bracket object (no 21-401-xx
// equivalent), so brutoSebelumnya is always 0. See
// docs/ui-reference/coretax/ebupot/NOTES.md "MP".
const UpdateMpSchema = v.object({
	masaPajak: v.pipe(v.string(), v.transform(Number), v.integer(), v.minValue(1), v.maxValue(12)),
	tahun: v.pipe(v.string(), v.transform(Number), v.integer(), v.minValue(2000)),
	pegawaiAsing: v.optional(v.picklist(['true', 'false']), 'false'),
	nomorIdentitasWp: requiredString('Nomor Identitas WP harus diisi'),
	nama: requiredString('Nama harus diisi'),
	statusPtkp: requiredString('Status PTKP harus dipilih'),
	jabatan: requiredString('Jabatan harus diisi'),
	kodeObjekPajakId: requiredString('Nama Objek Pajak harus dipilih'),
	fasilitasPajakId: requiredString('Fasilitas Pajak harus dipilih'),
	penghasilanBruto: rupiahString('Penghasilan Bruto'),
	// Only used when resolveBp21 says the matched object+facility combo
	// allows a manual override -- MP's own objects never set ManualDeemedRate
	// per the reference data, so tarifManual/pajakPenghasilanManual are the
	// only ones with a live UI path (Fasilitas Lainnya), but the guard below
	// still covers dppManual defensively.
	dppManual: v.optional(decimalString('DPP')),
	tarifManual: v.optional(decimalString('Tarif')),
	pajakPenghasilanManual: v.optional(rupiahString('Pajak Penghasilan'))
});

export const updateMp = form(UpdateMpSchema, async (input) => {
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
		.select({ id: bukti_potong_mp.id })
		.from(bukti_potong_mp)
		.where(
			and(
				eq(bukti_potong_mp.id, id),
				eq(bukti_potong_mp.npwpPemotong, activeNpwp),
				eq(bukti_potong_mp.diterbitkan, false)
			)
		)
		.limit(1);

	if (!existing) {
		error(404, 'MP draft tidak ditemukan');
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
				eq(kode_objek_pajak_pph.jenisBuktiPotong, 'mp'),
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

	const penghasilanBruto = Number(input.penghasilanBruto);

	let resolved: ReturnType<typeof resolveBp21>;
	try {
		resolved = resolveBp21(objekPajak.parameterData, fasilitas.kode, input.statusPtkp, penghasilanBruto, 0);
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

	if (resolved.manualIncomeTax && !input.pajakPenghasilanManual) {
		error(400, 'Pajak Penghasilan harus diisi untuk kombinasi objek pajak dan fasilitas ini');
	}

	const dpp = resolved.manualDpp ? Number(input.dppManual) : resolved.dppPercent;
	const tarif = resolved.manualTarif ? Number(input.tarifManual) : resolved.tarif;
	const pajakPenghasilanDipotong = resolved.manualIncomeTax
		? Number(input.pajakPenghasilanManual)
		: (resolved.pajakPenghasilanOverride ?? Math.round((penghasilanBruto * dpp * tarif) / 10000));

	await db
		.update(bukti_potong_mp)
		.set({
			masaPajak: input.masaPajak,
			tahun: input.tahun,
			pegawaiAsing: input.pegawaiAsing === 'true',
			nomorIdentitasWp: input.nomorIdentitasWp.trim(),
			nama: input.nama.trim(),
			statusPtkp: input.statusPtkp as (typeof ptkpEbupotValues)[number],
			jabatan: input.jabatan.trim(),
			kodeObjekPajakId: objekPajak.id,
			fasilitasPajakId: fasilitas.id,
			penghasilanBruto,
			tarif,
			pajakPenghasilanDipotong,
			// Matches Coretax: every Simpan Konsep save resets the draft to
			// "Disimpan Tidak Valid" -- same rule as BPU/BP21/BP26/BPA1/BPA2.
			status: 'SAVEDINVALID'
		})
		.where(eq(bukti_potong_mp.id, id));

	redirect(303, '/ebupot/mp');
});
