import { and, eq, notInArray } from 'drizzle-orm';
import { jenis_harta_spt_pph_badan } from '../../schema';
import type { SeedContext } from '../context';

export const name = '010 lampiran 9 jenis harta penyusutan/amortisasi reference data';

const hartaBerwujud = [
	'Aset Bergerak Lainnya',
	'Aset Lainnya',
	'Bus',
	'Gerobak/Troli',
	'Jet Ski',
	'Kapal Laut',
	'Kapal Pesiar',
	'Kendaraan Angkutan',
	'Kendaraan Khusus',
	'Kereta',
	'Mesin',
	'Mobil Penumpang',
	'Motor',
	'Peralatan',
	'Peralatan Elektronik'
] as const;

const bangunan = [
	'Apartemen',
	'Aset tidak Bergerak Lainnya',
	'Bangunan untuk tempat tinggal',
	'Bangunan untuk usaha (toko, pabrik, kantor, gudang, dan sejenisnya)',
	'Bangunan yang disewakan'
] as const;

const hartaTidakBerwujud = [
	'Goodwill',
	'Hak Eksploitasi Sumber Daya Alam dan Hasil Alam Lainnya',
	'Hak Guna Bangunan',
	'Hak Guna Usaha',
	'Hak Pakai',
	'Hak Pengusahaan Hutan',
	'Hak di Lapangan Minyak dan Gas',
	'Harta Tidak Berwujud Lainnya',
	'Merek dagang',
	'Paten',
	'Royalti'
] as const;

const groups: { kelompok: 'harta_berwujud' | 'bangunan' | 'harta_tidak_berwujud'; items: readonly string[] }[] = [
	{ kelompok: 'harta_berwujud', items: hartaBerwujud },
	{ kelompok: 'bangunan', items: bangunan },
	{ kelompok: 'harta_tidak_berwujud', items: hartaTidakBerwujud }
];

const slugify = (value: string) =>
	value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '_')
		.replace(/^_+|_+$/g, '');

const jenisHartaId = (kode: string) => `jenis-harta-${kode}`;

export const run = async ({ db }: SeedContext) => {
	let total = 0;

	for (const group of groups) {
		const currentKode = group.items.map((nama) => `${group.kelompok}_${slugify(nama)}`);

		for (const [index, nama] of group.items.entries()) {
			const kode = currentKode[index];

			await db
				.insert(jenis_harta_spt_pph_badan)
				.values({
					id: jenisHartaId(kode),
					kode,
					nama,
					kelompok: group.kelompok
				})
				.onConflictDoUpdate({
					target: jenis_harta_spt_pph_badan.kode,
					set: { nama, kelompok: group.kelompok, aktif: true }
				});

			total += 1;
		}

		await db
			.update(jenis_harta_spt_pph_badan)
			.set({ aktif: false })
			.where(
				and(eq(jenis_harta_spt_pph_badan.kelompok, group.kelompok), notInArray(jenis_harta_spt_pph_badan.kode, currentKode))
			);
	}

	console.log(`Seeded SPT PPh Badan references: ${total} jenis harta penyusutan/amortisasi`);

	return [];
};
