import {
	fasilitas_pajak_ebupot,
	jenis_dokumen_ebupot,
	kode_objek_pajak_pph
} from '../../schema';
import type { SeedContext } from '../context';
import { batchInsert } from '../helpers';
import { fasilitasPajakEbupot } from '../data/ebupot/fasilitas_pajak_ebupot';
import { jenisDokumenEbupot } from '../data/ebupot/jenis_dokumen_ebupot';
import { kodeObjekPajakPph } from '../data/ebupot/kode_objek_pajak_pph';

export const name = '020 eBupot reference master data';

const kodeObjekPajakId = (jenisBuktiPotong: string, kode: string) =>
	`objek-pajak-pph-${jenisBuktiPotong}-${kode}`;
const jenisDokumenId = (kode: string) => `jenis-dokumen-ebupot-${kode}`;
const fasilitasPajakId = (kode: string) => `fasilitas-pajak-ebupot-${kode}`;

export const run = async ({ db }: SeedContext) => {
	await batchInsert(
		db,
		kodeObjekPajakPph.map((row) =>
			db
				.insert(kode_objek_pajak_pph)
				.values({
					id: kodeObjekPajakId(row.jenisBuktiPotong, row.kode),
					jenisBuktiPotong: row.jenisBuktiPotong,
					kodeReferensi: row.kodeReferensi,
					kode: row.kode,
					nama: row.nama,
					pasal: row.pasal,
					sifat: row.sifat,
					kap: row.kap,
					parameterData: row.parameterData
				})
				.onConflictDoUpdate({
					target: [kode_objek_pajak_pph.jenisBuktiPotong, kode_objek_pajak_pph.kode],
					set: {
						kodeReferensi: row.kodeReferensi,
						nama: row.nama,
						pasal: row.pasal,
						sifat: row.sifat,
						kap: row.kap,
						parameterData: row.parameterData,
						aktif: true
					}
				})
		)
	);
	console.log(`Seeded eBupot reference: ${kodeObjekPajakPph.length} kode objek pajak PPh`);

	await batchInsert(
		db,
		jenisDokumenEbupot.map((row) =>
			db
				.insert(jenis_dokumen_ebupot)
				.values({ id: jenisDokumenId(row.kode), kode: row.kode, nama: row.nama })
				.onConflictDoUpdate({
					target: jenis_dokumen_ebupot.kode,
					set: { nama: row.nama, aktif: true }
				})
		)
	);
	console.log(`Seeded eBupot reference: ${jenisDokumenEbupot.length} jenis dokumen`);

	await batchInsert(
		db,
		fasilitasPajakEbupot.map((row) =>
			db
				.insert(fasilitas_pajak_ebupot)
				.values({ id: fasilitasPajakId(row.kode), kode: row.kode, nama: row.nama })
				.onConflictDoUpdate({
					target: fasilitas_pajak_ebupot.kode,
					set: { nama: row.nama, aktif: true }
				})
		)
	);
	console.log(`Seeded eBupot reference: ${fasilitasPajakEbupot.length} fasilitas pajak`);

	return [];
};
