import { form, getRequestEvent } from '$app/server';
import { decimalString } from '$lib/helpers/valibot-schema';
import { db } from '$lib/server/db';
import { spt_ppn } from '$lib/server/db/schema';
import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';
import { getOwnedSptPpn } from './server/getOwnedSptPpn.server';

const lebihBayarTindakanSchema = v.nullish(
	v.picklist(['dikompensasikan', 'dikembalikan_pendahuluan', 'dikembalikan_pemeriksaan'])
);

const SaveSptPpnSchema = v.object({
	id: v.string(),
	action: v.optional(v.picklist(['Simpan Konsep', 'Simpan Lapor'])),
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

	// III.A-G (including III.E, the kurang/lebih bayar figure) are read-only
	// values already recomputed and persisted by postSptPpn, so the status
	// decision reads straight off the stored row rather than a value
	// round-tripped through the form.
	const status =
		input.action === 'Simpan Lapor'
			? sptPpn.iiiE > 0
				? 'menunggu_pembayaran'
				: 'dilaporkan'
			: 'konsep';

	await db
		.update(spt_ppn)
		.set({
			status,
			iiiHGantiSptSebelumnya: input['check-ganti'] ?? false,
			iiiHTindakan: input['radio-ganti'] ?? null,
			iiiHRekeningNomor: input.III_H_rekening_nomor || null,
			iiiHRekeningNamaBank: input.III_H_rekening_namaBank || null,
			iiiHRekeningNamaPemilik: input.III_H_rekening_namaPemilik || null,
			ivDpp: Math.round(Number(input.IV_i)),
			ivPpn: Math.round(Number(input.IV_ii)),
			ixA: input.IX_0 ?? false,
			ixB: input.IX_1 ?? false,
			xSetuju: input['check-ttd'] ?? false,
			xDitandatanganiOleh: input['radio-ttd'] ?? null,
			xJabatan: input.X_jabatan || sptPpn.xJabatan,
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
