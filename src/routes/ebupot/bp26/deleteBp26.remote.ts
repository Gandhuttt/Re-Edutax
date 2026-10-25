import { form, getRequestEvent } from '$app/server';
import { mutateBpOrHttpError } from '$lib/server/ebupot/lifecycle';
import { redirect } from '@sveltejs/kit';
import * as v from 'valibot';

// Soft delete: unissued -> DELETED (never a hard delete), all guards in the shared service.
export const deleteBp26 = form(v.object({ id: v.string() }), async ({ id }) => {
	await mutateBpOrHttpError(getRequestEvent().locals.user?.username, 'bp26', 'delete', [id]);
	redirect(303, '/ebupot/bp26');
});
