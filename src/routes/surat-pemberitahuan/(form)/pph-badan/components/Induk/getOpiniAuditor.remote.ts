import { prerender } from '$app/server';
import { db } from '$lib/server/db';
import { opini_auditor_spt_pph_badan } from '$lib/server/db/schema';
import { asc, eq } from 'drizzle-orm';

export const getOpiniAuditor = prerender(async () => {
	const rows = await db
		.select({
			id: opini_auditor_spt_pph_badan.id,
			kode: opini_auditor_spt_pph_badan.kode,
			nama: opini_auditor_spt_pph_badan.nama
		})
		.from(opini_auditor_spt_pph_badan)
		.where(eq(opini_auditor_spt_pph_badan.aktif, true))
		.orderBy(asc(opini_auditor_spt_pph_badan.kode));

	return rows.map((row) => ({
		id: row.id,
		value: row.kode,
		label: row.nama
	}));
});
