import { getRequestEvent, query } from '$app/server';
import { db } from '$lib/server/db';
import {
	jenis_pajak_dipotong_dipungut_spt_pph_badan,
	jenis_penghasilan_bukan_objek_pajak_spt_pph_badan,
	jenis_penghasilan_kredit_pajak_luar_negeri_spt_pph_badan,
	kode_koreksi_fiskal_spt_pph_badan,
	mata_uang_spt_pph_badan,
	negara_spt_pph_badan,
	objek_pajak_spt_pph_badan,
	opini_auditor_spt_pph_badan,
	sektor_usaha_spt_pph_badan,
	spt_pph_badan,
	spt_pph_badan_lampiran_1_laba_rugi,
	spt_pph_badan_lampiran_1_neraca,
	spt_pph_badan_lampiran_2_afiliasi,
	spt_pph_badan_lampiran_2_pihak,
	spt_pph_badan_lampiran_3_penghasilan_luar_negeri,
	spt_pph_badan_lampiran_3_pph_dipotong,
	spt_pph_badan_lampiran_4_bukan_objek_pajak,
	spt_pph_badan_lampiran_4_pph_final,
	spt_pph_badan_lampiran_5_pp23_bulanan,
	spt_pph_badan_lampiran_5_pp23_dipotong_bulanan,
	spt_pph_badan_lampiran_5_tku,
	spt_pph_badan_lampiran_6_komponen,
	spt_pph_badan_lampiran_7_kompensasi_kerugian,
	spt_pph_badan_lampiran_8_fasilitas_31e,
	spt_pph_badan_lampiran_9_harta,
	jenis_harta_spt_pph_badan
} from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { asc, and, eq } from 'drizzle-orm';
import { L6_KODE } from './components/L6/saveLampiranL6.server';

