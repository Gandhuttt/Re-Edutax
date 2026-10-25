import { form, getRequestEvent } from '$app/server';
import { mutateBpOrHttpError } from '$lib/server/ebupot/lifecycle';
import { redirect } from '@sveltejs/kit';
import * as v from 'valibot';

// Simulated issuance (SIM-Bp26-... number); never calls DJP/Coretax. Usable from the
// list and from the detail page via .for(id).
export const terbitkanBp26 = form(v.object({ id: v.string() }), async ({ id }) => {
	await mutateBpOrHttpError(getRequestEvent().locals.user?.username, 'bp26', 'issue', [id]);
	redirect(303, '/ebupot/bp26');
});
