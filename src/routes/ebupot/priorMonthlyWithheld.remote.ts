import { getRequestEvent, query } from '$app/server';
import { priorMonthlyPph21Withheld } from '$lib/server/ebupot/priorMonthlyWithheld';
import { error } from '@sveltejs/kit';
import * as v from 'valibot';

const month = v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(12));
const year = v.pipe(v.number(), v.integer(), v.minValue(2000));

const PriorMonthlyWithheldSchema = v.object({
	nomorIdentitasWp: v.string(),
	nama: v.string(),
	kodeObjekPajakId: v.string(),
	masaPajakAwal: month,
	tahunAwal: year,
	masaPajakAkhir: month,
	tahunAkhir: year
});

// Live preview of "PPh Pasal 21 yang Dipotong" on the BPA1/BPA2 forms; the
// update remotes recompute it on save, this only keeps the page in step.
export const getPriorMonthlyWithheld = query(PriorMonthlyWithheldSchema, async (input) => {
	const npwpPemotong = getRequestEvent().locals.user?.username;
	if (!npwpPemotong) error(401, 'Belum login');

	return priorMonthlyPph21Withheld({ ...input, npwpPemotong });
});
