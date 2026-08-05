import { form, getRequestEvent } from '$app/server';
import { decimalString, requiredString } from '$lib/helpers/valibot-schema';
import { db } from '$lib/server/db';
import {
	negara_spt_pph_badan,
	opini_auditor_spt_pph_badan,
	sektor_usaha_spt_pph_badan,
	spt_pph_badan,
	spt_pph_badan_lampiran_1_laba_rugi,
	spt_pph_badan_lampiran_1_neraca,
	spt_pph_badan_lampiran_2_pihak
} from '$lib/server/db/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import * as v from 'valibot';

const decimalInput = (field: string) => v.union([decimalString(field), v.number(`${field} harus berupa angka`)]);

const booleanRadio = (fallback: boolean) =>
	v.optional(
		v.union([v.boolean(), v.pipe(v.picklist(['true', 'false']), v.transform((value) => value === 'true'))]),
		fallback
	);

const jsonRows = <TItem extends v.GenericSchema>(itemSchema: TItem) =>
	v.optional(v.pipe(v.string(), v.parseJson(undefined, 'Data tidak valid'), v.array(itemSchema)), '[]');

const SaveSptPphBadanSchema = v.object({
	id: requiredString('SPT PPh Badan'),
	action: v.optional(v.picklist(['Simpan Konsep', 'Simpan Lapor']), 'Simpan Konsep'),
	metodePembukuan: v.optional(v.picklist(['akrual', 'kas']), 'akrual'),
	sektorUsaha: requiredString('Sektor usaha'),
	diaudit: booleanRadio(false),
	opiniAuditor: v.optional(v.string(), ''),
	npwpKantorAkuntanPublik: v.optional(v.string(), ''),
	namaKantorAkuntanPublik: v.optional(v.string(), ''),
	menerimaPenghasilanPp23: booleanRadio(false),
	hanyaPenghasilanPp23: booleanRadio(false),
	menerimaPenghasilanFinal: booleanRadio(false),
	menerimaPenghasilanBukanObjekPajak: booleanRadio(false),
	l2a: jsonRows(
		v.object({
			nama: requiredString('Nama'),
			alamat: v.optional(v.string(), ''),
			negara: v.optional(v.string(), ''),
			npwp: v.optional(v.string(), ''),
			jabatan: v.optional(v.string(), ''),
			nilaiModal: decimalInput('Nilai modal disetor'),
			persentase: decimalInput('Persentase modal disetor'),
			dividen: decimalInput('Dividen/pembagian laba')
		})
	),
	labaRugi: jsonRows(
		v.object({
			id: v.string(),
			komersial: decimalInput('Nilai komersial'),
			tidakTermasukObjekPajak: decimalInput('Tidak termasuk objek pajak'),
			dikenakanPphFinal: decimalInput('Dikenakan PPh final'),
			fiskal: decimalInput('Nilai fiskal')
		})
	),
	neraca: jsonRows(
		v.object({
			id: v.string(),
			nilai: decimalInput('Nilai neraca')
		})
	)
});

