import { form, getRequestEvent } from '$app/server';
import { requiredString, rupiahString } from '$lib/helpers/valibot-schema';
import { bpa1PtkpValues } from '$lib/helpers/ptkp-bpa1';
import { db } from '$lib/server/db';
import { bukti_potong_bpa2, kode_objek_pajak_pph } from '$lib/server/db/schema';
import {
	calculateBiayaJabatan,
	monthCountInclusive,
	resolveBpa2Tax,
	resolvePtkpAmount
} from '$lib/server/ebupot/resolveBpa2';
import { error, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
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
				eq(bukti_potong_bpa2.diterbitkan, false)
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
	const penghasilanBruto =
		gajiPokokPensiun +
		tunjanganIstri +
		tunjanganAnak +
		tunjanganPerbaikanPenghasilan +
		tunjanganStrukturalFungsional +
		tunjanganBeras +
		tunjanganLainLain +
		penghasilanTetapTeraturLainnya;

	const monthCount = monthCountInclusive(
		input.masaPajakAwal,
		input.tahunAwal,
		input.masaPajakAkhir,
		input.tahunAkhir
	);
	const biayaJabatan = calculateBiayaJabatan(penghasilanBruto, monthCount);
	const iuranPensiun = Number(input.iuranPensiun);
	const zakat = Number(input.zakat);
	const jumlahPengurangan = biayaJabatan + iuranPensiun + zakat;
	const penghasilanNeto = penghasilanBruto - jumlahPengurangan;

	const penghasilanNetoSebelumnya = Number(input.penghasilanNetoSebelumnya);
	const netoGabungan = penghasilanNeto + penghasilanNetoSebelumnya;

	const isDisetahunkan = input.jenisPemotongan === 'KURANG_SETAHUN_DISETAHUNKAN';
	const penghasilanNetoSetahunDisetahunkan = isDisetahunkan
		? Math.round((netoGabungan * 12) / monthCount)
		: netoGabungan;

	const penghasilanTidakKenaPajak = resolvePtkpAmount(input.statusPtkp);
	const penghasilanKenaPajak = Math.max(
		0,
		Math.floor((penghasilanNetoSetahunDisetahunkan - penghasilanTidakKenaPajak) / 1000) * 1000
	);

	let resolved: ReturnType<typeof resolveBpa2Tax>;
	try {
		resolved = resolveBpa2Tax(objekPajak.parameterData, penghasilanKenaPajak);
	} catch (err) {
		error(400, err instanceof Error ? err.message : 'Tarif tidak dapat dihitung');
	}

	const pphPasal21AtasPkp = resolved.pajakPenghasilan;
	const pphPasal21Terutang = isDisetahunkan
		? Math.round((pphPasal21AtasPkp * monthCount) / 12)
		: pphPasal21AtasPkp;
	const pphPasal21DipotongSebelumnya = Number(input.pphPasal21DipotongSebelumnya);
	const pphPasal21TerutangPadaIni = pphPasal21Terutang - pphPasal21DipotongSebelumnya;

	// No Fasilitas Pajak/DTP mechanism for BPA2 (live-verified: no such
	// selector exists) -- "PPh Pasal 21 yang Telah Dipotong" is itself a
	// disabled/system-computed field on real Coretax, pulled from monthly
	// Bukti Pemotongan Bulanan Pegawai Tetap history this app doesn't have,
	// so it stays 0 here (same zero-prior-withholding case BPA1's DTP=0
	// default mirrors -- see docs/ui-reference/coretax/ebupot/NOTES.md
	// "BPA2").
	const pphPasal21YangTelahDipotong = 0;
	const pphKurangLebihDipotongDesember = pphPasal21TerutangPadaIni - pphPasal21YangTelahDipotong;

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
			gajiPokokPensiun,
			tunjanganIstri,
			tunjanganAnak,
			tunjanganPerbaikanPenghasilan,
			tunjanganStrukturalFungsional,
			tunjanganBeras,
			tunjanganLainLain,
			penghasilanTetapTeraturLainnya,
			penghasilanBruto,
			biayaJabatan,
			iuranPensiun,
			zakat,
			jumlahPengurangan,
			penghasilanNeto,
			nomorBuktiSebelumnya: input.nomorBuktiSebelumnya.trim(),
			penghasilanNetoSebelumnya,
			penghasilanNetoSetahunDisetahunkan,
			penghasilanTidakKenaPajak,
			penghasilanKenaPajak,
			tarif: resolved.tarif,
			pphPasal21AtasPkp,
			pphPasal21Terutang,
			pphPasal21DipotongSebelumnya,
			pphPasal21TerutangPadaIni,
			pphPasal21YangTelahDipotong,
			pphKurangLebihDipotongDesember,
			// Matches Coretax: every Simpan Konsep save resets the draft to
			// "Disimpan Tidak Valid" -- same rule as BPU/BP21/BP26/BPA1.
			status: 'SAVEDINVALID'
		})
		.where(eq(bukti_potong_bpa2.id, id));

	redirect(303, '/ebupot/bpa2');
});
