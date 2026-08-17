import { jsonRows } from '$lib/helpers/valibot-schema';
import { db, type Statement } from '$lib/server/db';
import {
	spt_pph_orang_pribadi_kode_koreksi_fiskal,
	spt_pph_orang_pribadi_lampiran_3a_akun,
	spt_pph_orang_pribadi_lampiran_3a_koreksi_fiskal,
	spt_pph_orang_pribadi_lampiran_3a_laba_rugi
} from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';
import { computeLabaRugiRows } from '../../../pph-badan/components/L1/labaRugiRollup';

// Rows are keyed by akunId, the seeded akun row's own id, which is already
// namespaced per sektor at seed time. That is what makes a leftover row from
// an abandoned sektor harmless rather than a silent collision: several codes
// (5008, 5009, 5020, 4300, 4800...) repeat across sektors with different
// meanings, so a plain kode key would not have this property.
export const L3ASchema = v.object({
	l3aLabaRugi: jsonRows(
		v.object({
			akunId: v.string(),
			nilaiKomersial: v.optional(v.number(), 0),
			nonObjekPajak: v.optional(v.number(), 0),
			dikenakanPphFinal: v.optional(v.number(), 0),
			penyesuaianFiskalPositif: v.optional(v.number(), 0),
			penyesuaianFiskalNegatif: v.optional(v.number(), 0),
			kodePenyesuaianFiskal: v.optional(v.array(v.string()), [])
		})
	)
});

type L3AInput = v.InferOutput<typeof L3ASchema>;
type Sektor = 'dagang' | 'jasa' | 'industri';

// Takes the sektor as its own argument rather than reading a submitted field:
// it is exactly Induk 1.b.4, already parsed once by the caller, and duplicating
// it as a second field on this schema would risk the two disagreeing.
export async function saveLampiranL3A(sptId: string, sektor: Sektor | null, input: L3AInput) {
	const statements: Statement[] = [];
	let n1b = 0;

	if (sektor) {
		const akun = await db
			.select()
			.from(spt_pph_orang_pribadi_lampiran_3a_akun)
			.where(eq(spt_pph_orang_pribadi_lampiran_3a_akun.sektor, sektor));

		const akunById = new Map(akun.map((row) => [row.id, row]));

		const kodeKoreksi = await db
			.select()
			.from(spt_pph_orang_pribadi_kode_koreksi_fiskal)
			.where(eq(spt_pph_orang_pribadi_kode_koreksi_fiskal.aktif, true));
		const koreksiIdByKode = new Map(kodeKoreksi.map((row) => [row.kode, row.id]));

		// Rows carrying an akunId outside this sektor's own template are stale
		// submissions from a sektor the peserta has since switched away from,
		// and are dropped rather than persisted.
		const rowsToInsert = input.l3aLabaRugi.filter((row) => akunById.has(row.akunId));

		statements.push(
			db
				.delete(spt_pph_orang_pribadi_lampiran_3a_laba_rugi)
				.where(eq(spt_pph_orang_pribadi_lampiran_3a_laba_rugi.sptPphOrangPribadiId, sptId))
		);

		for (const row of rowsToInsert) {
			const id = `${sptId}:${row.akunId}`;
			statements.push(
				db.insert(spt_pph_orang_pribadi_lampiran_3a_laba_rugi).values({
					id,
					sptPphOrangPribadiId: sptId,
					akunId: row.akunId,
					nilaiKomersial: Math.round(Number(row.nilaiKomersial)),
					nonObjekPajak: Math.round(Number(row.nonObjekPajak)),
					dikenakanPphFinal: Math.round(Number(row.dikenakanPphFinal)),
					penyesuaianFiskalPositif: Math.round(Number(row.penyesuaianFiskalPositif)),
					penyesuaianFiskalNegatif: Math.round(Number(row.penyesuaianFiskalNegatif))
				})
			);

			// Junction rows for a laba/rugi row that no longer exists are removed
			// via cascade when that row is deleted above; re-inserting the same
			// deterministic id then repopulates them fresh.
			for (const kode of row.kodePenyesuaianFiskal) {
				const kodeKoreksiFiskalId = koreksiIdByKode.get(kode);
				if (!kodeKoreksiFiskalId) continue;
				statements.push(
					db.insert(spt_pph_orang_pribadi_lampiran_3a_koreksi_fiskal).values({
						labaRugiId: id,
						kodeKoreksiFiskalId
					})
				);
			}
		}

		const template = akun.map((row) => ({
			id: row.id,
			nomorUrut: row.nomorUrut,
			kode: row.kode,
			namaAkun: row.namaAkun,
			rowType: row.rowType,
			classification: row.classification,
			parentKode: row.parentKode,
			sign: row.sign
		}));

		const leafValues = rowsToInsert.map((row) => ({
			akunId: row.akunId,
			nilaiKomersial: Number(row.nilaiKomersial),
			nonObjekPajak: Number(row.nonObjekPajak),
			dikenakanPphFinal: Number(row.dikenakanPphFinal),
			penyesuaianFiskalPositif: Number(row.penyesuaianFiskalPositif),
			penyesuaianFiskalNegatif: Number(row.penyesuaianFiskalNegatif),
			kodePenyesuaianFiskal: row.kodePenyesuaianFiskal
		}));

		const computed = computeLabaRugiRows(template, leafValues);
		// Induk 1.b.5 reads L-3A's 4800 NILAI FISKAL directly, no further
		// adjustment. Measured end to end in L3A.md.
		n1b = computed.find((row) => row.kode === '4800')?.nilaiFiskal ?? 0;
	}

	return { statements, n1b };
}
