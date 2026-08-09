import { db } from '$lib/server/db';
import {
	jenis_harta_spt_pph_badan,
	spt_pph_badan_lampiran_9_harta,
	spt_pph_badan_lampiran_9_ringkasan_komersial
} from '$lib/server/db/schema';
import { asc, eq } from 'drizzle-orm';

export async function getLampiranL9(sptPphBadanId: string) {
	const [rows, [ringkasan]] = await Promise.all([
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
				penyusutanAmortisasiKomersialTahunIni: spt_pph_badan_lampiran_9_harta.penyusutanAmortisasiKomersialTahunIni,
				akumulasiPenyusutanAmortisasiFiskal: spt_pph_badan_lampiran_9_harta.akumulasiPenyusutanAmortisasiFiskal,
				nilaiSisaBukuFiskalAkhirTahun: spt_pph_badan_lampiran_9_harta.nilaiSisaBukuFiskalAkhirTahun,
				keterangan: spt_pph_badan_lampiran_9_harta.keterangan
			})
			.from(spt_pph_badan_lampiran_9_harta)
			.leftJoin(jenis_harta_spt_pph_badan, eq(spt_pph_badan_lampiran_9_harta.jenisHartaId, jenis_harta_spt_pph_badan.id))
			.where(eq(spt_pph_badan_lampiran_9_harta.sptPphBadanId, sptPphBadanId))
			.orderBy(asc(spt_pph_badan_lampiran_9_harta.nomorUrut)),
		db
			.select({
				jumlahPenyusutanKomersialA: spt_pph_badan_lampiran_9_ringkasan_komersial.jumlahPenyusutanKomersialA,
				jumlahPenyusutanKomersialB: spt_pph_badan_lampiran_9_ringkasan_komersial.jumlahPenyusutanKomersialB,
				jumlahAmortisasiKomersialC: spt_pph_badan_lampiran_9_ringkasan_komersial.jumlahAmortisasiKomersialC
			})
			.from(spt_pph_badan_lampiran_9_ringkasan_komersial)
			.where(eq(spt_pph_badan_lampiran_9_ringkasan_komersial.sptPphBadanId, sptPphBadanId))
	]);

	return {
		rows: rows.map((row) => ({ ...row, jenisHartaKode: row.jenisHartaKode ?? '' })),
		jumlahPenyusutanKomersialA: ringkasan?.jumlahPenyusutanKomersialA ?? 0,
		jumlahPenyusutanKomersialB: ringkasan?.jumlahPenyusutanKomersialB ?? 0,
		jumlahAmortisasiKomersialC: ringkasan?.jumlahAmortisasiKomersialC ?? 0
	};
}
