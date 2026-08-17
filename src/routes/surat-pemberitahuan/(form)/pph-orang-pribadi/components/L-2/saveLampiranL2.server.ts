import { jsonRows } from '$lib/helpers/valibot-schema';
import { db, type Statement } from '$lib/server/db';
import {
	spt_pph_orang_pribadi_lampiran_2_bukan_objek,
	spt_pph_orang_pribadi_lampiran_2_final,
	spt_pph_orang_pribadi_lampiran_2_luar_negeri
} from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';

const looseRows = jsonRows(v.record(v.string(), v.union([v.string(), v.number(), v.null()])));

export const L2Schema = v.object({
	l2Final: looseRows,
	l2BukanObjek: looseRows,
	l2LuarNegeri: looseRows
});

type L2Input = v.InferOutput<typeof L2Schema>;
type Row = Record<string, string | number | null>;

const teks = (value: unknown) => (value === undefined || value === null ? '' : String(value));
const angka = (value: unknown) => {
	const n = Number(value);
	return Number.isFinite(n) ? Math.round(n) : 0;
};

export function saveLampiranL2(sptId: string, input: L2Input) {
	const statements: Statement[] = [
		db
			.delete(spt_pph_orang_pribadi_lampiran_2_final)
			.where(eq(spt_pph_orang_pribadi_lampiran_2_final.sptPphOrangPribadiId, sptId)),
		db
			.delete(spt_pph_orang_pribadi_lampiran_2_bukan_objek)
			.where(eq(spt_pph_orang_pribadi_lampiran_2_bukan_objek.sptPphOrangPribadiId, sptId)),
		db
			.delete(spt_pph_orang_pribadi_lampiran_2_luar_negeri)
			.where(eq(spt_pph_orang_pribadi_lampiran_2_luar_negeri.sptPphOrangPribadiId, sptId))
	];

	for (const [index, row] of (input.l2Final as Row[]).entries()) {
		statements.push(
			db.insert(spt_pph_orang_pribadi_lampiran_2_final).values({
				sptPphOrangPribadiId: sptId,
				nomorUrut: index + 1,
				npwpPemotong: teks(row.npwpPemotong),
				namaPemotong: teks(row.namaPemotong),
				kodeObjekPajak: teks(row.kodeObjekPajak),
				jenisPenghasilan: teks(row.jenisPenghasilan),
				dasarPengenaanPajak: angka(row.dasarPengenaanPajak),
				pphTerutang: angka(row.pphTerutang)
			})
		);
	}

	for (const [index, row] of (input.l2BukanObjek as Row[]).entries()) {
		statements.push(
			db.insert(spt_pph_orang_pribadi_lampiran_2_bukan_objek).values({
				sptPphOrangPribadiId: sptId,
				nomorUrut: index + 1,
				kode: teks(row.kode),
				jenisPenghasilan: teks(row.jenisPenghasilan),
				npwpSumber: teks(row.npwpSumber),
				namaSumber: teks(row.namaSumber),
				penghasilanBruto: angka(row.penghasilanBruto)
			})
		);
	}

	for (const [index, row] of (input.l2LuarNegeri as Row[]).entries()) {
		statements.push(
			db.insert(spt_pph_orang_pribadi_lampiran_2_luar_negeri).values({
				sptPphOrangPribadiId: sptId,
				nomorUrut: index + 1,
				namaSumber: teks(row.namaSumber),
				negara: teks(row.negara),
				tanggalTransaksi: teks(row.tanggalTransaksi),
				jenisPenghasilan: teks(row.jenisPenghasilan),
				kodePenghasilan: teks(row.kodePenghasilan),
				penghasilanNeto: angka(row.penghasilanNeto),
				mataUang: teks(row.mataUang),
				pajakLuarNegeriAsing: angka(row.pajakLuarNegeriAsing),
				pajakLuarNegeriRupiah: angka(row.pajakLuarNegeriRupiah),
				kreditPajakDiperhitungkan: angka(row.kreditPajakDiperhitungkan)
			})
		);
	}

	const jumlah = (rows: Row[], key: string) => rows.reduce((sum, row) => sum + angka(row[key]), 0);

	return {
		statements,
		// 14c takes the DPP, not the tax.
		n14c: jumlah(input.l2Final as Row[], 'dasarPengenaanPajak'),
		n14d: jumlah(input.l2BukanObjek as Row[], 'penghasilanBruto'),
		n1d: jumlah(input.l2LuarNegeri as Row[], 'penghasilanNeto'),
		// Imported by L-1 Bagian E as its KREDIT PAJAK ATAS PENGHASILAN LUAR NEGERI
		// row, which is what makes Induk 10a the sum of two lampiran.
		kreditPajakLuarNegeri: jumlah(input.l2LuarNegeri as Row[], 'kreditPajakDiperhitungkan')
	};
}
