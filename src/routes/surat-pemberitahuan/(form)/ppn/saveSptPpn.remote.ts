import { form, getRequestEvent } from '$app/server';
import { decimalString } from '$lib/helpers/valibot-schema';
import { SptPpnBlobSchema } from '$lib/schemas/surat-pemberitahuan/spt-ppn';
import type { SptPpnBlob } from '$lib/schemas/surat-pemberitahuan/spt-ppn';
import { db } from '$lib/server/db';
import { spt_ppn } from '$lib/server/db/schema';
import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';
import { getOwnedSptPpn } from './server/getOwnedSptPpn.server';
import { summarizeSptPpnBlob } from './server/summarizeSptPpnBlob.server';

const lebihBayarTindakanSchema = v.nullish(
	v.picklist(['dikompensasikan', 'dikembalikan_pendahuluan', 'dikembalikan_pemeriksaan'])
);

const SaveSptPpnSchema = v.object({
	id: v.string(),
	action: v.optional(v.picklist(['Simpan Konsep', 'Simpan Lapor'])),
	sptBlob: v.optional(v.string(), ''),
	sptPosted: v.optional(v.boolean()),
	IV_i: v.optional(decimalString('PPN terutang DPP'), '0'),
	IV_ii: v.optional(decimalString('PPN terutang'), '0'),
	'check-ganti': v.optional(v.boolean()),
	'radio-ganti': lebihBayarTindakanSchema,
	III_H_rekening_nomor: v.optional(v.string(), ''),
	III_H_rekening_namaBank: v.optional(v.string(), ''),
	III_H_rekening_namaPemilik: v.optional(v.string(), ''),
	IX_0: v.optional(v.boolean()),
	IX_1: v.optional(v.boolean()),
	'check-ttd': v.optional(v.boolean()),
	'radio-ttd': v.nullish(v.picklist(['PKP', 'KuasaWajibPajak'])),
	X_jabatan: v.optional(v.string(), '')
});

export const saveSptPpn = form('unchecked', async (rawInput) => {
	const input = v.parse(SaveSptPpnSchema, {
		id: stringValue(rawInput.id),
		action: stringValue(rawInput.action) || 'Simpan Konsep',
		sptBlob: stringValue(rawInput.sptBlob),
		sptPosted: booleanValue(rawInput.sptPosted),
		IV_i: stringValue(rawInput.IV_i) || '0',
		IV_ii: stringValue(rawInput.IV_ii) || '0',
		'check-ganti': booleanValue(rawInput['check-ganti']),
		'radio-ganti': stringValue(rawInput['radio-ganti']) || null,
		III_H_rekening_nomor: stringValue(rawInput.III_H_rekening_nomor),
		III_H_rekening_namaBank: stringValue(rawInput.III_H_rekening_namaBank),
		III_H_rekening_namaPemilik: stringValue(rawInput.III_H_rekening_namaPemilik),
		IX_0: booleanValue(rawInput.IX_0),
		IX_1: booleanValue(rawInput.IX_1),
		'check-ttd': booleanValue(rawInput['check-ttd']),
		'radio-ttd': stringValue(rawInput['radio-ttd']) || null,
		X_jabatan: stringValue(rawInput.X_jabatan)
	});
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	const sptPpn = await getOwnedSptPpn(input.id, activeNpwp);

	if (sptPpn.status !== 'konsep') {
		error(400, 'SPT yang sudah dilaporkan tidak dapat disimpan sebagai konsep');
	}

	const blob = parseSptBlobInput(input.sptBlob) ?? v.parse(SptPpnBlobSchema, sptPpn.blob);
	const nextBlob: SptPpnBlob = {
		...blob,
		III: [
			blob.III[0],
			blob.III[1],
			blob.III[2],
			blob.III[3],
			blob.III[4],
			blob.III[5],
			blob.III[6],
			{
				gantiSptSebelumnya: input['check-ganti'] ?? false,
				tindakan: input['radio-ganti'] ?? null,
				lampiranNamaFile: blob.III[7].lampiranNamaFile ?? null,
				rekening: {
					pilihRekeningBank: blob.III[7].rekening?.pilihRekeningBank ?? null,
					nomor: input.III_H_rekening_nomor || null,
					namaBank: input.III_H_rekening_namaBank || null,
					namaPemilik: input.III_H_rekening_namaPemilik || null
				}
			}
		],
		IV: [Math.round(Number(input.IV_i)), Math.round(Number(input.IV_ii))],
		IX: [input.IX_0 ?? false, input.IX_1 ?? false],
		X: {
			...blob.X,
			setuju: input['check-ttd'] ?? false,
			ditandatanganiOleh: input['radio-ttd'] ?? null,
			jabatan: input.X_jabatan || blob.X.jabatan
		}
	};
	const summary = summarizeSptPpnBlob(nextBlob);
	const status =
		input.action === 'Simpan Lapor'
			? summary.ppnKurangLebihBayar > 0
				? 'menunggu_pembayaran'
				: 'dilaporkan'
			: 'konsep';

	await db
		.update(spt_ppn)
		.set({
			status,
			blob: nextBlob,
			...summary,
			tanggalPosting: input.sptPosted ? new Date() : sptPpn.tanggalPosting,
			tanggalDilaporkan: status === 'dilaporkan' ? new Date() : sptPpn.tanggalDilaporkan
		})
		.where(eq(spt_ppn.id, input.id));

	if (status === 'menunggu_pembayaran') {
		redirect(303, '/surat-pemberitahuan/pembayaran');
	}

	if (status === 'dilaporkan') {
		redirect(303, '/surat-pemberitahuan/laporan');
	}

	redirect(303, '/surat-pemberitahuan/konsep');
});

function parseSptBlobInput(value: string) {
	if (!value) return undefined;

	try {
		return v.parse(SptPpnBlobSchema, JSON.parse(value));
	} catch {
		error(400, 'Data SPT hasil posting tidak valid');
	}
}

function firstValue(value: unknown) {
	return Array.isArray(value) ? value[0] : value;
}

function stringValue(value: unknown) {
	const first = firstValue(value);

	return typeof first === 'string' ? first : '';
}

function booleanValue(value: unknown) {
	const first = firstValue(value);

	return first === true || first === 'on' || first === 'true';
}
