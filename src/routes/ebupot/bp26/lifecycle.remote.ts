import { command, form, getRequestEvent } from '$app/server';
import { MAX_BP_BULK, mutateBpOrHttpError } from '$lib/server/ebupot/lifecycle';
import { redirect } from '@sveltejs/kit';
import * as v from 'valibot';

const owner = () => getRequestEvent().locals.user?.username;

// Bulk action from the list (all-or-none; stale/foreign/mixed ids reject the whole request).
export const mutateBp26 = command(
	v.object({
		action: v.picklist(['delete', 'issue', 'cancel', 'amend']),
		ids: v.pipe(v.array(v.string()), v.minLength(1), v.maxLength(MAX_BP_BULK))
	}),
	({ action, ids }) => mutateBpOrHttpError(owner(), 'bp26', action, ids)
);

export const cancelBp26 = form(v.object({ id: v.string() }), async ({ id }) => {
	await mutateBpOrHttpError(owner(), 'bp26', 'cancel', [id]);
	redirect(303, '/ebupot/bp26');
});

// Creates an unissued amendment draft copied from the issued original and opens it.
export const amendBp26 = form(v.object({ id: v.string() }), async ({ id }) => {
	const { createdIds } = await mutateBpOrHttpError(owner(), 'bp26', 'amend', [id]);
	redirect(303, `/ebupot/bp26/${createdIds?.[0]}`);
});
