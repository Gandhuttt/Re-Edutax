import { form, getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { faktur_pajak } from '$lib/server/db/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import * as v from 'valibot';

const FakturIdSchema = v.object({
	id: v.string()
});
function createInvoiceNumber() {
	const chunks = crypto.getRandomValues(new Uint32Array(2));
	return Array.from(chunks, (chunk) => String(chunk % 100_000_000).padStart(8, '0')).join('');
}


export const uploadFaktur = form(FakturIdSchema, async ({ id }) => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	await db
		.update(faktur_pajak)
		.set({
			diupload: true,
			dikreditkan: false,
			nomorFaktur: createInvoiceNumber()
		})
		.where(
			and(
				eq(faktur_pajak.id, id),
				eq(faktur_pajak.npwpPenjual, activeNpwp),
				eq(faktur_pajak.diupload, false)
			)
		);

	redirect(303, '/faktur-pajak/keluaran');
});
