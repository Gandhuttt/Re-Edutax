import { and, eq, isNull } from 'drizzle-orm';
import {
	faktur_pajak,
	informasi_tambahan_faktur_pajak,
	jenis_informasi_tambahan_faktur_pajak,
	satuan_ukur_transaksi_faktur,
	transaksi_faktur_pajak,
	wajib_pajak
} from '../../schema';
import type { SeedContext } from '../context';

export const name = '003 faktur demo rows';

export const run = async ({ db }: SeedContext) => {
	const buyer = {
		npwp: '0234567890123000',
		nama: 'PT Test Makmur',
		email: 'test@example.com'
	};
	const seller = {
		npwp: '0345678901234000',
		nama: 'CV Demo Jaya',
		email: 'demo@example.com'
	};

	for (const taxpayer of [buyer, seller]) {
		await db
			.insert(wajib_pajak)
			.values(taxpayer)
			.onConflictDoUpdate({
				target: wajib_pajak.npwp,
				set: taxpayer
			});
	}

	const [informasiKawasanBebas] = await db
		.select({ id: jenis_informasi_tambahan_faktur_pajak.id })
		.from(jenis_informasi_tambahan_faktur_pajak)
		.where(
			and(
				eq(jenis_informasi_tambahan_faktur_pajak.kodeTransaksiId, 'kode-transaksi-7'),
				isNull(jenis_informasi_tambahan_faktur_pajak.subKodeTransaksiId),
				eq(jenis_informasi_tambahan_faktur_pajak.kode, 1)
			)
		)
		.limit(1);
	const [satuanKegiatan] = await db
		.select({ id: satuan_ukur_transaksi_faktur.id })
		.from(satuan_ukur_transaksi_faktur)
		.where(eq(satuan_ukur_transaksi_faktur.kode, '001005'))
		.limit(1);
	const [satuanUnit] = await db
		.select({ id: satuan_ukur_transaksi_faktur.id })
		.from(satuan_ukur_transaksi_faktur)
		.where(eq(satuan_ukur_transaksi_faktur.kode, '000024'))
		.limit(1);

	if (!informasiKawasanBebas || !satuanKegiatan || !satuanUnit) {
		throw new Error('Faktur reference seed must run before faktur demo seed');
	}

	const fakturRows = [
		{
			id: 'faktur-draft-001',
			npwpPenjual: '0123456789012000',
			npwpPembeli: buyer.npwp,
			nomorFaktur: '',
			kodeTransaksiId: 'kode-transaksi-1',
			referensi: 'REF-DRAFT-001',
			alamat: 'Jl. Pendidikan No. 1',
			uangMuka: false,
			pelunasan: false,
			tanggalFaktur: '2026-07-16',
			masaPajak: 7,
			tahun: 2026,
			diupload: false,
			dikreditkan: false
		},
		{
			id: 'faktur-upload-002',
			npwpPenjual: '0123456789012000',
			npwpPembeli: buyer.npwp,
			nomorFaktur: '0000000000000002',
			kodeTransaksiId: 'kode-transaksi-7',
			referensi: 'REF-UPLOAD-002',
			alamat: 'Jl. Demo Raya No. 2',
			uangMuka: false,
			pelunasan: true,
			tanggalFaktur: '2026-07-12',
			masaPajak: 7,
			tahun: 2026,
			diupload: true,
			dikreditkan: false
		},
		{
			id: 'faktur-masukan-003',
			npwpPenjual: seller.npwp,
			npwpPembeli: '0123456789012000',
			nomorFaktur: '0000000000000003',
			kodeTransaksiId: 'kode-transaksi-4',
			referensi: 'REF-MASUKAN-003',
			alamat: 'Jl. Vendor No. 3',
			uangMuka: false,
			pelunasan: false,
			tanggalFaktur: '2026-07-08',
			masaPajak: 7,
			tahun: 2026,
			diupload: true,
			dikreditkan: false
		}
	];

	for (const row of fakturRows) {
		await db.insert(faktur_pajak).values(row).onConflictDoUpdate({
			target: faktur_pajak.id,
			set: row
		});
	}

	await db
		.insert(informasi_tambahan_faktur_pajak)
		.values({
			id: 'info-faktur-upload-002',
			fakturPajakId: 'faktur-upload-002',
			jenisInformasiTambahanId: informasiKawasanBebas.id,
			dokumenPendukung: 'MOCK-DOC-001'
		})
		.onConflictDoUpdate({
			target: informasi_tambahan_faktur_pajak.id,
			set: {
				fakturPajakId: 'faktur-upload-002',
				jenisInformasiTambahanId: informasiKawasanBebas.id,
				dokumenPendukung: 'MOCK-DOC-001'
			}
		});

	await db
		.delete(transaksi_faktur_pajak)
		.where(eq(transaksi_faktur_pajak.fakturPajakId, 'faktur-draft-001'));
	await db
		.delete(transaksi_faktur_pajak)
		.where(eq(transaksi_faktur_pajak.fakturPajakId, 'faktur-upload-002'));
	await db
		.delete(transaksi_faktur_pajak)
		.where(eq(transaksi_faktur_pajak.fakturPajakId, 'faktur-masukan-003'));

	await db.insert(transaksi_faktur_pajak).values([
		{
			id: 'transaksi-draft-001',
			fakturPajakId: 'faktur-draft-001',
			nama: 'Jasa pelatihan pajak',
			kodeItemId: 'kode-item-b000000',
			satuanUkurId: satuanKegiatan.id,
			kuantitas: 1,
			hargaSatuan: 1250000,
			hargaPotongan: 0,
			dppNilaiLain: 0,
			tarifPpn: 12,
			tarifPpnBm: 0
		},
		{
			id: 'transaksi-upload-002',
			fakturPajakId: 'faktur-upload-002',
			nama: 'Peralatan kantor',
			kodeItemId: 'kode-item-a000000',
			satuanUkurId: satuanUnit.id,
			kuantitas: 2,
			hargaSatuan: 700000,
			hargaPotongan: 50000,
			dppNilaiLain: 0,
			tarifPpn: 12,
			tarifPpnBm: 0
		},
		{
			id: 'transaksi-masukan-003',
			fakturPajakId: 'faktur-masukan-003',
			nama: 'Peralatan kantor',
			kodeItemId: 'kode-item-a000000',
			satuanUkurId: satuanUnit.id,
			kuantitas: 2,
			hargaSatuan: 700000,
			hargaPotongan: 50000,
			dppNilaiLain: 0,
			tarifPpn: 12,
			tarifPpnBm: 0
		}
	]);

	console.log('Seeded faktur demo rows');

	return [];
};
