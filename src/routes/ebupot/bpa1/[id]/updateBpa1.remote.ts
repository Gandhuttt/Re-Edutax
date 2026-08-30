import { form, getRequestEvent } from '$app/server';
import { decimalString, isRealIsoDate, requiredString, rupiahString } from '$lib/helpers/valibot-schema';
import { bpa1PtkpValues } from '$lib/helpers/ptkp-bpa1';
import { db } from '$lib/server/db';
import { bukti_potong_bpa1, fasilitas_pajak_ebupot, jenis_dokumen_ebupot, kode_objek_pajak_pph } from '$lib/server/db/schema';
import {
	calculateBiayaJabatan,
	monthCountInclusive,
	resolveBpa1Tax,
	resolvePtkpAmount
} from '$lib/server/ebupot/resolveBpa1';
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

	// Penghasilan Bruto build-up -- live-verified: a single lump figure for
	// the whole Masa Pajak Awal..Akhir period, not a monthly-recurring
	// amount Coretax multiplies (see docs/ui-reference/coretax/ebupot/
	// NOTES.md "BPA1").
	const gajiPensiunThtJht = Number(input.gajiPensiunThtJht);
	const tunjanganPph = Number(input.tunjanganPph);
	const tunjanganLainnya = Number(input.tunjanganLainnya);
	const honorarium = Number(input.honorarium);
	const premiAsuransi = Number(input.premiAsuransi);
	const natura = Number(input.natura);
	const tantiemBonus = Number(input.tantiemBonus);
	const penghasilanBruto =
		gajiPensiunThtJht +
		tunjanganPph +
		tunjanganLainnya +
		honorarium +
		premiAsuransi +
		natura +
		tantiemBonus;

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

	// "Kurang dari setahun yang disetahunkan": annualize the combined Neto
	// for bracket lookup (standard PPh 21 technique for a partial-year
	// employee), then de-annualize the resulting tax back to this period.
	// Not independently live-verified past the base bracket mechanism --
	// see docs/ui-reference/coretax/ebupot/NOTES.md "BPA1" for what was and
	// wasn't confirmed live this pass.
	const isDisetahunkan = input.jenisPemotongan === 'KURANG_SETAHUN_DISETAHUNKAN';
	const penghasilanNetoSetahunDisetahunkan = isDisetahunkan
		? Math.round((netoGabungan * 12) / monthCount)
		: netoGabungan;

	const penghasilanTidakKenaPajak = resolvePtkpAmount(input.statusPtkp);
	const penghasilanKenaPajak = Math.max(
		0,
		Math.floor((penghasilanNetoSetahunDisetahunkan - penghasilanTidakKenaPajak) / 1000) * 1000
	);

	let resolved: ReturnType<typeof resolveBpa1Tax>;
	try {
		resolved = resolveBpa1Tax(objekPajak.parameterData, fasilitas.kode, penghasilanKenaPajak);
	} catch (err) {
		error(400, err instanceof Error ? err.message : 'Tarif tidak dapat dihitung');
	}

	const pphPasal21AtasPkp = resolved.pajakPenghasilan;
	const pphPasal21Terutang = isDisetahunkan
		? Math.round((pphPasal21AtasPkp * monthCount) / 12)
		: pphPasal21AtasPkp;
	const pphPasal21DipotongSebelumnya = Number(input.pphPasal21DipotongSebelumnya);
	const pphPasal21TerutangPadaIni = pphPasal21Terutang - pphPasal21DipotongSebelumnya;

	// Fasilitas code 11 = PPh Pasal 21 Ditanggung Pemerintah (DTP) -- the
	// government bears this bukti's tax instead of the employee. This app
	// has no monthly-MP withholding-history feature to true up against, so
	// "Kurang (Lebih) Dipotong pada Masa Pajak Desember" is left at 0 --
	// deferred, same as other cross-feature integrations this session.
	const pphDipotongDitanggungPemerintah = fasilitas.kode === '11' ? pphPasal21TerutangPadaIni : 0;
	const pphKurangLebihDipotongDesember = 0;

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
			gajiPensiunThtJht,
			tunjanganPph,
			tunjanganLainnya,
			honorarium,
			premiAsuransi,
			natura,
			tantiemBonus,
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
			pphDipotongDitanggungPemerintah,
			pphKurangLebihDipotongDesember,
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
