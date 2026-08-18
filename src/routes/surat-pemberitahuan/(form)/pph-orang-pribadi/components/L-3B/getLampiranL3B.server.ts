import { db } from '$lib/server/db';
import {
	spt_pph_orang_pribadi_lampiran_3b_bulanan,
	spt_pph_orang_pribadi_lampiran_3b_tku
} from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

// All three sections are a fixed 12-row monthly matrix, always present
// regardless of what is stored, same "fill the gaps with zero" pattern as
// L-5's ten-row matrix.
export async function getLampiranL3B(sptId: string) {
	const [tku, bulanan] = await Promise.all([
		db
			.select()
			.from(spt_pph_orang_pribadi_lampiran_3b_tku)
			.where(eq(spt_pph_orang_pribadi_lampiran_3b_tku.sptPphOrangPribadiId, sptId))
			.limit(1)
			.then((rows) => rows[0] ?? null),
		db
			.select()
			.from(spt_pph_orang_pribadi_lampiran_3b_bulanan)
			.where(eq(spt_pph_orang_pribadi_lampiran_3b_bulanan.sptPphOrangPribadiId, sptId))
	]);

	const bySeksiBulan = new Map(
		bulanan.map((row) => [`${row.seksi}-${row.bulan}`, row])
	);

	const a = Array.from({ length: 12 }, (_, i) => {
		const bulan = i + 1;
		const existing = bySeksiBulan.get(`A-${bulan}`);
		return {
			bulan,
			peredaranBruto: existing?.peredaranBruto ?? 0,
			disetorSendiri: existing?.disetorSendiri ?? 0,
			dipotongPihakLain: existing?.dipotongPihakLain ?? 0
		};
	});

	const monthlyOnly = (seksi: 'B' | 'C') =>
		Array.from({ length: 12 }, (_, i) => {
			const bulan = i + 1;
			const existing = bySeksiBulan.get(`${seksi}-${bulan}`);
			return { bulan, peredaranBruto: existing?.peredaranBruto ?? 0 };
		});

	return {
		tku: {
			nama: tku?.nama ?? '',
			alamat: tku?.alamat ?? '',
			kelurahan: tku?.kelurahan ?? '',
			kecamatan: tku?.kecamatan ?? '',
			kabupaten: tku?.kabupaten ?? '',
			provinsi: tku?.provinsi ?? '',
			jenisUsahaPekerjaanBebas: tku?.jenisUsahaPekerjaanBebas ?? '',
			normaPersen: tku?.normaPersen ?? 0
		},
		a,
		b: monthlyOnly('B'),
		c: monthlyOnly('C')
	};
}
