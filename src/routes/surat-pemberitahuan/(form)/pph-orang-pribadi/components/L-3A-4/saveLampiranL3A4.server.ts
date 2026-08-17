import { jsonRows } from '$lib/helpers/valibot-schema';
import { db, type Statement } from '$lib/server/db';
import { spt_pph_orang_pribadi_lampiran_3a4_lainnya } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';

const looseRows = jsonRows(v.record(v.string(), v.union([v.string(), v.number(), v.null()])));

export const L3A4Schema = v.object({
	l3a4Lainnya: looseRows
});

type L3A4Input = v.InferOutput<typeof L3A4Schema>;
type Row = Record<string, string | number | null>;

const teks = (value: unknown) => (value === undefined || value === null ? '' : String(value));
const angka = (value: unknown) => {
	const n = Number(value);
	return Number.isFinite(n) ? Math.round(n) : 0;
};

export function saveLampiranL3A4(sptId: string, input: L3A4Input) {
	const statements: Statement[] = [
		db
			.delete(spt_pph_orang_pribadi_lampiran_3a4_lainnya)
			.where(eq(spt_pph_orang_pribadi_lampiran_3a4_lainnya.sptPphOrangPribadiId, sptId))
	];

	for (const [index, row] of (input.l3a4Lainnya as Row[]).entries()) {
		statements.push(
			db.insert(spt_pph_orang_pribadi_lampiran_3a4_lainnya).values({
				sptPphOrangPribadiId: sptId,
				nomorUrut: index + 1,
				kode: teks(row.kode),
				jenisPenghasilan: teks(row.jenisPenghasilan),
				penghasilanNeto: angka(row.penghasilanNeto)
			})
		);
	}

	const n1c = (input.l3a4Lainnya as Row[]).reduce((sum, row) => sum + angka(row.penghasilanNeto), 0);

	return { statements, n1c };
}
