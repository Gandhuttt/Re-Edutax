import { notInArray } from 'drizzle-orm';
import { kode_koreksi_fiskal_spt_pph_badan } from '../../schema';
import type { SeedContext } from '../context';

export const name = '013 kode koreksi fiskal (PER 11/2025) reference data';

const kodeKoreksiFiskal = [
	{
		kode: 'FPO-01',
		nama: 'Biaya yang dibebankan/dikeluarkan untuk kepentingan pribadi Wajib Pajak atau orang yang menjadi tanggungannya',
		jenis: 'positif'
	},
	{
		kode: 'FPO-02',
		nama: 'Premi asuransi kesehatan, asuransi kecelakaan, asuransi jiwa, asuransi dwiguna, dan asuransi beasiswa yang dibayar oleh wajib pajak',
		jenis: 'positif'
	},
	{
		kode: 'FPO-04',
		nama: 'Jumlah yang melebihi kewajaran yang dibayarkan kepada pihak yang mempunyai hubungan istimewa sehubungan dengan pekerjaan yang dilakukan',
		jenis: 'positif'
	},
	{ kode: 'FPO-05', nama: 'Harta yang dihibahkan, bantuan atau sumbangan', jenis: 'positif' },
	{ kode: 'FPO-06', nama: 'Pajak Penghasilan', jenis: 'positif' },
	{
		kode: 'FPO-07',
		nama: 'Gaji yang dibayarkan kepada pemilik/ orang yang menjadi tanggungannya',
		jenis: 'positif'
	},
	{ kode: 'FPO-08', nama: 'Sanksi administratif', jenis: 'positif' },
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
		nama: 'Biaya untuk mendapatkan, menagih dan memelihara penghasilan yang dikenakan PPh final dan penghasilan yang tidak termasuk objek pajak',
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

const kodeKoreksiFiskalId = (kode: string) => `kode-koreksi-fiskal-${kode.toLowerCase()}`;

export const run = async ({ db }: SeedContext) => {
	const currentKode = kodeKoreksiFiskal.map((row) => row.kode);

	for (const row of kodeKoreksiFiskal) {
		await db
			.insert(kode_koreksi_fiskal_spt_pph_badan)
			.values({
				id: kodeKoreksiFiskalId(row.kode),
				kode: row.kode,
				nama: row.nama,
				jenis: row.jenis
			})
			.onConflictDoUpdate({
				target: kode_koreksi_fiskal_spt_pph_badan.kode,
				set: { nama: row.nama, jenis: row.jenis, aktif: true }
			});
	}

	await db
		.update(kode_koreksi_fiskal_spt_pph_badan)
		.set({ aktif: false })
		.where(notInArray(kode_koreksi_fiskal_spt_pph_badan.kode, currentKode));

	console.log(`Seeded SPT PPh Badan references: ${kodeKoreksiFiskal.length} kode koreksi fiskal (PER 11/2025)`);

	return [];
};
