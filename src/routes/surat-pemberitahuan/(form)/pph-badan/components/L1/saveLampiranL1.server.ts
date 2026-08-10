import { decimalInput, jsonRows, requiredString } from '$lib/helpers/valibot-schema';
import { db, type Statement } from '$lib/server/db';
import {
	kode_koreksi_fiskal_spt_pph_badan,
	spt_pph_badan_lampiran_1_akun,
	spt_pph_badan_lampiran_1_laba_rugi,
	spt_pph_badan_lampiran_1_laba_rugi_koreksi_fiskal,
	spt_pph_badan_lampiran_1_neraca,
	spt_pph_badan_lampiran_1_neraca_akun
} from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { and, eq, inArray } from 'drizzle-orm';
import * as v from 'valibot';
import { computeLabaRugiRows } from './labaRugiRollup';

export const L1Schema = v.object({
	labaRugi: jsonRows(
		v.object({
			akunId: requiredString('Akun laba rugi'),
			nilaiKomersial: decimalInput('Nilai komersial'),
			nonObjekPajak: decimalInput('Non objek pajak'),
			dikenakanPphFinal: decimalInput('Dikenakan PPh final'),
			penyesuaianFiskalPositif: decimalInput('Penyesuaian fiskal positif'),
			penyesuaianFiskalNegatif: decimalInput('Penyesuaian fiskal negatif'),
			kodePenyesuaianFiskal: v.optional(v.array(v.string()), [])
		})
	),
	neraca: jsonRows(
		v.object({
			akunId: requiredString('Akun neraca'),
			nilai: decimalInput('Nilai')
		})
	)
});

type L1Input = v.InferOutput<typeof L1Schema>;

const labaRugiId = (sptPphBadanId: string, akunId: string) =>
	`lampiran-1-laba-rugi-${sptPphBadanId}-${akunId}`;

async function getKodePenyesuaianFiskalIds(kodes: string[]) {
	if (kodes.length === 0) return new Map<string, string>();

	const rows = await db
		.select({ id: kode_koreksi_fiskal_spt_pph_badan.id, kode: kode_koreksi_fiskal_spt_pph_badan.kode })
		.from(kode_koreksi_fiskal_spt_pph_badan)
		.where(
			and(
				inArray(kode_koreksi_fiskal_spt_pph_badan.kode, kodes),
				eq(kode_koreksi_fiskal_spt_pph_badan.aktif, true)
			)
		);

	const idByKode = new Map(rows.map((row) => [row.kode, row.id]));

	for (const kode of kodes) {
		if (!idByKode.has(kode)) {
			error(400, 'Kode penyesuaian fiskal tidak valid');
		}
	}

	return idByKode;
}

