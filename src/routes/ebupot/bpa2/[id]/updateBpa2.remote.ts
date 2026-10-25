import { form, getRequestEvent } from '$app/server';
import { BPA_MAX_ANNUALIZED_MONTHS, calculateBpa } from '$lib/helpers/bpa-calc';
import { requiredString, rupiahString } from '$lib/helpers/valibot-schema';
import { bpa1PtkpValues } from '$lib/helpers/ptkp-bpa1';
import { db } from '$lib/server/db';
import { bukti_potong_bpa2, kode_objek_pajak_pph } from '$lib/server/db/schema';
import { priorMonthlyPph21Withheld } from '$lib/server/ebupot/priorMonthlyWithheld';
import { error, redirect } from '@sveltejs/kit';
import { and, eq, inArray } from 'drizzle-orm';
import * as v from 'valibot';

const jenisPemotonganValues = ['KURANG_SETAHUN', 'KURANG_SETAHUN_DISETAHUNKAN', 'SETAHUN_PENUH'] as const;

// formatRupiah(0) renders an untouched editable field as "" by design (see
// rupiahInput.ts), so an unfilled optional amount submits "" rather than
// being omitted -- v.optional's fallback only fires on a missing key, so ""
// needs its own branch mapped to the same fallback (same fix already
// applied in updateBpa1.remote.ts).
const optionalRupiah = (field: string) =>
	v.optional(v.union([rupiahString(field), v.pipe(v.literal(''), v.transform(() => '0'))]), '0');

const UpdateBpa2Schema = v.object({
	intent: v.optional(v.picklist(['draft', 'submit']), 'draft'),
	masaPajakAwal: v.pipe(v.string(), v.transform(Number), v.integer(), v.minValue(1), v.maxValue(12)),
	tahunAwal: v.pipe(v.string(), v.transform(Number), v.integer(), v.minValue(2000)),
	masaPajakAkhir: v.pipe(v.string(), v.transform(Number), v.integer(), v.minValue(1), v.maxValue(12)),
	tahunAkhir: v.pipe(v.string(), v.transform(Number), v.integer(), v.minValue(2000)),
	bekerjaDiLebihDariSatuPemberiKerja: v.optional(v.picklist(['true', 'false']), 'false'),
	nomorIdentitasWp: requiredString('Nomor Identitas WP harus diisi'),
	nama: requiredString('Nama harus diisi'),
	nip: requiredString('NIP/NRP harus diisi'),
	pangkatGolongan: requiredString('Pangkat/Golongan harus diisi'),
	statusPtkp: v.picklist(bpa1PtkpValues, 'Status PTKP harus dipilih'),
	posisi: requiredString('Posisi harus diisi'),
	kodeObjekPajakId: requiredString('Nama Objek Pajak harus dipilih'),
	jenisPemotongan: v.picklist(jenisPemotonganValues, 'Jenis Pemotongan harus dipilih'),
	jumlahBulan: v.optional(
		v.pipe(
			v.string(),
			v.nonEmpty('Number Of Months harus diisi'),
			v.transform(Number),
			v.integer('Number Of Months harus berupa bilangan bulat'),
			v.minValue(1, 'Number Of Months harus antara 1 sampai 11'),
			v.maxValue(BPA_MAX_ANNUALIZED_MONTHS, 'Number Of Months harus antara 1 sampai 11')
		)
	),
	gajiPokokPensiun: rupiahString('Gaji Pokok/Pensiun'),
	tunjanganIstri: optionalRupiah('Tunjangan Istri'),
	tunjanganAnak: optionalRupiah('Tunjangan Anak'),
	tunjanganPerbaikanPenghasilan: optionalRupiah('Tunjangan Perbaikan Penghasilan'),
	tunjanganStrukturalFungsional: optionalRupiah('Tunjangan Struktural/Fungsional'),
	tunjanganBeras: optionalRupiah('Tunjangan Beras'),
	tunjanganLainLain: optionalRupiah('Tunjangan Lain-lain'),
	penghasilanTetapTeraturLainnya: optionalRupiah(
		'Penghasilan Tetap dan Teratur Lainnya yang Pembayarannya Terpisah dari Pembayaran Gaji'
	),
	iuranPensiun: optionalRupiah('Iuran Pensiun'),
	zakat: optionalRupiah('Zakat'),
	nomorBuktiSebelumnya: v.optional(v.string(), ''),
	penghasilanNetoSebelumnya: optionalRupiah('Penghasilan Neto dari Pemotongan Sebelumnya'),
	pphPasal21DipotongSebelumnya: optionalRupiah('PPh Pasal 21 Dipotong dari Bukti Pemotongan Sebelumnya')
});

