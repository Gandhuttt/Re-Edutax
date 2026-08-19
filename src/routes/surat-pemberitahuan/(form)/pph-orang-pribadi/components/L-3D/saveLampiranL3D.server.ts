import { decimalInput, jsonRows } from '$lib/helpers/valibot-schema';
import { db, type Statement } from '$lib/server/db';
import {
	spt_pph_orang_pribadi_lampiran_3d_entertainment,
	spt_pph_orang_pribadi_lampiran_3d_piutang,
	spt_pph_orang_pribadi_lampiran_3d_promosi
} from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';

export const L3DSchema = v.object({
	l3dEntertainment: jsonRows(
		v.object({
			tanggal: v.optional(v.string(), ''),
			namaTempat: v.optional(v.string(), ''),
			alamat: v.optional(v.string(), ''),
			jenis: v.optional(v.string(), ''),
			jumlahPemberian: v.optional(decimalInput('Jumlah pemberian'), 0),
			namaRelasi: v.optional(v.string(), ''),
			posisiJabatan: v.optional(v.string(), ''),
			namaPerusahaan: v.optional(v.string(), ''),
			jenisUsahaRelasi: v.optional(v.string(), ''),
			keterangan: v.optional(v.string(), '')
		})
	),
	l3dPromosi: jsonRows(
		v.object({
			nomorIdentitasPenerima: v.optional(v.string(), ''),
			namaPenerima: v.optional(v.string(), ''),
			alamatPenerima: v.optional(v.string(), ''),
			tanggal: v.optional(v.string(), ''),
			kodeBentukJenisBiaya: v.optional(v.string(), ''),
			bentukJenisBiaya: v.optional(v.string(), ''),
			nilai: v.optional(decimalInput('Nilai'), 0),
			keterangan: v.optional(v.string(), ''),
			jumlahPemotongan: v.optional(decimalInput('Jumlah pemotongan/pemungutan PPh'), 0),
			nomorBuktiPotong: v.optional(v.string(), '')
		})
	),
	l3dPiutang: jsonRows(
		v.object({
			nomorIdentitasDebitur: v.optional(v.string(), ''),
			namaDebitur: v.optional(v.string(), ''),
			alamatDebitur: v.optional(v.string(), ''),
			jumlahPlafon: v.optional(decimalInput('Jumlah plafon piutang'), 0),
			jumlahTidakDapatDitagih: v.optional(
				decimalInput('Jumlah piutang yang nyata-nyata tidak dapat ditagih'),
				0
			),
			kodeMetodePembebanan: v.optional(v.string(), ''),
			metodePembebanan: v.optional(v.string(), ''),
			kodeJenisDokumen: v.optional(v.string(), ''),
			jenisDokumen: v.optional(v.string(), '')
		})
	)
});

type L3DInput = v.InferOutput<typeof L3DSchema>;

export function saveLampiranL3D(sptId: string, input: L3DInput) {
	const statements: Statement[] = [
		db
			.delete(spt_pph_orang_pribadi_lampiran_3d_entertainment)
			.where(eq(spt_pph_orang_pribadi_lampiran_3d_entertainment.sptPphOrangPribadiId, sptId)),
		db
			.delete(spt_pph_orang_pribadi_lampiran_3d_promosi)
			.where(eq(spt_pph_orang_pribadi_lampiran_3d_promosi.sptPphOrangPribadiId, sptId)),
		db
			.delete(spt_pph_orang_pribadi_lampiran_3d_piutang)
			.where(eq(spt_pph_orang_pribadi_lampiran_3d_piutang.sptPphOrangPribadiId, sptId))
	];

	input.l3dEntertainment.forEach((row, i) => {
		statements.push(
			db.insert(spt_pph_orang_pribadi_lampiran_3d_entertainment).values({
				sptPphOrangPribadiId: sptId,
				nomorUrut: i + 1,
				tanggal: row.tanggal,
				namaTempat: row.namaTempat,
				alamat: row.alamat,
				jenis: row.jenis,
				jumlahPemberian: Number(row.jumlahPemberian),
				namaRelasi: row.namaRelasi,
				posisiJabatan: row.posisiJabatan,
				namaPerusahaan: row.namaPerusahaan,
				jenisUsahaRelasi: row.jenisUsahaRelasi,
				keterangan: row.keterangan
			})
		);
	});

	input.l3dPromosi.forEach((row, i) => {
		statements.push(
			db.insert(spt_pph_orang_pribadi_lampiran_3d_promosi).values({
				sptPphOrangPribadiId: sptId,
				nomorUrut: i + 1,
				nomorIdentitasPenerima: row.nomorIdentitasPenerima,
				namaPenerima: row.namaPenerima,
				alamatPenerima: row.alamatPenerima,
				tanggal: row.tanggal,
				kodeBentukJenisBiaya: row.kodeBentukJenisBiaya,
				bentukJenisBiaya: row.bentukJenisBiaya,
				nilai: Number(row.nilai),
				keterangan: row.keterangan,
				jumlahPemotongan: Number(row.jumlahPemotongan),
				nomorBuktiPotong: row.nomorBuktiPotong
			})
		);
	});

	input.l3dPiutang.forEach((row, i) => {
		statements.push(
			db.insert(spt_pph_orang_pribadi_lampiran_3d_piutang).values({
				sptPphOrangPribadiId: sptId,
				nomorUrut: i + 1,
				nomorIdentitasDebitur: row.nomorIdentitasDebitur,
				namaDebitur: row.namaDebitur,
				alamatDebitur: row.alamatDebitur,
				jumlahPlafon: Number(row.jumlahPlafon),
				jumlahTidakDapatDitagih: Number(row.jumlahTidakDapatDitagih),
				kodeMetodePembebanan: row.kodeMetodePembebanan,
				metodePembebanan: row.metodePembebanan,
				kodeJenisDokumen: row.kodeJenisDokumen,
				jenisDokumen: row.jenisDokumen
			})
		);
	});

	// No Induk figure: Coretax never patches a valueXX from L3DForm.
	return { statements };
}
