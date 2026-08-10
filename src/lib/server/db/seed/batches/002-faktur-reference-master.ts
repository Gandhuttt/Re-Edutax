import { informasiTambahanKodeTransaksi7 } from '../data/faktur/informasi_tambahan_kode_transaksi_7';
import { informasiTambahanKodeTransaksi8 } from '../data/faktur/informasi_tambahan_kode_transaksi_8';
import { kodeItemTransaksiFaktur } from '../data/faktur/kode_item_transaksi_faktur';
import { kodeTransaksiFakturPajak } from '../data/faktur/kode_transaksi_faktur_pajak';
import { satuanUkurTransaksiFaktur } from '../data/faktur/satuan_ukur_transaksi_faktur';
import {
	jenis_informasi_tambahan_faktur_pajak,
	jenis_item_transaksi_faktur,
	kode_item_transaksi_faktur,
	kode_transaksi_faktur_pajak,
	satuan_ukur_transaksi_faktur
} from '../../schema';
import type { SeedContext } from '../context';
import { batchInsert } from '../helpers';

export const name = '002 faktur reference master data';

const jenisItemId = {
	Barang: 'jenis-item-barang',
	Jasa: 'jenis-item-jasa'
} as const;

const kodeTransaksiId = (kode: number) => `kode-transaksi-${kode}`;
const kodeItemId = (kode: string) => `kode-item-${kode.toLowerCase()}`;
const satuanUkurId = (kode: string) => `satuan-ukur-${kode}`;
const additionalInfoId = (kodeTransaksi: number, kode: number) =>
	`jenis-info-${kodeTransaksi}-${kode}`;

export const run = async ({ db }: SeedContext) => {
	await batchInsert(
		db,
		kodeTransaksiFakturPajak.map((row) =>
			db
				.insert(kode_transaksi_faktur_pajak)
				.values({
					id: kodeTransaksiId(row.code),
					kode: row.code,
					nama: row.label
				})
				.onConflictDoUpdate({
					target: kode_transaksi_faktur_pajak.id,
					set: {
						kode: row.code,
						nama: row.label,
						aktif: true
					}
				})
		)
	);

	await batchInsert(
		db,
		[
			{ id: jenisItemId.Barang, kode: 'barang', nama: 'Barang' },
			{ id: jenisItemId.Jasa, kode: 'jasa', nama: 'Jasa' }
		].map((row) =>
			db.insert(jenis_item_transaksi_faktur).values(row).onConflictDoUpdate({
				target: jenis_item_transaksi_faktur.id,
				set: {
					kode: row.kode,
					nama: row.nama,
					aktif: true
				}
			})
		)
	);

	await batchInsert(
		db,
		satuanUkurTransaksiFaktur.map((row) =>
			db
				.insert(satuan_ukur_transaksi_faktur)
				.values({
					id: satuanUkurId(row.index),
					jenisItemId: jenisItemId[row.tipe],
					kode: row.index,
					nama: row.label
				})
				.onConflictDoUpdate({
					target: satuan_ukur_transaksi_faktur.kode,
					set: {
						jenisItemId: jenisItemId[row.tipe],
						nama: row.label,
						aktif: true
					}
				})
		)
	);

	await batchInsert(
		db,
		kodeItemTransaksiFaktur.map((row) =>
			db
				.insert(kode_item_transaksi_faktur)
				.values({
					id: kodeItemId(row.kodeItem),
					jenisItemId: jenisItemId[row.tipe],
					kode: row.kodeItem,
					namaIndonesia: row.labelIndonesia,
					namaInggris: row.labelInggris
				})
				.onConflictDoUpdate({
					target: kode_item_transaksi_faktur.id,
					set: {
						jenisItemId: jenisItemId[row.tipe],
						kode: row.kodeItem,
						namaIndonesia: row.labelIndonesia,
						namaInggris: row.labelInggris,
						aktif: true
					}
				})
		)
	);

	const additionalInfoStatements = ([
		[7, informasiTambahanKodeTransaksi7],
		[8, informasiTambahanKodeTransaksi8]
	] as const).flatMap(([kodeTransaksi, metadata]) =>
		metadata.map((row) => {
			const values = {
				kodeTransaksiId: kodeTransaksiId(kodeTransaksi),
				subKodeTransaksiId: null,
				kode: row.kode,
				nama: row.informasiTambahan,
				capFasilitas: row.capFasilitas,
				butuhDokumenPendukung: row.requireDokumenPendukung,
				aktif: true
			};

			return db
				.insert(jenis_informasi_tambahan_faktur_pajak)
				.values({ id: additionalInfoId(kodeTransaksi, row.kode), ...values })
				.onConflictDoUpdate({
					target: jenis_informasi_tambahan_faktur_pajak.id,
					set: values
				});
		})
	);
	await batchInsert(db, additionalInfoStatements);

	console.log(
		`Seeded faktur references from old constants: ${kodeTransaksiFakturPajak.length} transaction codes, ${informasiTambahanKodeTransaksi7.length + informasiTambahanKodeTransaksi8.length} additional info rows, ${satuanUkurTransaksiFaktur.length} units, ${kodeItemTransaksiFaktur.length} item codes`
	);

	return [];
};
