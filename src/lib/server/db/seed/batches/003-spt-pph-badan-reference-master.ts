import { opini_auditor_spt_pph_badan } from '../../schema';
import type { SeedContext } from '../context';

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

const opiniAuditorId = (kode: string) => `opini-auditor-${kode}`;

export const run = async ({ db }: SeedContext) => {
	for (const row of auditorOptions) {
		await db
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
			});
	}

	console.log(`Seeded SPT PPh Badan references: ${auditorOptions.length} auditor opinions`);

	return [];
};
