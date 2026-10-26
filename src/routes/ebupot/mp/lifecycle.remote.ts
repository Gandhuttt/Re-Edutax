import { command, getRequestEvent } from '$app/server';
import { MAX_BP_BULK, mutateBpOrHttpError } from '$lib/server/ebupot/lifecycle';
import * as v from 'valibot';

export const mutateMp = command(
	v.object({
		action: v.picklist(['delete', 'issue', 'cancel', 'amend']),
		ids: v.pipe(v.array(v.string()), v.minLength(1), v.maxLength(MAX_BP_BULK))
	}),
	({ action, ids }) => mutateBpOrHttpError(getRequestEvent().locals.user?.username, 'mp', action, ids)
);
