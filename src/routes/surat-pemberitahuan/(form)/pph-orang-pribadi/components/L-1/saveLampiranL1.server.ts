import { jsonRows } from '$lib/helpers/valibot-schema';
import { db, type Statement } from '$lib/server/db';
import {
	spt_pph_orang_pribadi_lampiran_1_bukti_potong,
	spt_pph_orang_pribadi_lampiran_1_harta,
	spt_pph_orang_pribadi_lampiran_1_pekerjaan,
	spt_pph_orang_pribadi_lampiran_1_utang
} from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';

// Grid rows arrive as loosely typed records because the six harta sub-tables
// share one storage shape and each shows a different subset of it. Values are
// coerced per column below rather than being validated field by field.
const looseRows = jsonRows(v.record(v.string(), v.union([v.string(), v.number(), v.null()])));

export const L1Schema = v.object({
	l1HartaA1: looseRows,
	l1HartaA2: looseRows,
	l1HartaA3: looseRows,
	l1HartaA4: looseRows,
	l1HartaA5: looseRows,
	l1HartaA6: looseRows,
	l1Utang: looseRows,
	l1Pekerjaan: looseRows,
	l1BuktiPotong: looseRows
});

type L1Input = v.InferOutput<typeof L1Schema>;
type Row = Record<string, string | number | null>;

const teks = (value: unknown) => (value === undefined || value === null ? '' : String(value));
const angka = (value: unknown) => {
	const n = Number(value);
	return Number.isFinite(n) ? Math.round(n) : 0;
};
const angkaOpsional = (value: unknown) => {
	if (value === undefined || value === null || value === '') return null;
	const n = Number(value);
	return Number.isFinite(n) ? Math.round(n) : null;
};