export const saveSptPphBadan = form(SaveSptPphBadanSchema, async (input) => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	const [spt] = await db
		.select({ id: spt_pph_badan.id })
		.from(spt_pph_badan)
		.where(
			and(
				eq(spt_pph_badan.id, input.id),
				eq(spt_pph_badan.npwp, activeNpwp),
				eq(spt_pph_badan.statusDraft, 'konsep')
			)
		)
		.limit(1);

	if (!spt) {
		error(404, 'Konsep SPT PPh Badan tidak ditemukan');
	}

	const pphKurangLebihBayar = input.labaRugi.reduce((total, row) => total + Number(row.fiskal), 0);
	const statusDraft = input.action === 'Simpan Lapor' ? 'dilaporkan' : 'konsep';
	const sektorUsahaId = await getSektorUsahaId(input.sektorUsaha);
	const opiniAuditorId = await getOpiniAuditorId(input.diaudit, input.opiniAuditor);

	await db.transaction(async (tx) => {
		await tx
			.update(spt_pph_badan)
			.set({
				metodePembukuan: input.metodePembukuan,
				sektorUsahaId,
				diaudit: input.diaudit,
				opiniAuditorId,
				npwpKantorAkuntanPublik: input.diaudit ? input.npwpKantorAkuntanPublik : null,
				namaKantorAkuntanPublik: input.diaudit ? input.namaKantorAkuntanPublik : null,
				menerimaPenghasilanPp23: input.menerimaPenghasilanPp23,
				hanyaPenghasilanPp23: input.hanyaPenghasilanPp23,
				menerimaPenghasilanFinal: input.menerimaPenghasilanFinal,
				menerimaPenghasilanBukanObjekPajak: input.menerimaPenghasilanBukanObjekPajak,
				pphKurangLebihBayar,
				statusDraft,
				tanggalDilaporkan: statusDraft === 'dilaporkan' ? new Date() : null
			})
			.where(eq(spt_pph_badan.id, input.id));

		for (const row of input.labaRugi) {
			await tx
				.update(spt_pph_badan_lampiran_1_laba_rugi)
				.set({
					komersial: Number(row.komersial),
					tidakTermasukObjekPajak: Number(row.tidakTermasukObjekPajak),
					dikenakanPphFinal: Number(row.dikenakanPphFinal),
					fiskal: Number(row.fiskal)
				})
				.where(
					and(
						eq(spt_pph_badan_lampiran_1_laba_rugi.id, row.id),
						eq(spt_pph_badan_lampiran_1_laba_rugi.sptPphBadanId, input.id)
					)
				);
		}

		for (const row of input.neraca) {
			await tx
				.update(spt_pph_badan_lampiran_1_neraca)
				.set({
					nilai: Number(row.nilai)
				})
				.where(
					and(
						eq(spt_pph_badan_lampiran_1_neraca.id, row.id),
						eq(spt_pph_badan_lampiran_1_neraca.sptPphBadanId, input.id)
					)
				);
		}

		await tx
			.delete(spt_pph_badan_lampiran_2_pihak)
			.where(
				and(
					eq(spt_pph_badan_lampiran_2_pihak.sptPphBadanId, input.id),
					eq(spt_pph_badan_lampiran_2_pihak.jenis, 'pemegang_saham')
				)
			);

		for (const [index, row] of input.l2a.entries()) {
			const negaraId = row.negara ? await getNegaraId(row.negara) : null;

			await tx.insert(spt_pph_badan_lampiran_2_pihak).values({
				sptPphBadanId: input.id,
				jenis: 'pemegang_saham',
				nomorUrut: index + 1,
				nama: row.nama,
				alamat: row.alamat,
				negaraId,
				npwpNikTin: row.npwp,
				jabatan: row.jabatan,
				modalSahamNominal: Number(row.nilaiModal),
				modalSahamPersentase: Number(row.persentase),
				dividenDiterima: Number(row.dividen)
			});
		}
	});

	redirect(303, statusDraft === 'dilaporkan' ? '/surat-pemberitahuan/laporan' : '/surat-pemberitahuan/konsep');
});

async function getOpiniAuditorId(diaudit: boolean, kode: string) {
	if (!diaudit) return null;

	if (!kode) {
		error(400, 'Opini auditor harus dipilih');
	}

	const [opiniAuditor] = await db
		.select({ id: opini_auditor_spt_pph_badan.id })
		.from(opini_auditor_spt_pph_badan)
		.where(
			and(
				eq(opini_auditor_spt_pph_badan.kode, kode),
				eq(opini_auditor_spt_pph_badan.aktif, true)
			)
		)
		.limit(1);

	if (!opiniAuditor) {
		error(400, 'Opini auditor tidak valid');
	}

	return opiniAuditor.id;
}

async function getNegaraId(kode: string) {
	const [negara] = await db
		.select({ id: negara_spt_pph_badan.id })
		.from(negara_spt_pph_badan)
		.where(and(eq(negara_spt_pph_badan.kode, kode), eq(negara_spt_pph_badan.aktif, true)))
		.limit(1);

	if (!negara) {
		error(400, 'Negara tidak valid');
	}

	return negara.id;
}

async function getSektorUsahaId(kode: string) {
	if (!kode) {
		error(400, 'Sektor usaha harus dipilih');
	}

	const [sektorUsaha] = await db
		.select({ id: sektor_usaha_spt_pph_badan.id })
		.from(sektor_usaha_spt_pph_badan)
		.where(
			and(
				eq(sektor_usaha_spt_pph_badan.kode, kode),
				eq(sektor_usaha_spt_pph_badan.aktif, true)
			)
		)
		.limit(1);

	if (!sektorUsaha) {
		error(400, 'Sektor usaha tidak valid');
	}

	return sektorUsaha.id;
}
