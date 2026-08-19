import { db } from '$lib/server/db';
import {
	spt_pph_orang_pribadi_lampiran_3c,
	spt_pph_orang_pribadi_lampiran_3c_baris
} from '$lib/server/db/schema';
import { asc, eq } from 'drizzle-orm';
import { kelompokkanPerTabel, type BarisBertabel } from './perTabel';

// All twelve sub-grids come back keyed by tableIndex, with every index present
// even when empty, so the page can bind each grid unconditionally.
export async function getLampiranL3C(sptId: string) {
	const [baris, [total]] = await Promise.all([
		db
			.select()
			.from(spt_pph_orang_pribadi_lampiran_3c_baris)
			.where(eq(spt_pph_orang_pribadi_lampiran_3c_baris.sptPphOrangPribadiId, sptId))
			.orderBy(
				asc(spt_pph_orang_pribadi_lampiran_3c_baris.tableIndex),
				asc(spt_pph_orang_pribadi_lampiran_3c_baris.nomorUrut)
			),
		db
			.select()
			.from(spt_pph_orang_pribadi_lampiran_3c)
			.where(eq(spt_pph_orang_pribadi_lampiran_3c.sptPphOrangPribadiId, sptId))
	]);

	const bertabel: BarisBertabel[] = baris.map((row) => ({
		tableIndex: row.tableIndex,
		kodeHarta: row.kodeHarta,
		jenisHarta: row.jenisHarta,
		bulanPerolehan: row.bulanPerolehan,
		tahunPerolehan: row.tahunPerolehan,
		hargaPerolehan: row.hargaPerolehan,
		nilaiSisaBukuFiskal: row.nilaiSisaBukuFiskal,
		metodeKomersial: row.metodeKomersial,
		metodeFiskal: row.metodeFiskal,
		penyusutanFiskalTahunIni: row.penyusutanFiskalTahunIni,
		keterangan: row.keterangan
	}));

	return {
		perTabel: kelompokkanPerTabel(bertabel),
		totalPenyusutanKomersial: total?.totalPenyusutanKomersial ?? 0,
		totalAmortisasiKomersial: total?.totalAmortisasiKomersial ?? 0
	};
}
