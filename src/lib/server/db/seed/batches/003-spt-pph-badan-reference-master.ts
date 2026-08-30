import { fileURLToPath } from 'node:url';
import { negara_spt_pph_badan, opini_auditor_spt_pph_badan, sektor_usaha_spt_pph_badan } from '../../schema';
import type { SeedContext } from '../context';
import { batchInsert, readCsv } from '../helpers';
import { eq } from 'drizzle-orm';

const negaraCsvPath = fileURLToPath(
	new URL('../data/spt_pph_badan/negara.csv', import.meta.url)
);

export const name = '003 spt pph badan reference master data';

const auditorOptions = [
	{ value: 'wajar_tanpa_pengecualian', label: 'Wajar Tanpa Pengecualian' },
	{
		value: 'wajar_tanpa_pengecualian_dengan_paragagraf_penjelasan',
		label: 'Wajar Tanpa Pengecualian dengan Paragraf Penjelasan'
	},
	{ value: 'wajar_dengan_pengecualian', label: 'Wajar Dengan Pengecualian' },
	{ value: 'tidak_wajar', label: 'Tidak Wajar' },
	{ value: 'tidak_menyatakan_pendapat', label: 'Tidak Menyatakan Pendapat' }
] as const;

const sektorUsahaOptions = [
	{ value: 'umum', label: 'Umum', lampiran1Kode: 'A' },
	{ value: 'manufaktur', label: 'Manufaktur', lampiran1Kode: 'B' },
	{ value: 'dagang', label: 'Dagang', lampiran1Kode: 'C' },
	{ value: 'jasa', label: 'Jasa', lampiran1Kode: 'D' },
	{ value: 'bank_konvensional', label: 'Bank Konvensional', lampiran1Kode: 'E' },
	{ value: 'dana_pensiun', label: 'Dana Pensiun', lampiran1Kode: 'F' },
	{ value: 'asuransi', label: 'Asuransi', lampiran1Kode: 'G' },
	{ value: 'properti', label: 'Properti', lampiran1Kode: 'H' },
	{ value: 'bank_syariah', label: 'Bank Syariah', lampiran1Kode: 'I' },
	{ value: 'infrastruktur', label: 'Infrastruktur', lampiran1Kode: 'J' },
	{ value: 'sekuritas', label: 'Sekuritas', lampiran1Kode: 'K' },
	{ value: 'pembiayaan', label: 'Pembiayaan', lampiran1Kode: 'L' }
] as const;

const opiniAuditorId = (kode: string) => `opini-auditor-${kode}`;
const sektorUsahaId = (kode: string) => `sektor-usaha-${kode}`;
const negaraId = (kode: string) => `negara-${kode}`;

const negaraOptions = readCsv(negaraCsvPath) as { kode: string; nama: string }[];

export const run = async ({ db }: SeedContext) => {
	await batchInsert(
		db,
		sektorUsahaOptions.map((row) =>
			db
				.insert(sektor_usaha_spt_pph_badan)
				.values({
					id: sektorUsahaId(row.value),
					kode: row.value,
					nama: row.label,
					lampiran1Kode: row.lampiran1Kode
				})
				.onConflictDoUpdate({
					target: sektor_usaha_spt_pph_badan.kode,
					set: {
						nama: row.label,
						lampiran1Kode: row.lampiran1Kode,
						aktif: true
					}
				})
		)
	);

	await batchInsert(
		db,
		auditorOptions.map((row) =>
			db
				.insert(opini_auditor_spt_pph_badan)
				.values({
					id: opiniAuditorId(row.value),
					kode: row.value,
					nama: row.label
				})
				.onConflictDoUpdate({
					target: opini_auditor_spt_pph_badan.kode,
					set: {
						nama: row.label,
						aktif: true
					}
				})
		)
	);

	await batchInsert(
		db,
		negaraOptions.map((row) =>
			db
				.insert(negara_spt_pph_badan)
				.values({
					id: negaraId(row.kode),
					kode: row.kode,
					nama: row.nama
				})
				.onConflictDoUpdate({
					target: negara_spt_pph_badan.kode,
					set: {
						nama: row.nama,
						aktif: true
					}
				})
		)
	);

	// Anguilla was in the original seed but isn't in Coretax's live
	// COUNTRY_CODE reference-data list (confirmed 2026-08-30 via
	// docs/coretax-api/fetch-reference-data.mjs --types COUNTRY_CODE) --
	// removed from negara.csv but deactivated here rather than deleted, to
	// preserve any existing FK reference (kode stays stable at
	// `negara-anguilla`; the CSV-driven upsert above only ever sets
	// aktif:true for rows still present in the CSV, so this needs its own
	// statement to actually take it out of circulation).
	await db
		.update(negara_spt_pph_badan)
		.set({ aktif: false })
		.where(eq(negara_spt_pph_badan.kode, 'anguilla'));

	console.log(`Seeded SPT PPh Badan references: ${auditorOptions.length} auditor opinions`);
	console.log(`Seeded SPT PPh Badan references: ${sektorUsahaOptions.length} business sectors`);
	console.log(`Seeded SPT PPh Badan references: ${negaraOptions.length} countries`);

	return [];
};
