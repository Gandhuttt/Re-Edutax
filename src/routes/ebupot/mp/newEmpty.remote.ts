import { form, getRequestEvent } from '$app/server';
import { createBpDraft } from '$lib/server/ebupot/lifecycle';
import { error, redirect } from '@sveltejs/kit';

export const newEmpty = form(async () => {
	const activeNpwp = getRequestEvent().locals.user?.username;
	if (!activeNpwp) error(401, 'Belum login');
	const id = await createBpDraft(activeNpwp, 'mp');

	redirect(303, `/ebupot/mp/${id}`);
});
