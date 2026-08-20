import { db } from '$lib/server/db';
import {
	spt_pph_orang_pribadi_kode_koreksi_fiskal,
	spt_pph_orang_pribadi_lampiran_3a_akun,
	spt_pph_orang_pribadi_lampiran_3a_koreksi_fiskal,
	spt_pph_orang_pribadi_lampiran_3a_laba_rugi,
	spt_pph_orang_pribadi_lampiran_3a_neraca,
	spt_pph_orang_pribadi_lampiran_3a_neraca_akun
} from '$lib/server/db/schema';
import { asc, eq, inArray } from 'drizzle-orm';

export type Sektor = 'dagang' | 'jasa' | 'industri';

// All three sektor templates are loaded regardless of which one Induk 1.b.4
// currently selects, same reasoning as SPT Badan L1: the peserta may have
// switched sektor before, and rows from an abandoned sektor are kept rather
// than deleted (see lampiran_3a.ts).
export async function getLampiranL3A(sptId: string) {
	const [akun, neracaAkun, labaRugi, neraca, kodeKoreksiFiskal] = await Promise.all([
		db.select().from(spt_pph_orang_pribadi_lampiran_3a_akun).orderBy(
			asc(spt_pph_orang_pribadi_lampiran_3a_akun.sektor),
			asc(spt_pph_orang_pribadi_lampiran_3a_akun.nomorUrut)
		),
		db
			.select()
			.from(spt_pph_orang_pribadi_lampiran_3a_neraca_akun)
			.orderBy(
				asc(spt_pph_orang_pribadi_lampiran_3a_neraca_akun.sektor),
				asc(spt_pph_orang_pribadi_lampiran_3a_neraca_akun.nomorUrut)
			),
		db
			.select()
			.from(spt_pph_orang_pribadi_lampiran_3a_laba_rugi)
			.where(eq(spt_pph_orang_pribadi_lampiran_3a_laba_rugi.sptPphOrangPribadiId, sptId)),
		db
			.select()
			.from(spt_pph_orang_pribadi_lampiran_3a_neraca)
			.where(eq(spt_pph_orang_pribadi_lampiran_3a_neraca.sptPphOrangPribadiId, sptId)),
		db
			.select({
				kode: spt_pph_orang_pribadi_kode_koreksi_fiskal.kode,
				nama: spt_pph_orang_pribadi_kode_koreksi_fiskal.nama,
				jenis: spt_pph_orang_pribadi_kode_koreksi_fiskal.jenis
			})
			.from(spt_pph_orang_pribadi_kode_koreksi_fiskal)
			.where(eq(spt_pph_orang_pribadi_kode_koreksi_fiskal.aktif, true))
			.orderBy(
				asc(spt_pph_orang_pribadi_kode_koreksi_fiskal.jenis),
				asc(spt_pph_orang_pribadi_kode_koreksi_fiskal.kode)
			)
	]);

	const labaRugiIds = labaRugi.map((row) => row.id);
	const koreksi = labaRugiIds.length
		? await db
				.select({
					labaRugiId: spt_pph_orang_pribadi_lampiran_3a_koreksi_fiskal.labaRugiId,
					kode: spt_pph_orang_pribadi_kode_koreksi_fiskal.kode
				})
				.from(spt_pph_orang_pribadi_lampiran_3a_koreksi_fiskal)
				.innerJoin(
					spt_pph_orang_pribadi_kode_koreksi_fiskal,
					eq(
						spt_pph_orang_pribadi_lampiran_3a_koreksi_fiskal.kodeKoreksiFiskalId,
						spt_pph_orang_pribadi_kode_koreksi_fiskal.id
					)
				)
				.where(inArray(spt_pph_orang_pribadi_lampiran_3a_koreksi_fiskal.labaRugiId, labaRugiIds))
		: [];

	const kodeByLabaRugiId = new Map<string, string[]>();
	for (const row of koreksi) {
		const list = kodeByLabaRugiId.get(row.labaRugiId) ?? [];
		list.push(row.kode);
		kodeByLabaRugiId.set(row.labaRugiId, list);
	}

	const akunPerSektor: Record<Sektor, typeof akun> = { dagang: [], jasa: [], industri: [] };
	for (const row of akun) {
		akunPerSektor[row.sektor as Sektor].push(row);
	}

	const neracaAkunPerSektor: Record<Sektor, typeof neracaAkun> = {
		dagang: [],
		jasa: [],
		industri: []
	};
	for (const row of neracaAkun) {
		neracaAkunPerSektor[row.sektor as Sektor].push(row);
	}

	return {
		akunPerSektor,
		neracaAkunPerSektor,
		neraca,
		labaRugi: labaRugi.map((row) => ({
			...row,
			kodePenyesuaianFiskal: kodeByLabaRugiId.get(row.id) ?? []
		})),
		kodeKoreksiFiskal
	};
}