export async function saveLampiranL1(
	sptPphBadanId: string,
	sektorUsahaId: string,
	input: L1Input
): Promise<{ statements: Statement[]; netoFiskalSebelumFasilitas: number }> {
	const labaRugiTemplate = await db
		.select({
			id: spt_pph_badan_lampiran_1_akun.id,
			nomorUrut: spt_pph_badan_lampiran_1_akun.nomorUrut,
			kode: spt_pph_badan_lampiran_1_akun.kode,
			namaAkun: spt_pph_badan_lampiran_1_akun.namaAkun,
			rowType: spt_pph_badan_lampiran_1_akun.rowType,
			classification: spt_pph_badan_lampiran_1_akun.classification,
			parentKode: spt_pph_badan_lampiran_1_akun.parentKode,
			sign: spt_pph_badan_lampiran_1_akun.sign
		})
		.from(spt_pph_badan_lampiran_1_akun)
		.where(eq(spt_pph_badan_lampiran_1_akun.sektorUsahaId, sektorUsahaId));

	const neracaTemplate = await db
		.select({ id: spt_pph_badan_lampiran_1_neraca_akun.id, rowType: spt_pph_badan_lampiran_1_neraca_akun.rowType })
		.from(spt_pph_badan_lampiran_1_neraca_akun)
		.where(eq(spt_pph_badan_lampiran_1_neraca_akun.sektorUsahaId, sektorUsahaId));

	const statements: Statement[] = [];

	const netoFiskalSebelumFasilitas =
		computeLabaRugiRows(
			labaRugiTemplate,
			input.labaRugi.map((row) => ({
				akunId: row.akunId,
				nilaiKomersial: Number(row.nilaiKomersial),
				nonObjekPajak: Number(row.nonObjekPajak),
				dikenakanPphFinal: Number(row.dikenakanPphFinal),
				penyesuaianFiskalPositif: Number(row.penyesuaianFiskalPositif),
				penyesuaianFiskalNegatif: Number(row.penyesuaianFiskalNegatif),
				kodePenyesuaianFiskal: row.kodePenyesuaianFiskal
			}))
		).find((row) => row.kode === '4800')?.nilaiFiskal ?? 0;

	const dataAkunIds = new Set(labaRugiTemplate.filter((row) => row.rowType === 'data').map((row) => row.id));

	const allKode = [...new Set(input.labaRugi.flatMap((row) => row.kodePenyesuaianFiskal))];
	const idByKode = await getKodePenyesuaianFiskalIds(allKode);

	for (const row of input.labaRugi) {
		if (!dataAkunIds.has(row.akunId)) continue;

		const values = {
			nilaiKomersial: Number(row.nilaiKomersial),
			nonObjekPajak: Number(row.nonObjekPajak),
			dikenakanPphFinal: Number(row.dikenakanPphFinal),
			penyesuaianFiskalPositif: Number(row.penyesuaianFiskalPositif),
			penyesuaianFiskalNegatif: Number(row.penyesuaianFiskalNegatif)
		};

		// D1's batch() can't return generated ids mid-batch, so this uses a deterministic id
		// (a pure function of sptPphBadanId + akunId) instead of relying on onConflictDoUpdate's
		// returning() to learn an existing row's id.
		const id = labaRugiId(sptPphBadanId, row.akunId);

		statements.push(
			db
				.insert(spt_pph_badan_lampiran_1_laba_rugi)
				.values({
					id,
					sptPphBadanId,
					akunId: row.akunId,
					...values
				})
				.onConflictDoUpdate({
					target: spt_pph_badan_lampiran_1_laba_rugi.id,
					set: values
				}),
			db
				.delete(spt_pph_badan_lampiran_1_laba_rugi_koreksi_fiskal)
				.where(eq(spt_pph_badan_lampiran_1_laba_rugi_koreksi_fiskal.labaRugiId, id))
		);

		const kodeKoreksiFiskalIds = row.kodePenyesuaianFiskal.map((kode) => idByKode.get(kode)!);

		if (kodeKoreksiFiskalIds.length > 0) {
			statements.push(
				db.insert(spt_pph_badan_lampiran_1_laba_rugi_koreksi_fiskal).values(
					kodeKoreksiFiskalIds.map((kodeKoreksiFiskalId) => ({
						labaRugiId: id,
						kodeKoreksiFiskalId
					}))
				)
			);
		}
	}

	const neracaDataAkunIds = new Set(neracaTemplate.filter((row) => row.rowType === 'data').map((row) => row.id));

	for (const row of input.neraca) {
		if (!neracaDataAkunIds.has(row.akunId)) continue;

		const values = { nilai: Number(row.nilai) };

		statements.push(
			db
				.insert(spt_pph_badan_lampiran_1_neraca)
				.values({
					sptPphBadanId,
					akunId: row.akunId,
					...values
				})
				.onConflictDoUpdate({
					target: [spt_pph_badan_lampiran_1_neraca.sptPphBadanId, spt_pph_badan_lampiran_1_neraca.akunId],
					set: values
				})
		);
	}

	return { statements, netoFiskalSebelumFasilitas };
}
