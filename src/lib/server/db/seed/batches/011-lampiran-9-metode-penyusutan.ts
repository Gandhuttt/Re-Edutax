import { and, eq, notInArray } from 'drizzle-orm';
import { metode_penyusutan_spt_pph_badan } from '../../schema';
import type { SeedContext } from '../context';

export const name = '011 lampiran 9 metode penyusutan/amortisasi reference data';

const komersial = [
	'Garis Lurus',
	'Jumlah Angka Tahun',
	'Jumlah Jam Jasa',
	'Jumlah Satuan Produksi',
	'Metode Lainnya',
	'Saldo Menurun',
	'Saldo Menurun Ganda'
] as const;

const fiskal = ['Garis Lurus', 'Jumlah Satuan Produksi', 'Saldo Menurun'] as const;

const groups: { jenis: 'komersial' | 'fiskal'; items: readonly string[] }[] = [
	{ jenis: 'komersial', items: komersial },
	{ jenis: 'fiskal', items: fiskal }
];

const slugify = (value: string) =>
	value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '_')
		.replace(/^_+|_+$/g, '');

const metodePenyusutanId = (kode: string) => `metode-penyusutan-${kode}`;

export const run = async ({ db }: SeedContext) => {
	let total = 0;

	for (const group of groups) {
		const currentKode = group.items.map((nama) => `${group.jenis}_${slugify(nama)}`);

		for (const [index, nama] of group.items.entries()) {
			const kode = currentKode[index];

			await db
				.insert(metode_penyusutan_spt_pph_badan)
				.values({
					id: metodePenyusutanId(kode),
					kode,
					nama,
					jenis: group.jenis,
					nomorUrut: index + 1
				})
				.onConflictDoUpdate({
					target: metode_penyusutan_spt_pph_badan.kode,
					set: { nama, jenis: group.jenis, nomorUrut: index + 1, aktif: true }
				});

			total += 1;
		}

		await db
			.update(metode_penyusutan_spt_pph_badan)
			.set({ aktif: false })
			.where(
				and(
					eq(metode_penyusutan_spt_pph_badan.jenis, group.jenis),
					notInArray(metode_penyusutan_spt_pph_badan.kode, currentKode)
				)
			);
	}

	console.log(`Seeded SPT PPh Badan references: ${total} metode penyusutan/amortisasi`);

	return [];
};
