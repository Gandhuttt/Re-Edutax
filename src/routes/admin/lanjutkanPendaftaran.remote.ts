import { form } from '$app/server';
import { requiredString } from '$lib/helpers/valibot-schema';
import { requireAdmin } from '$lib/server/admin';
import { selesaikanPendaftaran } from '$lib/server/pendaftaran';
import { invalid } from '@sveltejs/kit';
import * as v from 'valibot';
import { listPendaftaran } from './listPendaftaran.remote';

/**
 * Finishes whatever a pendaftaran is missing: the account (if it stalled at `diproses`) and the
 * Google Sheets row (if it was never sent). Safe to press repeatedly.
 */
export const lanjutkanPendaftaran = form(v.object({ id: requiredString('Pendaftaran') }), async ({ id }) => {
	requireAdmin();

	const hasil = await selesaikanPendaftaran(id);

	await listPendaftaran().refresh();

	if (!hasil.ok) {
		invalid(hasil.error);
	}

	return { message: 'Pendaftaran diselesaikan' };
});
