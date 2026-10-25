import { getRequestEvent, query } from '$app/server';
import { findBpInvoice, getBpContext } from '$lib/server/ebupot/bpLookup';
import { error } from '@sveltejs/kit';
import * as v from 'valibot';

const requireOwner = () => {
	const owner = getRequestEvent().locals.user?.username;
	if (!owner) error(401, 'Belum login');
	return owner;
};

export const getBpLookupContext = query(
	v.object({ tin: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(64)), '') }),
	async ({ tin }) => getBpContext(requireOwner(), tin)
);

export const lookupBpInvoice = query(
	v.object({
		tin: v.pipe(v.string(), v.trim(), v.maxLength(64)),
		nomorDokumen: v.pipe(v.string(), v.trim(), v.maxLength(64))
	}),
	async ({ tin, nomorDokumen }) => findBpInvoice(requireOwner(), tin, nomorDokumen)
);
