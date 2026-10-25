import { command, getRequestEvent } from '$app/server';
import { MAX_BP_BULK, mutateBpOrHttpError } from '$lib/server/ebupot/lifecycle';
import * as v from 'valibot';

// Bulk action from the list (all-or-none; stale/foreign/mixed ids reject the whole request).
export const mutateBpa1 = command(
	v.object({
		action: v.picklist(['delete', 'issue', 'cancel', 'amend']),
		ids: v.pipe(v.array(v.string()), v.minLength(1), v.maxLength(MAX_BP_BULK))
	}),
	({ action, ids }) => mutateBpOrHttpError(getRequestEvent().locals.user?.username, 'bpa1', action, ids)
);