export function saveLampiranL1(sptId: string, input: L1Input) {
	const statements: Statement[] = [
		db
			.delete(spt_pph_orang_pribadi_lampiran_1_harta)
			.where(eq(spt_pph_orang_pribadi_lampiran_1_harta.sptPphOrangPribadiId, sptId)),
		db
			.delete(spt_pph_orang_pribadi_lampiran_1_utang)
			.where(eq(spt_pph_orang_pribadi_lampiran_1_utang.sptPphOrangPribadiId, sptId)),
		db
			.delete(spt_pph_orang_pribadi_lampiran_1_pekerjaan)
			.where(eq(spt_pph_orang_pribadi_lampiran_1_pekerjaan.sptPphOrangPribadiId, sptId)),
		db
			.delete(spt_pph_orang_pribadi_lampiran_1_bukti_potong)
			.where(eq(spt_pph_orang_pribadi_lampiran_1_bukti_potong.sptPphOrangPribadiId, sptId))
	];

	const subTabel = [
		['a1', input.l1HartaA1],
		['a2', input.l1HartaA2],
		['a3', input.l1HartaA3],
		['a4', input.l1HartaA4],
		['a5', input.l1HartaA5],
		['a6', input.l1HartaA6]
	] as const;

	for (const [key, rows] of subTabel) {
		for (const [index, row] of (rows as Row[]).entries()) {
			statements.push(
				db.insert(spt_pph_orang_pribadi_lampiran_1_harta).values({
					sptPphOrangPribadiId: sptId,
					subTabel: key,
					nomorUrut: index + 1,
					kode: teks(row.kode),
					deskripsi: teks(row.deskripsi),
					lokasiHarta: teks(row.lokasiHarta),
					nomorAkun: teks(row.nomorAkun),
					atasNama: teks(row.atasNama),
					namaBankInstitusi: teks(row.namaBankInstitusi),
					nomorIdentitasPenerima: teks(row.nomorIdentitasPenerima),
					namaPenerimaPinjaman: teks(row.namaPenerimaPinjaman),
					nilaiPiutang: angkaOpsional(row.nilaiPiutang),
					tahunDimulai: angkaOpsional(row.tahunDimulai),
					saldoPiutangSaatIni: angkaOpsional(row.saldoPiutangSaatIni),
					merkModel: teks(row.merkModel),
					nomorPolisiRegistrasi: teks(row.nomorPolisiRegistrasi),
					kepemilikan: teks(row.kepemilikan),
					nomorIdentitasPemilik: teks(row.nomorIdentitasPemilik),
					namaPemilik: teks(row.namaPemilik),
					ukuranTanah: teks(row.ukuranTanah),
					ukuranBangunan: teks(row.ukuranBangunan),
					sumberKepemilikan: teks(row.sumberKepemilikan),
					nomorSertifikat: teks(row.nomorSertifikat),
					buktiKepemilikan: teks(row.buktiKepemilikan),
					informasiTambahan: teks(row.informasiTambahan),
					tahunPerolehan: angkaOpsional(row.tahunPerolehan),
					hargaPerolehan: angka(row.hargaPerolehan),
					nilaiSaatIni: angka(row.nilaiSaatIni),
					keterangan: teks(row.keterangan)
				})
			);
		}
	}

	for (const [index, row] of (input.l1Utang as Row[]).entries()) {
		statements.push(
			db.insert(spt_pph_orang_pribadi_lampiran_1_utang).values({
				sptPphOrangPribadiId: sptId,
				nomorUrut: index + 1,
				kode: teks(row.kode),
				deskripsi: teks(row.deskripsi),
				nikNpwpKreditur: teks(row.nikNpwpKreditur),
				namaKreditur: teks(row.namaKreditur),
				negaraKreditur: teks(row.negaraKreditur),
				tahunPeminjaman: angkaOpsional(row.tahunPeminjaman),
				saldo: angka(row.saldo),
				keterangan: teks(row.keterangan)
			})
		);
	}

	for (const [index, row] of (input.l1Pekerjaan as Row[]).entries()) {
		const bruto = angka(row.penghasilanBruto);
		const pengurang = angka(row.pengurangPenghasilanBruto);
		statements.push(
			db.insert(spt_pph_orang_pribadi_lampiran_1_pekerjaan).values({
				sptPphOrangPribadiId: sptId,
				nomorUrut: index + 1,
				nomorIdentitasPemberiKerja: teks(row.nomorIdentitasPemberiKerja),
				namaPemberiKerja: teks(row.namaPemberiKerja),
				penghasilanBruto: bruto,
				pengurangPenghasilanBruto: pengurang,
				// Recomputed server-side rather than trusting the submitted value.
				penghasilanNeto: bruto - pengurang
			})
		);
	}

	for (const [index, row] of (input.l1BuktiPotong as Row[]).entries()) {
		statements.push(
			db.insert(spt_pph_orang_pribadi_lampiran_1_bukti_potong).values({
				sptPphOrangPribadiId: sptId,
				nomorUrut: index + 1,
				namaPemotong: teks(row.namaPemotong),
				npwpPemotong: teks(row.npwpPemotong),
				nomorBukti: teks(row.nomorBukti),
				tanggalBukti: teks(row.tanggalBukti),
				jenisPajak: teks(row.jenisPajak),
				penghasilanBruto: angka(row.penghasilanBruto),
				pphDipotong: angka(row.pphDipotong)
			})
		);
	}

	// The figures L-1 feeds into the Induk, computed from what is about to be
	// written rather than from what the browser claimed.
	const n1a = (input.l1Pekerjaan as Row[]).reduce(
		(sum, row) => sum + angka(row.penghasilanBruto) - angka(row.pengurangPenghasilanBruto),
		0
	);
	const n10a = (input.l1BuktiPotong as Row[]).reduce((sum, row) => sum + angka(row.pphDipotong), 0);
	const n14a = subTabel.reduce(
		(sum, [, rows]) => sum + (rows as Row[]).reduce((s, row) => s + angka(row.nilaiSaatIni), 0),
		0
	);
	const n14b = (input.l1Utang as Row[]).reduce((sum, row) => sum + angka(row.saldo), 0);

	return { statements, n1a, n10a, n14a, n14b };
}
