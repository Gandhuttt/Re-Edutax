import { form, getRequestEvent } from '$app/server';
import { decimalString, isRealIsoDate, requiredString, rupiahString } from '$lib/helpers/valibot-schema';
import { db } from '$lib/server/db';
import { bukti_potong_bpu, fasilitas_pajak_ebupot, jenis_dokumen_ebupot, kode_objek_pajak_pph } from '$lib/server/db/schema';
import { resolveTarif } from '$lib/server/ebupot/resolveTarif';
import { error, redirect } from '@sveltejs/kit';
import { and, eq, ne } from 'drizzle-orm';
import * as v from 'valibot';

const UpdateBpuSchema = v.object({
	masaPajak: v.pipe(v.string(), v.transform(Number), v.integer(), v.minValue(1), v.maxValue(12)),
	tahun: v.pipe(v.string(), v.transform(Number), v.integer(), v.minValue(2000)),
	nomorIdentitasWp: requiredString('Nomor Identitas WP harus diisi'),
	namaPenerima: requiredString('Nama penerima harus diisi'),
	kodeObjekPajakId: requiredString('Nama Objek Pajak harus dipilih'),
	fasilitasPajakId: requiredString('Fasilitas Pajak harus dipilih'),
	dasarPengenaanPajak: rupiahString('Dasar Pengenaan Pajak'),
	// Only used when the resolved object+facility combination allows a manual
	// rate/amount (Coretax's ManualTaxRate/ManualIncomeTaxWithheld: "TRUE" --
	// see resolveTarif). Ignored otherwise; the derived value always wins for
	// non-manual combinations.
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

export const updateBpu = form(UpdateBpuSchema, async (input) => {
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
		.select({ id: bukti_potong_bpu.id })
		.from(bukti_potong_bpu)
		.where(
			and(
				eq(bukti_potong_bpu.id, id),
				eq(bukti_potong_bpu.npwpPemotong, activeNpwp),
				eq(bukti_potong_bpu.diterbitkan, false)
			)
		)
		.limit(1);

	if (!existing) {
		error(404, 'BPU draft tidak ditemukan');
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
				eq(kode_objek_pajak_pph.jenisBuktiPotong, 'bpu'),
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

	const [duplicate] = await db
		.select({ id: bukti_potong_bpu.id })
		.from(bukti_potong_bpu)
		.where(
			and(
				eq(bukti_potong_bpu.npwpPemotong, activeNpwp),
				ne(bukti_potong_bpu.id, id),
				eq(bukti_potong_bpu.nomorIdentitasWp, input.nomorIdentitasWp.trim()),
				eq(bukti_potong_bpu.kodeObjekPajakId, objekPajak.id),
				eq(bukti_potong_bpu.masaPajak, input.masaPajak),
				eq(bukti_potong_bpu.tahun, input.tahun)
			)
		)
		.limit(1);

	if (duplicate) {
		error(
			400,
			'Sudah ada Bukti Potong lain untuk penerima, objek pajak, dan masa pajak yang sama'
		);
	}

	let resolved: ReturnType<typeof resolveTarif>;
	try {
		resolved = resolveTarif(objekPajak.parameterData, fasilitas.kode);
	} catch (err) {
		error(400, err instanceof Error ? err.message : 'Tarif tidak dapat dihitung');
	}

	if (resolved.manual && !input.tarifManual) {
		error(400, 'Tarif harus diisi untuk kombinasi objek pajak dan fasilitas ini');
	}

	if (resolved.manualIncomeTax && !input.pajakPenghasilanManual) {
		error(400, 'Pajak Penghasilan harus diisi untuk kombinasi objek pajak dan fasilitas ini');
	}

	const tarif = resolved.manual ? Number(input.tarifManual) : resolved.tarif;
	const dasarPengenaanPajak = Number(input.dasarPengenaanPajak);
	const pajakPenghasilan = resolved.manualIncomeTax
		? Number(input.pajakPenghasilanManual)
		: Math.round((dasarPengenaanPajak * tarif) / 100);

	await db
		.update(bukti_potong_bpu)
		.set({
			masaPajak: input.masaPajak,
			tahun: input.tahun,
			nomorIdentitasWp: input.nomorIdentitasWp.trim(),
			namaPenerima: input.namaPenerima.trim(),
			kodeObjekPajakId: objekPajak.id,
			fasilitasPajakId: fasilitas.id,
			dasarPengenaanPajak,
			tarif,
			pajakPenghasilan,
			jenisDokumenId: jenisDokumen.id,
			nomorDokumen: input.nomorDokumen.trim(),
			tanggalDokumen: input.tanggalDokumen,
			// Matches Coretax: every Simpan Konsep save resets the draft to
			// "Disimpan Tidak Valid" regardless of whether the data is
			// correct -- only Submit (submitBpu.remote.ts) flips this.
			status: 'SAVEDINVALID'
		})
		.where(eq(bukti_potong_bpu.id, id));

	redirect(303, '/ebupot/bpu');
});
