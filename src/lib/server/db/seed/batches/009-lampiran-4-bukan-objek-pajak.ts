import { jenis_penghasilan_bukan_objek_pajak_spt_pph_badan } from '../../schema';
import type { SeedContext } from '../context';
import { batchInsert } from '../helpers';

export const name = '009 lampiran 4 jenis penghasilan bukan objek pajak reference data';

const jenisPenghasilanOptions = [
	'Penghasilan tertentu bagi BPKH',
	'Penghasilan tertentu bagi BPJS',
	'Iuran dan Penghasilan tertentu yang menerima dana pensiun',
	'Sisanya lebih untuk pembangunan dan pengadaan sarana dan prasarana',
	'Dividen atau bagian laba',
	'Bagian laba yang diterima perusahaan modal ventura dari badan pasangan usaha',
	'Pembebasan utang',
	'Hibah',
	'Bantuan/Sumbangan',
	'Bagian Laba Anggota Perseroan Komanditer Tidak Atas Saham, Persekutuan, Perkumpulan, Firma, Kongsi',
	'Klaim asuransi kesehatan, kecelakaan, jiwa, dwiguna, beasiswa',
	'Hadiah langsung yang diberikan kepada semua pembeli/konsumen akhir tanpa diundi',
	'Harta termasuk setor tunai yang diterima oleh badan sebagai pengganti saham atau pengganti penyertaan modal',
	'Penghasilan lain yang tidak termasuk objek pajak'
] as const;

const jenisPenghasilanId = (kode: string) => `jenis-penghasilan-bukan-objek-pajak-${kode}`;

export const run = async ({ db }: SeedContext) => {
	await batchInsert(
		db,
		jenisPenghasilanOptions.map((nama, index) => {
			const kode = String(index + 1).padStart(2, '0');

			return db
				.insert(jenis_penghasilan_bukan_objek_pajak_spt_pph_badan)
				.values({
					id: jenisPenghasilanId(kode),
					kode,
					nama
				})
				.onConflictDoUpdate({
					target: jenis_penghasilan_bukan_objek_pajak_spt_pph_badan.kode,
					set: { nama, aktif: true }
				});
		})
	);

	console.log(
		`Seeded SPT PPh Badan references: ${jenisPenghasilanOptions.length} jenis penghasilan bukan objek pajak`
	);

	return [];
};
