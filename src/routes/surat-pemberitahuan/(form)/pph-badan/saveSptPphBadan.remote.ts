import { form, getRequestEvent } from '$app/server';
import { decimalString } from '$lib/helpers/valibot-schema';
import { db } from '$lib/server/db';
import {
	opini_auditor_spt_pph_badan,
	sektor_usaha_spt_pph_badan,
	spt_pph_badan,
	spt_pph_badan_lampiran_1_laba_rugi,
	spt_pph_badan_lampiran_1_neraca
} from '$lib/server/db/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import * as v from 'valibot';

const decimalInput = (field: string) => v.union([decimalString(field), v.number(`${field} harus berupa angka`)]);

const SaveSptPphBadanSchema = v.object({
	id: v.string(),
	action: v.optional(v.picklist(['Simpan Konsep', 'Simpan Lapor'])),
	metodePembukuan: v.picklist(['akrual', 'kas']),
	sektorUsaha: v.string(),
	diaudit: v.optional(v.boolean()),
	opiniAuditor: v.optional(v.string()),
	menerimaPenghasilanPp23: v.optional(v.boolean()),
	hanyaPenghasilanPp23: v.optional(v.boolean()),
	menerimaPenghasilanFinal: v.optional(v.boolean()),
	menerimaPenghasilanBukanObjekPajak: v.optional(v.boolean()),
	labaRugiJson: v.string(),
	neracaJson: v.string(),
	labaRugi: v.array(
			v.object({
				id: v.string(),
				komersial: decimalInput('Nilai komersial'),
				tidakTermasukObjekPajak: decimalInput('Tidak termasuk objek pajak'),
				dikenakanPphFinal: decimalInput('Dikenakan PPh final'),
				fiskal: decimalInput('Nilai fiskal')
			})
		),
	neraca: v.array(
		v.object({
			id: v.string(),
			nilai: decimalInput('Nilai neraca')
		})
	)
});

export const saveSptPphBadan = form('unchecked', async (rawInput) => {
	const input = v.parse(SaveSptPphBadanSchema, {
		id: stringValue(rawInput.id),
		action: stringValue(rawInput.action) || 'Simpan Konsep',
		metodePembukuan: stringValue(rawInput.metodePembukuan) || 'akrual',
		sektorUsaha: stringValue(rawInput.sektorUsaha),
		diaudit: booleanValue(rawInput.diaudit),
		opiniAuditor: stringValue(rawInput.opiniAuditor),
		menerimaPenghasilanPp23: booleanValue(rawInput.menerimaPenghasilanPp23),
		hanyaPenghasilanPp23: booleanValue(rawInput.hanyaPenghasilanPp23),
		menerimaPenghasilanFinal: booleanValue(rawInput.menerimaPenghasilanFinal),
		menerimaPenghasilanBukanObjekPajak: booleanValue(rawInput.menerimaPenghasilanBukanObjekPajak),
		labaRugiJson: stringValue(rawInput.labaRugiJson),
		neracaJson: stringValue(rawInput.neracaJson),
		labaRugi: parseJsonRows(stringValue(rawInput.labaRugiJson)),
		neraca: parseJsonRows(stringValue(rawInput.neracaJson))
	});
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
	const opiniAuditorId = await getOpiniAuditorId(input.diaudit ?? false, input.opiniAuditor ?? '');

	await db.transaction(async (tx) => {
		await tx
			.update(spt_pph_badan)
			.set({
				metodePembukuan: input.metodePembukuan,
				sektorUsahaId,
				opiniAuditorId,
				menerimaPenghasilanPp23: input.menerimaPenghasilanPp23 ?? false,
				hanyaPenghasilanPp23: input.hanyaPenghasilanPp23 ?? false,
				menerimaPenghasilanFinal: input.menerimaPenghasilanFinal ?? false,
				menerimaPenghasilanBukanObjekPajak: input.menerimaPenghasilanBukanObjekPajak ?? false,
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
	});

	redirect(303, statusDraft === 'dilaporkan' ? '/surat-pemberitahuan/laporan' : '/surat-pemberitahuan/konsep');
});

function formValue(value: unknown) {
	return Array.isArray(value) ? value.at(-1) : value;
}

function stringValue(value: unknown) {
	const first = formValue(value);

	return typeof first === 'string' ? first : '';
}

function booleanValue(value: unknown) {
	const first = formValue(value);

	return first === true || first === 'on' || first === 'true';
}

function parseJsonRows(value: string) {
	if (!value) return [];

	try {
		const parsed = JSON.parse(value);

		return Array.isArray(parsed) ? parsed : [];
	} catch {
		error(400, 'Data Lampiran 1 tidak valid');
	}
}

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
