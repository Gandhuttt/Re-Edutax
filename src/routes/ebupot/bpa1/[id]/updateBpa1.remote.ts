import { form, getRequestEvent } from '$app/server';
import { BPA_MAX_ANNUALIZED_MONTHS, calculateBpa } from '$lib/helpers/bpa-calc';
import { isRealIsoDate, requiredString, rupiahString } from '$lib/helpers/valibot-schema';
import { bpa1PtkpValues } from '$lib/helpers/ptkp-bpa1';
import { db } from '$lib/server/db';
import { bukti_potong_bpa1, fasilitas_pajak_ebupot, jenis_dokumen_ebupot, kode_objek_pajak_pph } from '$lib/server/db/schema';
import { priorMonthlyPph21Withheld } from '$lib/server/ebupot/priorMonthlyWithheld';
import { error, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import * as v from 'valibot';

const jenisPemotonganValues = ['KURANG_SETAHUN', 'KURANG_SETAHUN_DISETAHUNKAN', 'SETAHUN_PENUH'] as const;

// formatRupiah(0) renders an untouched editable field as "" by design (see
// rupiahInput.ts), so an unfilled optional amount submits "" rather than
// being omitted -- v.optional's fallback only fires on a missing key, so ""
// needs its own branch mapped to the same fallback (mirrors booleanRadio's
// documented "" vs undefined handling in valibot-schema.ts).
const optionalRupiah = (field: string) =>
	v.optional(v.union([rupiahString(field), v.pipe(v.literal(''), v.transform(() => '0'))]), '0');

const UpdateBpa1Schema = v.object({
	masaPajakAwal: v.pipe(v.string(), v.transform(Number), v.integer(), v.minValue(1), v.maxValue(12)),
	tahunAwal: v.pipe(v.string(), v.transform(Number), v.integer(), v.minValue(2000)),
	masaPajakAkhir: v.pipe(v.string(), v.transform(Number), v.integer(), v.minValue(1), v.maxValue(12)),
	tahunAkhir: v.pipe(v.string(), v.transform(Number), v.integer(), v.minValue(2000)),
	bekerjaDiLebihDariSatuPemberiKerja: v.optional(v.picklist(['true', 'false']), 'false'),
	pegawaiAsing: v.optional(v.picklist(['true', 'false']), 'false'),
	nomorIdentitasWp: requiredString('Nomor Identitas WP harus diisi'),
	nama: requiredString('Nama harus diisi'),
	statusPtkp: v.picklist(bpa1PtkpValues, 'Status PTKP harus dipilih'),
	jabatan: requiredString('Jabatan harus diisi'),
	kodeObjekPajakId: requiredString('Nama Objek Pajak harus dipilih'),
	fasilitasPajakId: requiredString('Fasilitas Pajak harus dipilih'),
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
	isGrossUp: v.optional(v.picklist(['true', 'false']), 'false'),
	gajiPensiunThtJht: rupiahString('Gaji/Pensiun atau THT/JHT'),
	tunjanganPph: optionalRupiah('Tunjangan PPh'),
	tunjanganLainnya: optionalRupiah('Tunjangan Lainnya'),
	honorarium: optionalRupiah('Honorarium'),
	premiAsuransi: optionalRupiah('Premi Asuransi'),
	natura: optionalRupiah('Natura'),
	tantiemBonus: optionalRupiah('Tantiem/Bonus'),
	iuranPensiun: optionalRupiah('Iuran Pensiun'),
	zakat: optionalRupiah('Zakat'),
	nomorBuktiSebelumnya: v.optional(v.string(), ''),
	penghasilanNetoSebelumnya: optionalRupiah('Penghasilan Neto dari Pemotongan Sebelumnya'),
	pphPasal21DipotongSebelumnya: optionalRupiah('PPh Pasal 21 Dipotong dari Bukti Pemotongan Sebelumnya'),
	jenisDokumenId: requiredString('Jenis Dokumen harus dipilih'),
	nomorDokumen: requiredString('Nomor Dokumen harus diisi'),
	tanggalDokumen: v.pipe(
		v.string(),
		v.isoDate('Tanggal dokumen tidak valid'),
		v.check(isRealIsoDate, 'Tanggal dokumen tidak valid')
	)
});

export const updateBpa1 = form(UpdateBpa1Schema, async (input) => {
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
		.select({ id: bukti_potong_bpa1.id })
		.from(bukti_potong_bpa1)
		.where(
			and(
				eq(bukti_potong_bpa1.id, id),
				eq(bukti_potong_bpa1.npwpPemotong, activeNpwp),
				eq(bukti_potong_bpa1.diterbitkan, false)
			)
		)
		.limit(1);

	if (!existing) {
		error(404, 'BPA1 draft tidak ditemukan');
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
				eq(kode_objek_pajak_pph.jenisBuktiPotong, 'bpa1'),
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

	// Penghasilan Bruto -- a single lump figure for the whole Masa Pajak
	// Awal..Akhir period, not a monthly-recurring amount.
	const gajiPensiunThtJht = Number(input.gajiPensiunThtJht);
	const tunjanganLainnya = Number(input.tunjanganLainnya);
	const honorarium = Number(input.honorarium);
	const premiAsuransi = Number(input.premiAsuransi);
	const natura = Number(input.natura);
	const tantiemBonus = Number(input.tantiemBonus);
	const iuranPensiun = Number(input.iuranPensiun);
	const zakat = Number(input.zakat);
	const penghasilanNetoSebelumnya = Number(input.penghasilanNetoSebelumnya);
	const pphPasal21DipotongSebelumnya = Number(input.pphPasal21DipotongSebelumnya);
	const isGrossUp = input.isGrossUp === 'true';
	const isDtp = fasilitas.kode === '11';

	// DTP moves the whole terutang to "Ditanggung Pemerintah"; otherwise the
	// field holds PPh 21 already withheld through the monthly MP slips, as
	// Coretax's getebupotmpincometaxwithheld lookup fills it.
	const pphDipotongBulanan = isDtp
		? 0
		: await priorMonthlyPph21Withheld({
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
				gajiPensiunThtJht + tunjanganLainnya + honorarium + premiAsuransi + natura + tantiemBonus,
			tunjanganPph: Number(input.tunjanganPph),
			grossUp: isGrossUp,
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
			facilityKode: fasilitas.kode,
			dtp: isDtp,
			pphDipotongBulanan
		});
	} catch (err) {
		error(400, err instanceof Error ? err.message : 'Tarif tidak dapat dihitung');
	}

	await db
		.update(bukti_potong_bpa1)
		.set({
			masaPajakAwal: input.masaPajakAwal,
			tahunAwal: input.tahunAwal,
			masaPajakAkhir: input.masaPajakAkhir,
			tahunAkhir: input.tahunAkhir,
			bekerjaDiLebihDariSatuPemberiKerja: input.bekerjaDiLebihDariSatuPemberiKerja === 'true',
			pegawaiAsing: input.pegawaiAsing === 'true',
			nomorIdentitasWp: input.nomorIdentitasWp.trim(),
			nama: input.nama.trim(),
			statusPtkp: input.statusPtkp,
			jabatan: input.jabatan.trim(),
			kodeObjekPajakId: objekPajak.id,
			fasilitasPajakId: fasilitas.id,
			jenisPemotongan: input.jenisPemotongan,
			jumlahBulan,
			isGrossUp,
			gajiPensiunThtJht,
			tunjanganPph: calc.tunjanganPph,
			tunjanganLainnya,
			honorarium,
			premiAsuransi,
			natura,
			tantiemBonus,
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
			pphDipotongDitanggungPemerintah: calc.pphDipotongAtauDitanggung,
			pphKurangLebihDipotongDesember: calc.pphKurangLebihDipotongDesember,
			jenisDokumenId: jenisDokumen.id,
			nomorDokumen: input.nomorDokumen.trim(),
			tanggalDokumen: input.tanggalDokumen,
			// Matches Coretax: every Simpan Konsep save resets the draft to
			// "Disimpan Tidak Valid" -- same rule as BPU/BP21/BP26.
			status: 'SAVEDINVALID'
		})
		.where(eq(bukti_potong_bpa1.id, id));

	redirect(303, '/ebupot/bpa1');
});
