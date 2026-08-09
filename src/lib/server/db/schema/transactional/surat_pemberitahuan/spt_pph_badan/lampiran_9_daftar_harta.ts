import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { jenis_harta_spt_pph_badan } from '../../../references/spt_pph_badan/jenis_harta';
import { spt_pph_badan } from './spt_pph_badan';

export const spt_pph_badan_lampiran_9_harta = sqliteTable('spt_pph_badan_lampiran_9_harta', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	sptPphBadanId: text('spt_pph_badan_id')
		.notNull()
		.references(() => spt_pph_badan.id, { onDelete: 'cascade' }),
	nomorUrut: integer('nomor_urut').notNull(),
	jenisHartaId: text('jenis_harta_id')
		.notNull()
		.references(() => jenis_harta_spt_pph_badan.id),
	kelompokPenyusutan: text('kelompok_penyusutan', {
		enum: [
			'kelompok_1',
			'kelompok_2',
			'kelompok_3',
			'kelompok_4',
			'kelompok_lainnya',
			'permanen',
			'tidak_permanen'
		]
	}).notNull(),
	kodeHarta: text('kode_harta').notNull(),
	bulanTahunPerolehan: text('bulan_tahun_perolehan').notNull(),
	hargaPerolehan: integer('harga_perolehan').notNull().default(0),
	nilaiSisaBukuFiskalAwalTahun: integer('nilai_sisa_buku_fiskal_awal_tahun')
		.notNull()
		.default(0),
	metodePenyusutanKomersial: text('metode_penyusutan_komersial').notNull().default(''),
	metodePenyusutanFiskal: text('metode_penyusutan_fiskal').notNull().default(''),
	penyusutanAmortisasiFiskalTahunIni: integer('penyusutan_amortisasi_fiskal_tahun_ini')
		.notNull()
		.default(0),
	penyusutanAmortisasiKomersialTahunIni: integer('penyusutan_amortisasi_komersial_tahun_ini')
		.notNull()
		.default(0),
	akumulasiPenyusutanAmortisasiFiskal: integer('akumulasi_penyusutan_amortisasi_fiskal')
		.notNull()
		.default(0),
	nilaiSisaBukuFiskalAkhirTahun: integer('nilai_sisa_buku_fiskal_akhir_tahun')
		.notNull()
		.default(0),
	keterangan: text('keterangan').notNull().default('')
});