export const updateBpa2 = form(UpdateBpa2Schema, async (input) => {
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
		.select({ id: bukti_potong_bpa2.id })
		.from(bukti_potong_bpa2)
		.where(
			and(
				eq(bukti_potong_bpa2.id, id),
				eq(bukti_potong_bpa2.npwpPemotong, activeNpwp),
				eq(bukti_potong_bpa2.diterbitkan, false),
				inArray(bukti_potong_bpa2.status, ['NORMAL', 'SAVEDINVALID', 'SUBMITTED', 'AMENDMENT'])
			)
		)
		.limit(1);

	if (!existing) {
		error(404, 'BPA2 draft tidak ditemukan');
	}

	if (input.nomorIdentitasWp.trim() === activeNpwp) {
		error(400, 'Nomor Identitas WP penerima tidak boleh sama dengan NPWP pemotong');
	}

	if (
		input.tahunAkhir < input.tahunAwal ||
		(input.tahunAkhir === input.tahunAwal && input.masaPajakAkhir < input.masaPajakAwal)
	) {
		error(400, 'Masa Pajak Akhir tidak boleh sebelum Masa Pajak Awal');
	}
	const isDisetahunkan = input.jenisPemotongan === 'KURANG_SETAHUN_DISETAHUNKAN';
	const jumlahBulan = isDisetahunkan ? input.jumlahBulan : null;
	if (isDisetahunkan && jumlahBulan === undefined) {
		error(400, 'Number Of Months harus diisi');
	}

	const [objekPajak] = await db
		.select()
		.from(kode_objek_pajak_pph)
		.where(
			and(
				eq(kode_objek_pajak_pph.id, input.kodeObjekPajakId),
				eq(kode_objek_pajak_pph.jenisBuktiPotong, 'bpa2'),
				eq(kode_objek_pajak_pph.aktif, true)
			)
		)
		.limit(1);

	if (!objekPajak) {
		error(400, 'Nama Objek Pajak tidak valid');
	}

	// PNS-payroll bruto build-up -- a single lump figure for the whole Masa
	// Pajak Awal..Akhir period, same as BPA1.
	const gajiPokokPensiun = Number(input.gajiPokokPensiun);
	const tunjanganIstri = Number(input.tunjanganIstri);
	const tunjanganAnak = Number(input.tunjanganAnak);
	const tunjanganPerbaikanPenghasilan = Number(input.tunjanganPerbaikanPenghasilan);
	const tunjanganStrukturalFungsional = Number(input.tunjanganStrukturalFungsional);
	const tunjanganBeras = Number(input.tunjanganBeras);
	const tunjanganLainLain = Number(input.tunjanganLainLain);
	const penghasilanTetapTeraturLainnya = Number(input.penghasilanTetapTeraturLainnya);
	const iuranPensiun = Number(input.iuranPensiun);
	const zakat = Number(input.zakat);
	const penghasilanNetoSebelumnya = Number(input.penghasilanNetoSebelumnya);
	const pphPasal21DipotongSebelumnya = Number(input.pphPasal21DipotongSebelumnya);

	// "PPh Pasal 21 yang Telah Dipotong": filled from the monthly MP slips, as
	// Coretax's getebupotmpincometaxwithheld lookup does. BPA2 has no facility.
	const pphDipotongBulanan = await priorMonthlyPph21Withheld({
		npwpPemotong: activeNpwp,
		nomorIdentitasWp: input.nomorIdentitasWp,
		nama: input.nama,
		kodeObjekPajakId: objekPajak.id,
		masaPajakAwal: input.masaPajakAwal,
		tahunAwal: input.tahunAwal,
		masaPajakAkhir: input.masaPajakAkhir,
		tahunAkhir: input.tahunAkhir
	});

	let calc: ReturnType<typeof calculateBpa>;
	try {
		calc = calculateBpa({
			brutoTanpaTunjanganPph:
				gajiPokokPensiun +
				tunjanganIstri +
				tunjanganAnak +
				tunjanganPerbaikanPenghasilan +
				tunjanganStrukturalFungsional +
				tunjanganBeras +
				tunjanganLainLain +
				penghasilanTetapTeraturLainnya,
			tunjanganPph: 0,
			grossUp: false,
			masaPajakAwal: input.masaPajakAwal,
			tahunAwal: input.tahunAwal,
			masaPajakAkhir: input.masaPajakAkhir,
			tahunAkhir: input.tahunAkhir,
			kodeObjek: objekPajak.kode,
			disetahunkan: isDisetahunkan,
			jumlahBulan: jumlahBulan ?? null,
			iuranPensiun,
			zakat,
			penghasilanNetoSebelumnya,
			statusPtkp: input.statusPtkp,
			pphDipotongSebelumnya: pphPasal21DipotongSebelumnya,
			parameterData: objekPajak.parameterData,
			facilityKode: null,
			dtp: false,
			pphDipotongBulanan
		});
	} catch (err) {
		error(400, err instanceof Error ? err.message : 'Tarif tidak dapat dihitung');
	}

	const isSubmit = input.intent === 'submit';
	if (isSubmit && calc.penghasilanBruto <= 0) {
		error(400, 'Penghasilan Bruto harus lebih dari 0 untuk Submit');
	}

	await db
		.update(bukti_potong_bpa2)
		.set({
			masaPajakAwal: input.masaPajakAwal,
			tahunAwal: input.tahunAwal,
			masaPajakAkhir: input.masaPajakAkhir,
			tahunAkhir: input.tahunAkhir,
			bekerjaDiLebihDariSatuPemberiKerja: input.bekerjaDiLebihDariSatuPemberiKerja === 'true',
			nomorIdentitasWp: input.nomorIdentitasWp.trim(),
			nama: input.nama.trim(),
			nip: input.nip.trim(),
			pangkatGolongan: input.pangkatGolongan.trim(),
			statusPtkp: input.statusPtkp,
			posisi: input.posisi.trim(),
			kodeObjekPajakId: objekPajak.id,
			jenisPemotongan: input.jenisPemotongan,
			jumlahBulan,
			gajiPokokPensiun,
			tunjanganIstri,
			tunjanganAnak,
			tunjanganPerbaikanPenghasilan,
			tunjanganStrukturalFungsional,
			tunjanganBeras,
			tunjanganLainLain,
			penghasilanTetapTeraturLainnya,
			penghasilanBruto: calc.penghasilanBruto,
			biayaJabatan: calc.biayaJabatan,
			iuranPensiun,
			zakat,
			jumlahPengurangan: calc.jumlahPengurangan,
			penghasilanNeto: calc.penghasilanNeto,
			nomorBuktiSebelumnya: input.nomorBuktiSebelumnya.trim(),
			penghasilanNetoSebelumnya,
			penghasilanNetoSetahunDisetahunkan: calc.penghasilanNetoSetahunDisetahunkan,
			penghasilanTidakKenaPajak: calc.penghasilanTidakKenaPajak,
			penghasilanKenaPajak: calc.penghasilanKenaPajak,
			tarif: calc.tarif,
			pphPasal21AtasPkp: calc.pphPasal21AtasPkp,
			pphPasal21Terutang: calc.pphPasal21Terutang,
			pphPasal21DipotongSebelumnya,
			pphPasal21TerutangPadaIni: calc.pphPasal21TerutangPadaIni,
			pphPasal21YangTelahDipotong: calc.pphDipotongAtauDitanggung,
			pphKurangLebihDipotongDesember: calc.pphKurangLebihDipotongDesember,
			// Matches Coretax: Simpan Konsep resets the draft to "Disimpan Tidak Valid";
			// only Submit (same validated save) marks it ready to issue.
			status: isSubmit ? 'SUBMITTED' : 'SAVEDINVALID'
		})
		.where(eq(bukti_potong_bpa2.id, id));

	redirect(303, '/ebupot/bpa2');
});
