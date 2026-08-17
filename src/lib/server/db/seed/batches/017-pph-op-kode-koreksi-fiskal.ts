import { notInArray } from 'drizzle-orm';
import { spt_pph_orang_pribadi_kode_koreksi_fiskal } from '../../schema';
import type { SeedContext } from '../context';
import { batchInsert } from '../helpers';

export const name = '017 SPT PPh Orang Pribadi L-3A kode koreksi fiskal';

// Transcribed from the live Coretax KODE PENYESUAIAN FISKAL multi-select,
// captured in docs/ui-reference/coretax/spt-1770-lampiran/L3A.md. Own copy
// rather than a reference into kode_koreksi_fiskal_spt_pph_badan (see
// references/spt_pph_orang_pribadi/kode_koreksi_fiskal.ts for why), even
// though the fifteen codes happen to read identically today. FPO-03 does not
// exist in the source; the gap is not renumbered.
const kodeKoreksiFiskal = [
	{
		kode: 'FPO-01',
		nama: 'Biaya yang dibebankan/dikeluarkan untuk kepentingan pribadi Wajib Pajak atau orang yang menjadi tanggungannya',
		jenis: 'positif'
	},
	{
		kode: 'FPO-02',
		nama: 'Premi Asuransi kesehatan, asuransi kecelakaan, asuransi jiwa, asuransi dwiguna, dan asuransi beasiswa yang dibayar oleh Wajib Pajak',
		jenis: 'positif'
	},
	{
		kode: 'FPO-04',
		nama: 'Jumlah yang melebihi kewajaran yang dibayarkan kepada pihak yang mempunyai hubungan istimewa sehubungan dengan pekerjaan yang dilakukan',
		jenis: 'positif'
	},
	{ kode: 'FPO-05', nama: 'Harta yang dihibahkan, bantuan atau sumbangan', jenis: 'positif' },
	{ kode: 'FPO-06', nama: 'Pajak penghasilan', jenis: 'positif' },
	{
		kode: 'FPO-07',
		nama: 'Gaji yang dibayarkan kepada pemilik/orang yang menjadi tanggungannya',
		jenis: 'positif'
	},
	{ kode: 'FPO-08', nama: 'Sanksi administrasi', jenis: 'positif' },
	{
		kode: 'FPO-09',
		nama: 'Selisih penyusutan komersial di atas penyusutan fiskal',
		jenis: 'positif'
	},
	{
		kode: 'FPO-10',
		nama: 'Selisih amortisasi komersial di atas amortisasi fiskal',
		jenis: 'positif'
	},
	{
		kode: 'FPO-11',
		nama: 'Biaya untuk mendapatkan, menagih dan memelihara penghasilan yang dikenakan PPh Final dan penghasilan yang tidak termasuk objek pajak',
		jenis: 'positif'
	},
	{ kode: 'FPO-12', nama: 'Penyesuaian fiskal positif lainnya', jenis: 'positif' },
	{
		kode: 'FNE-01',
		nama: 'Penghasilan yang dikenakan PPh final dan penghasilan yang tidak termasuk objek pajak tetapi termasuk dalam peredaran usaha',
		jenis: 'negatif'
	},
	{
		kode: 'FNE-02',
		nama: 'Selisih penyusutan komersial di bawah penyusutan fiskal',
		jenis: 'negatif'
	},
	{
		kode: 'FNE-03',
		nama: 'Selisih amortisasi komersial di bawah amortisasi fiskal',
		jenis: 'negatif'
	},
	{ kode: 'FNE-04', nama: 'Penyesuaian fiskal negatif lainnya', jenis: 'negatif' }
] as const;

const kodeId = (kode: string) => `pph-op-kode-koreksi-fiskal-${kode.toLowerCase()}`;

export const run = async ({ db }: SeedContext) => {
	const currentKode = kodeKoreksiFiskal.map((row) => row.kode);

	await batchInsert(
		db,
		kodeKoreksiFiskal.map((row) =>
			db
				.insert(spt_pph_orang_pribadi_kode_koreksi_fiskal)
				.values({ id: kodeId(row.kode), kode: row.kode, nama: row.nama, jenis: row.jenis })
				.onConflictDoUpdate({
					target: spt_pph_orang_pribadi_kode_koreksi_fiskal.kode,
					set: { nama: row.nama, jenis: row.jenis, aktif: true }
				})
		)
	);

	await db
		.update(spt_pph_orang_pribadi_kode_koreksi_fiskal)
		.set({ aktif: false })
		.where(notInArray(spt_pph_orang_pribadi_kode_koreksi_fiskal.kode, currentKode));

	console.log(`Seeded SPT PPh Orang Pribadi L-3A: ${kodeKoreksiFiskal.length} kode koreksi fiskal`);

	return [];
};
