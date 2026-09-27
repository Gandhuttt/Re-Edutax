import { form, getRequestEvent } from '$app/server';
import { requiredString } from '$lib/helpers/valibot-schema';
import { db } from '$lib/server/db';
import { faktur_pajak, retur_faktur_pajak_masukan } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import * as v from 'valibot';
import { listReturFakturKeluaran } from './listReturFakturKeluaran.remote';

const CancelReturnSchema = v.object({
	id: requiredString('Retur pajak keluaran')
});

export const batalkanReturFaktur = form(CancelReturnSchema, async ({ id }) => {
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
				eq(faktur_pajak.npwpPenjual, activeNpwp)
			)
		)
		.limit(1);

	if (!record) error(404, 'Retur pajak keluaran tidak ditemukan');
	if (record.status !== 'diunggah') error(400, 'Hanya retur yang sudah diunggah dapat dibatalkan');

	await db
		.update(retur_faktur_pajak_masukan)
		.set({ status: 'dibatalkan' })
		.where(eq(retur_faktur_pajak_masukan.id, id));

	await listReturFakturKeluaran().refresh();
});
