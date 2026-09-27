import { form, getRequestEvent } from '$app/server';
import { requiredString } from '$lib/helpers/valibot-schema';
import { db } from '$lib/server/db';
import { faktur_pajak, retur_faktur_pajak_masukan } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import * as v from 'valibot';
import { listReturFakturMasukan } from './listReturFakturMasukan.remote';

const ReturnIdSchema = v.object({ id: requiredString('Retur pajak masukan') });

export const deleteReturFaktur = form(ReturnIdSchema, async ({ id }) => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;
	if (!activeNpwp) error(401, 'Belum login');

	const [record] = await db
		.select({ status: retur_faktur_pajak_masukan.status })
		.from(retur_faktur_pajak_masukan)
		.innerJoin(faktur_pajak, eq(faktur_pajak.id, retur_faktur_pajak_masukan.fakturPajakId))
		.where(
			and(
				eq(retur_faktur_pajak_masukan.id, id),
				eq(faktur_pajak.npwpPembeli, activeNpwp)
			)
		)
		.limit(1);

	if (!record) error(404, 'Retur pajak masukan tidak ditemukan');
	if (record.status !== 'konsep') error(400, 'Hanya konsep retur yang dapat dihapus');

	await db.delete(retur_faktur_pajak_masukan).where(eq(retur_faktur_pajak_masukan.id, id));
	await listReturFakturMasukan().refresh();
});
