import { query } from '$app/server';
import { db } from '$lib/server/db';
import { wajib_pajak } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';

const GetWajibPajakSchema = v.object({
	npwp: v.nullish(v.string())
});

export const getWajibPajak = query(GetWajibPajakSchema, async ({ npwp }) => {
	if (!npwp) return undefined;

	const [profile] = await db.select().from(wajib_pajak).where(eq(wajib_pajak.npwp, npwp)).limit(1);

	if (!profile) return undefined;

	return {
		...profile,
		negara: 'Indonesia'
	};
});