export const getSptPphBadan = query(async () => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;
	const id = event.url.searchParams.get('id');

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	if (!id) {
		error(400, 'SPT PPh Badan tidak dipilih');
	}

	const [spt] = await db
		.select({
			id: spt_pph_badan.id,
			npwp: spt_pph_badan.npwp,
			tahunPajak: spt_pph_badan.tahunPajak,
			pembetulanKe: spt_pph_badan.pembetulanKe,
			statusSpt: spt_pph_badan.statusSpt,
			statusDraft: spt_pph_badan.statusDraft,
			periodePembukuanMulai: spt_pph_badan.periodePembukuanMulai,
			periodePembukuanSelesai: spt_pph_badan.periodePembukuanSelesai,
			metodePembukuan: spt_pph_badan.metodePembukuan,
			mataUangKode: mata_uang_spt_pph_badan.kode,
			sektorUsahaKode: sektor_usaha_spt_pph_badan.kode,
			diaudit: spt_pph_badan.diaudit,
			opiniAuditorKode: opini_auditor_spt_pph_badan.kode,
			npwpKantorAkuntanPublik: spt_pph_badan.npwpKantorAkuntanPublik,
			namaKantorAkuntanPublik: spt_pph_badan.namaKantorAkuntanPublik,
			menerimaPenghasilanPp23: spt_pph_badan.menerimaPenghasilanPp23,
			hanyaPenghasilanPp23: spt_pph_badan.hanyaPenghasilanPp23,
			menerimaPenghasilanFinal: spt_pph_badan.menerimaPenghasilanFinal,
			menerimaPenghasilanBukanObjekPajak: spt_pph_badan.menerimaPenghasilanBukanObjekPajak,
			tarifPajak: spt_pph_badan.tarifPajak,
			pphKurangLebihBayar: spt_pph_badan.pphKurangLebihBayar,
			lampiran3PengembalianPenguranganPphLuarNegeriTahunSebelumnya:
				spt_pph_badan.lampiran3PengembalianPenguranganPphLuarNegeriTahunSebelumnya,
			lampiran9AJumlahPenyusutanKomersial: spt_pph_badan.lampiran9AJumlahPenyusutanKomersial,
			lampiran9BJumlahPenyusutanKomersial: spt_pph_badan.lampiran9BJumlahPenyusutanKomersial,
			lampiran9CJumlahAmortisasiKomersial: spt_pph_badan.lampiran9CJumlahAmortisasiKomersial
		})
		.from(spt_pph_badan)
		.innerJoin(mata_uang_spt_pph_badan, eq(spt_pph_badan.mataUangPembukuanId, mata_uang_spt_pph_badan.id))
		.leftJoin(sektor_usaha_spt_pph_badan, eq(spt_pph_badan.sektorUsahaId, sektor_usaha_spt_pph_badan.id))
		.leftJoin(
			opini_auditor_spt_pph_badan,
			eq(spt_pph_badan.opiniAuditorId, opini_auditor_spt_pph_badan.id)
		)
		.where(and(eq(spt_pph_badan.id, id), eq(spt_pph_badan.npwp, activeNpwp)))
		.limit(1);

	if (!spt) {
		error(404, 'SPT PPh Badan tidak ditemukan');
	}

	const [
		nilai,
		neraca,
		pemegangSaham,
		penyertaanModal,
		penghasilanLuarNegeri,
		pphDipotong,
		penghasilanFinal,
		bukanObjekPajak,
		tku,
		bulananPp23,
		dipotongBulanan,
		komponenL6,
		komponenL7,
		[l8],
		l9
	] = await Promise.all([
		db
			.select({
				id: spt_pph_badan_lampiran_1_laba_rugi.id,
				akunId: spt_pph_badan_lampiran_1_laba_rugi.akunId,
				nilaiKomersial: spt_pph_badan_lampiran_1_laba_rugi.nilaiKomersial,
				nonObjekPajak: spt_pph_badan_lampiran_1_laba_rugi.nonObjekPajak,
				dikenakanPphFinal: spt_pph_badan_lampiran_1_laba_rugi.dikenakanPphFinal,
				penyesuaianFiskalPositif: spt_pph_badan_lampiran_1_laba_rugi.penyesuaianFiskalPositif,
				penyesuaianFiskalNegatif: spt_pph_badan_lampiran_1_laba_rugi.penyesuaianFiskalNegatif,
				kodePenyesuaianFiskal: kode_koreksi_fiskal_spt_pph_badan.kode
			})
			.from(spt_pph_badan_lampiran_1_laba_rugi)
			.leftJoin(
				kode_koreksi_fiskal_spt_pph_badan,
				eq(spt_pph_badan_lampiran_1_laba_rugi.kodePenyesuaianFiskalId, kode_koreksi_fiskal_spt_pph_badan.id)
			)
			.where(eq(spt_pph_badan_lampiran_1_laba_rugi.sptPphBadanId, id)),
		db
			.select({
				id: spt_pph_badan_lampiran_1_neraca.id,
				akunId: spt_pph_badan_lampiran_1_neraca.akunId,
				nilai: spt_pph_badan_lampiran_1_neraca.nilai
			})
			.from(spt_pph_badan_lampiran_1_neraca)
			.where(eq(spt_pph_badan_lampiran_1_neraca.sptPphBadanId, id)),
		db
			.select({
				id: spt_pph_badan_lampiran_2_pihak.id,
				nama: spt_pph_badan_lampiran_2_pihak.nama,
				alamat: spt_pph_badan_lampiran_2_pihak.alamat,
				negaraKode: negara_spt_pph_badan.kode,
				npwp: spt_pph_badan_lampiran_2_pihak.npwpNikTin,
				jabatan: spt_pph_badan_lampiran_2_pihak.jabatan,
				nilaiModal: spt_pph_badan_lampiran_2_pihak.modalSahamNominal,
				persentase: spt_pph_badan_lampiran_2_pihak.modalSahamPersentase,
				dividen: spt_pph_badan_lampiran_2_pihak.dividenDiterima
			})
			.from(spt_pph_badan_lampiran_2_pihak)
			.leftJoin(
				negara_spt_pph_badan,
				eq(spt_pph_badan_lampiran_2_pihak.negaraId, negara_spt_pph_badan.id)
			)
			.where(
				and(
					eq(spt_pph_badan_lampiran_2_pihak.sptPphBadanId, id),
					eq(spt_pph_badan_lampiran_2_pihak.jenis, 'pemegang_saham')
				)
			)
			.orderBy(asc(spt_pph_badan_lampiran_2_pihak.nomorUrut)),
		db
			.select({
				id: spt_pph_badan_lampiran_2_afiliasi.id,
				nama: spt_pph_badan_lampiran_2_afiliasi.namaPihakAfiliasi,
				negaraKode: negara_spt_pph_badan.kode,
				npwp: spt_pph_badan_lampiran_2_afiliasi.npwpTin,
				modalNilai: spt_pph_badan_lampiran_2_afiliasi.penyertaanModalNilai,
				modalPersen: spt_pph_badan_lampiran_2_afiliasi.penyertaanModalPersentase,
				utangNilai: spt_pph_badan_lampiran_2_afiliasi.utangNilai,
				utangTahun: spt_pph_badan_lampiran_2_afiliasi.utangTahun,
				utangBunga: spt_pph_badan_lampiran_2_afiliasi.utangBungaPersentase,
				piutangNilai: spt_pph_badan_lampiran_2_afiliasi.piutangNilai,
				piutangTahun: spt_pph_badan_lampiran_2_afiliasi.piutangTahun,
				piutangBunga: spt_pph_badan_lampiran_2_afiliasi.piutangBungaPersentase
			})
			.from(spt_pph_badan_lampiran_2_afiliasi)
			.leftJoin(
				negara_spt_pph_badan,
				eq(spt_pph_badan_lampiran_2_afiliasi.negaraId, negara_spt_pph_badan.id)
			)
			.where(eq(spt_pph_badan_lampiran_2_afiliasi.sptPphBadanId, id))
			.orderBy(asc(spt_pph_badan_lampiran_2_afiliasi.nomorUrut)),
		db
			.select({
				id: spt_pph_badan_lampiran_3_penghasilan_luar_negeri.id,
				namaPemberiPenghasilan: spt_pph_badan_lampiran_3_penghasilan_luar_negeri.namaPemberiPenghasilan,
				negaraKode: negara_spt_pph_badan.kode,
				tanggal: spt_pph_badan_lampiran_3_penghasilan_luar_negeri.tanggal,
				jenisPenghasilanKode: jenis_penghasilan_kredit_pajak_luar_negeri_spt_pph_badan.kode,
				penghasilanNeto: spt_pph_badan_lampiran_3_penghasilan_luar_negeri.penghasilanNeto,
				pphLuarNegeri: spt_pph_badan_lampiran_3_penghasilan_luar_negeri.pphLuarNegeri,
				mataUangKode: mata_uang_spt_pph_badan.kode,
				pphLuarNegeriMataUangAsing:
					spt_pph_badan_lampiran_3_penghasilan_luar_negeri.pphLuarNegeriMataUangAsing,
				kreditPajakYangDapatDikreditkan:
					spt_pph_badan_lampiran_3_penghasilan_luar_negeri.kreditPajakYangDapatDikreditkan,
				keterangan: spt_pph_badan_lampiran_3_penghasilan_luar_negeri.keterangan
			})
			.from(spt_pph_badan_lampiran_3_penghasilan_luar_negeri)
			.leftJoin(
				negara_spt_pph_badan,
				eq(spt_pph_badan_lampiran_3_penghasilan_luar_negeri.negaraId, negara_spt_pph_badan.id)
			)
			.leftJoin(
				jenis_penghasilan_kredit_pajak_luar_negeri_spt_pph_badan,
				eq(
					spt_pph_badan_lampiran_3_penghasilan_luar_negeri.jenisPenghasilanId,
					jenis_penghasilan_kredit_pajak_luar_negeri_spt_pph_badan.id
				)
			)
			.leftJoin(
				mata_uang_spt_pph_badan,
				eq(spt_pph_badan_lampiran_3_penghasilan_luar_negeri.mataUangId, mata_uang_spt_pph_badan.id)
			)
			.where(eq(spt_pph_badan_lampiran_3_penghasilan_luar_negeri.sptPphBadanId, id))
			.orderBy(asc(spt_pph_badan_lampiran_3_penghasilan_luar_negeri.nomorUrut)),
		db
			.select({
				id: spt_pph_badan_lampiran_3_pph_dipotong.id,
				namaPemotongPemungut: spt_pph_badan_lampiran_3_pph_dipotong.namaPemotongPemungut,
				npwp: spt_pph_badan_lampiran_3_pph_dipotong.npwpPemotongPemungut,
				jenisPajakKode: jenis_pajak_dipotong_dipungut_spt_pph_badan.kode,
				dpp: spt_pph_badan_lampiran_3_pph_dipotong.dpp,
				pph: spt_pph_badan_lampiran_3_pph_dipotong.pph,
				nomorBukti: spt_pph_badan_lampiran_3_pph_dipotong.nomorBukti,
				tanggalBukti: spt_pph_badan_lampiran_3_pph_dipotong.tanggalBukti
			})
			.from(spt_pph_badan_lampiran_3_pph_dipotong)
			.leftJoin(
				jenis_pajak_dipotong_dipungut_spt_pph_badan,
				eq(
					spt_pph_badan_lampiran_3_pph_dipotong.jenisPajakId,
					jenis_pajak_dipotong_dipungut_spt_pph_badan.id
				)
			)
			.where(eq(spt_pph_badan_lampiran_3_pph_dipotong.sptPphBadanId, id))
			.orderBy(asc(spt_pph_badan_lampiran_3_pph_dipotong.nomorUrut)),
		db
			.select({
				id: spt_pph_badan_lampiran_4_pph_final.id,
				npwpPemotongPemungutPenyetor: spt_pph_badan_lampiran_4_pph_final.npwpPemotongPemungutPenyetor,
				namaPemotongPemungutPenyetor: spt_pph_badan_lampiran_4_pph_final.namaPemotongPemungutPenyetor,
				objekPajakKode: objek_pajak_spt_pph_badan.kode,
				dasarPengenaanPajak: spt_pph_badan_lampiran_4_pph_final.dasarPengenaanPajak,
				tarif: spt_pph_badan_lampiran_4_pph_final.tarif,
				pphFinalTerutang: spt_pph_badan_lampiran_4_pph_final.pphFinalTerutang,
				nomorBuktiPotong: spt_pph_badan_lampiran_4_pph_final.nomorBuktiPotong,
				tanggalBuktiPotong: spt_pph_badan_lampiran_4_pph_final.tanggalBuktiPotong,
				keterangan: spt_pph_badan_lampiran_4_pph_final.keterangan
			})
			.from(spt_pph_badan_lampiran_4_pph_final)
			.leftJoin(
				objek_pajak_spt_pph_badan,
				eq(spt_pph_badan_lampiran_4_pph_final.objekPajakId, objek_pajak_spt_pph_badan.id)
			)
			.where(eq(spt_pph_badan_lampiran_4_pph_final.sptPphBadanId, id))
			.orderBy(asc(spt_pph_badan_lampiran_4_pph_final.nomorUrut)),
		db
			.select({
				id: spt_pph_badan_lampiran_4_bukan_objek_pajak.id,
				jenisPenghasilanKode: jenis_penghasilan_bukan_objek_pajak_spt_pph_badan.kode,
				sumberPenghasilan: spt_pph_badan_lampiran_4_bukan_objek_pajak.sumberPenghasilan,
				penghasilanBruto: spt_pph_badan_lampiran_4_bukan_objek_pajak.penghasilanBruto,
				keterangan: spt_pph_badan_lampiran_4_bukan_objek_pajak.keterangan
			})
			.from(spt_pph_badan_lampiran_4_bukan_objek_pajak)
			.leftJoin(
				jenis_penghasilan_bukan_objek_pajak_spt_pph_badan,
				eq(
					spt_pph_badan_lampiran_4_bukan_objek_pajak.jenisPenghasilanId,
					jenis_penghasilan_bukan_objek_pajak_spt_pph_badan.id
				)
			)
			.where(eq(spt_pph_badan_lampiran_4_bukan_objek_pajak.sptPphBadanId, id))
			.orderBy(asc(spt_pph_badan_lampiran_4_bukan_objek_pajak.nomorUrut)),
		db
			.select({
				id: spt_pph_badan_lampiran_5_tku.id,
				nitku: spt_pph_badan_lampiran_5_tku.nitku,
				nama: spt_pph_badan_lampiran_5_tku.nama,
				alamat: spt_pph_badan_lampiran_5_tku.alamat,
				kelurahan: spt_pph_badan_lampiran_5_tku.kelurahan,
				kecamatan: spt_pph_badan_lampiran_5_tku.kecamatan,
				kabupaten: spt_pph_badan_lampiran_5_tku.kabupaten,
				provinsi: spt_pph_badan_lampiran_5_tku.provinsi
			})
			.from(spt_pph_badan_lampiran_5_tku)
			.where(eq(spt_pph_badan_lampiran_5_tku.sptPphBadanId, id)),
		db
			.select({
				tkuId: spt_pph_badan_lampiran_5_pp23_bulanan.tkuId,
				bulan: spt_pph_badan_lampiran_5_pp23_bulanan.bulan,
				jumlahPeredaranBruto: spt_pph_badan_lampiran_5_pp23_bulanan.jumlahPeredaranBruto
			})
			.from(spt_pph_badan_lampiran_5_pp23_bulanan)
			.innerJoin(
				spt_pph_badan_lampiran_5_tku,
				eq(spt_pph_badan_lampiran_5_pp23_bulanan.tkuId, spt_pph_badan_lampiran_5_tku.id)
			)
			.where(eq(spt_pph_badan_lampiran_5_tku.sptPphBadanId, id)),
		db
			.select({
				bulan: spt_pph_badan_lampiran_5_pp23_dipotong_bulanan.bulan,
				nilai: spt_pph_badan_lampiran_5_pp23_dipotong_bulanan.nilai
			})
			.from(spt_pph_badan_lampiran_5_pp23_dipotong_bulanan)
			.where(eq(spt_pph_badan_lampiran_5_pp23_dipotong_bulanan.sptPphBadanId, id)),
		db
			.select({
				kode: spt_pph_badan_lampiran_6_komponen.kode,
				nilai: spt_pph_badan_lampiran_6_komponen.nilai
			})
			.from(spt_pph_badan_lampiran_6_komponen)
			.where(eq(spt_pph_badan_lampiran_6_komponen.sptPphBadanId, id)),
		db
			.select({
				tahunPajak: spt_pph_badan_lampiran_7_kompensasi_kerugian.tahunPajak,
				labaRugiNetoFiskal: spt_pph_badan_lampiran_7_kompensasi_kerugian.labaRugiNetoFiskal,
				kompensasiYMin4: spt_pph_badan_lampiran_7_kompensasi_kerugian.kompensasiYMin4,
				kompensasiYMin3: spt_pph_badan_lampiran_7_kompensasi_kerugian.kompensasiYMin3,
				kompensasiYMin2: spt_pph_badan_lampiran_7_kompensasi_kerugian.kompensasiYMin2,
				kompensasiYMin1: spt_pph_badan_lampiran_7_kompensasi_kerugian.kompensasiYMin1,
				kompensasiTahunIni: spt_pph_badan_lampiran_7_kompensasi_kerugian.kompensasiTahunIni,
				kompensasiYPlus1: spt_pph_badan_lampiran_7_kompensasi_kerugian.kompensasiYPlus1
			})
			.from(spt_pph_badan_lampiran_7_kompensasi_kerugian)
			.where(eq(spt_pph_badan_lampiran_7_kompensasi_kerugian.sptPphBadanId, id)),
		db
			.select({
				jumlahPeredaranBruto: spt_pph_badan_lampiran_8_fasilitas_31e.jumlahPeredaranBruto,
				penghasilanKenaPajak: spt_pph_badan_lampiran_8_fasilitas_31e.penghasilanKenaPajak,
				penghasilanKenaPajakMendapatFasilitas:
					spt_pph_badan_lampiran_8_fasilitas_31e.penghasilanKenaPajakMendapatFasilitas,
				penghasilanKenaPajakTidakMendapatFasilitas:
					spt_pph_badan_lampiran_8_fasilitas_31e.penghasilanKenaPajakTidakMendapatFasilitas,
				pphTerutangMendapatFasilitas: spt_pph_badan_lampiran_8_fasilitas_31e.pphTerutangMendapatFasilitas,
				pphTerutangTidakMendapatFasilitas:
					spt_pph_badan_lampiran_8_fasilitas_31e.pphTerutangTidakMendapatFasilitas,
				pphTerutangJumlah: spt_pph_badan_lampiran_8_fasilitas_31e.pphTerutangJumlah
			})
			.from(spt_pph_badan_lampiran_8_fasilitas_31e)
			.where(eq(spt_pph_badan_lampiran_8_fasilitas_31e.sptPphBadanId, id)),
		db
			.select({
				id: spt_pph_badan_lampiran_9_harta.id,
				kelompokPenyusutan: spt_pph_badan_lampiran_9_harta.kelompokPenyusutan,
				jenisHartaKode: jenis_harta_spt_pph_badan.kode,
				kodeHarta: spt_pph_badan_lampiran_9_harta.kodeHarta,
				bulanTahunPerolehan: spt_pph_badan_lampiran_9_harta.bulanTahunPerolehan,
				hargaPerolehan: spt_pph_badan_lampiran_9_harta.hargaPerolehan,
				nilaiSisaBukuFiskalAwalTahun: spt_pph_badan_lampiran_9_harta.nilaiSisaBukuFiskalAwalTahun,
				metodePenyusutanKomersial: spt_pph_badan_lampiran_9_harta.metodePenyusutanKomersial,
				metodePenyusutanFiskal: spt_pph_badan_lampiran_9_harta.metodePenyusutanFiskal,
				penyusutanAmortisasiFiskalTahunIni: spt_pph_badan_lampiran_9_harta.penyusutanAmortisasiFiskalTahunIni,
				penyusutanAmortisasiKomersialTahunIni:
					spt_pph_badan_lampiran_9_harta.penyusutanAmortisasiKomersialTahunIni,
				akumulasiPenyusutanAmortisasiFiskal:
					spt_pph_badan_lampiran_9_harta.akumulasiPenyusutanAmortisasiFiskal,
				nilaiSisaBukuFiskalAkhirTahun: spt_pph_badan_lampiran_9_harta.nilaiSisaBukuFiskalAkhirTahun,
				keterangan: spt_pph_badan_lampiran_9_harta.keterangan
			})
			.from(spt_pph_badan_lampiran_9_harta)
			.leftJoin(
				jenis_harta_spt_pph_badan,
				eq(spt_pph_badan_lampiran_9_harta.jenisHartaId, jenis_harta_spt_pph_badan.id)
			)
			.where(eq(spt_pph_badan_lampiran_9_harta.sptPphBadanId, id))
			.orderBy(asc(spt_pph_badan_lampiran_9_harta.nomorUrut))
	]);

	const nilaiL6ByKode = new Map(komponenL6.map((row) => [row.kode, row.nilai]));
	const l7ByTahunPajak = new Map(komponenL7.map((row) => [row.tahunPajak, row]));

	return {
		readonly: spt.statusDraft !== 'konsep',
		spt,
		lampiran1: {
			nilai: nilai.map((row) => ({ ...row, kodePenyesuaianFiskal: row.kodePenyesuaianFiskal ?? '' })),
			neraca
		},
		lampiran2: {
			pemegangSaham,
			penyertaanModal
		},
		lampiran3: {
			penghasilanLuarNegeri: penghasilanLuarNegeri.map((row) => ({
				...row,
				negaraKode: row.negaraKode ?? '',
				jenisPenghasilanKode: row.jenisPenghasilanKode ?? '',
				mataUangKode: row.mataUangKode ?? ''
			})),
			pengembalianPenguranganPphLuarNegeriTahunSebelumnya:
				spt.lampiran3PengembalianPenguranganPphLuarNegeriTahunSebelumnya,
			pphDipotong: pphDipotong.map((row) => ({ ...row, jenisPajakKode: row.jenisPajakKode ?? '' }))
		},
		lampiran4: {
			penghasilanFinal: penghasilanFinal.map((row) => ({ ...row, objekPajakKode: row.objekPajakKode ?? '' })),
			bukanObjekPajak: bukanObjekPajak.map((row) => ({ ...row, jenisPenghasilanKode: row.jenisPenghasilanKode ?? '' }))
		},
		lampiran5: {
			tku,
			bulanan: bulananPp23,
			dipotongBulanan
		},
		lampiran6: {
			dasarAngsuran: nilaiL6ByKode.get(L6_KODE.DASAR_ANGSURAN) ?? 0,
			kompensasiKerugian: nilaiL6ByKode.get(L6_KODE.KOMPENSASI_KERUGIAN) ?? 0,
			penghasilanKenaPajak: nilaiL6ByKode.get(L6_KODE.PENGHASILAN_KENA_PAJAK) ?? 0,
			pphTerutang: nilaiL6ByKode.get(L6_KODE.PPH_TERUTANG) ?? 0,
			kreditPajakTahunLalu: nilaiL6ByKode.get(L6_KODE.KREDIT_PAJAK_TAHUN_LALU) ?? 0,
			pphDibayarSendiri: nilaiL6ByKode.get(L6_KODE.PPH_DIBAYAR_SENDIRI) ?? 0,
			angsuranPph25: nilaiL6ByKode.get(L6_KODE.ANGSURAN_PPH_25) ?? 0
		},
		lampiran7: Array.from({ length: 10 }, (_, i) => {
			const tahunPajak = spt.tahunPajak - (9 - i);
			const existing = l7ByTahunPajak.get(tahunPajak);
			return {
				tahunPajak,
				labaRugiNetoFiskal: existing?.labaRugiNetoFiskal ?? 0,
				kompensasiYMin4: existing?.kompensasiYMin4 ?? 0,
				kompensasiYMin3: existing?.kompensasiYMin3 ?? 0,
				kompensasiYMin2: existing?.kompensasiYMin2 ?? 0,
				kompensasiYMin1: existing?.kompensasiYMin1 ?? 0,
				kompensasiTahunIni: existing?.kompensasiTahunIni ?? 0,
				kompensasiYPlus1: existing?.kompensasiYPlus1 ?? 0
			};
		}),
		lampiran8: {
			jumlahPeredaranBruto: l8?.jumlahPeredaranBruto ?? 0,
			penghasilanKenaPajak: l8?.penghasilanKenaPajak ?? 0,
			penghasilanKenaPajakMendapatFasilitas: l8?.penghasilanKenaPajakMendapatFasilitas ?? 0,
			penghasilanKenaPajakTidakMendapatFasilitas: l8?.penghasilanKenaPajakTidakMendapatFasilitas ?? 0,
			pphTerutangMendapatFasilitas: l8?.pphTerutangMendapatFasilitas ?? 0,
			pphTerutangTidakMendapatFasilitas: l8?.pphTerutangTidakMendapatFasilitas ?? 0,
			pphTerutangJumlah: l8?.pphTerutangJumlah ?? 0
		},
		lampiran9: {
			rows: l9.map((row) => ({ ...row, jenisHartaKode: row.jenisHartaKode ?? '' })),
			jumlahPenyusutanKomersialA: spt.lampiran9AJumlahPenyusutanKomersial,
			jumlahPenyusutanKomersialB: spt.lampiran9BJumlahPenyusutanKomersial,
			jumlahAmortisasiKomersialC: spt.lampiran9CJumlahAmortisasiKomersial
		}
	};
});
