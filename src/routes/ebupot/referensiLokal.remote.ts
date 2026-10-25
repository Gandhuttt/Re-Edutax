import { getRequestEvent, query } from '$app/server';
import {
	findLocalBpInvoice,
	findLocalBpReceipt,
	getLocalBpContext
} from '$lib/server/ebupot/localRegistry';
import { error } from '@sveltejs/kit';
import * as v from 'valibot';

const SIMULASI_LABEL = 'SIMULASI Pendidikan — Bukan Verifikasi DJP';

const periode = {
	tahun: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(9999)),
	masaPajak: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(12))
};

const requireOwner = () => {
	const owner = getRequestEvent().locals.user?.username;
	if (!owner) error(401, 'Belum login');
	return owner;
};

export const getBpLocalContext = query(
	v.object({
		tin: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(64)), ''),
		...periode
	}),
	async ({ tin, tahun, masaPajak }) => getLocalBpContext(requireOwner(), tin, tahun, masaPajak)
);

export const lookupBpReceipt = query(
	v.object({
		receiptNumber: v.pipe(v.string(), v.trim(), v.maxLength(80)),
		...periode
	}),
	async ({ receiptNumber, tahun, masaPajak }) => {
		const row = await findLocalBpReceipt(requireOwner(), receiptNumber, tahun, masaPajak);
		return row ? { ...row, simulasi: true as const, labelSimulasi: SIMULASI_LABEL } : null;
	}
);

export const lookupBpInvoice = query(
	v.object({
		tin: v.pipe(v.string(), v.trim(), v.maxLength(64)),
		nomorDokumen: v.pipe(v.string(), v.trim(), v.maxLength(64))
	}),
	async ({ tin, nomorDokumen }) => findLocalBpInvoice(requireOwner(), tin, nomorDokumen)
);
