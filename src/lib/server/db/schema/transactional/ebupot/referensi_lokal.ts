import { index, integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';
import { ptkpEbupotValues } from '../../../../../helpers/ptkp-ebupot';
import { negara_spt_pph_badan } from '../../references/spt_pph_badan/negara';
import { wajib_pajak } from '../wajib_pajak/wajib_pajak';

// Local, account-scoped eBupot registries for BP21/BP26. These are EDUCATIONAL
// SIMULATION data managed by the logged-in account -- they are NOT verified
// against DJP/Coretax and must be labelled as such wherever surfaced.

export const jenisWpProfilPenerimaValues = ['orang_pribadi', 'badan', 'luar_negeri'] as const;
export type JenisWpProfilPenerima = (typeof jenisWpProfilPenerimaValues)[number];

export const fasilitasSertifikatLokalValues = ['4', '8', '10'] as const;
export type FasilitasSertifikatLokal = (typeof fasilitasSertifikatLokalValues)[number];

// Recipient identity master used in addition to wajib_pajak (controls WP type and PTKP).
export const ebupot_profil_penerima = sqliteTable(
	'ebupot_profil_penerima',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		npwpPemotong: text('npwp_pemotong')
			.notNull()
			.references(() => wajib_pajak.npwp),
		nomorIdentitasWp: text('nomor_identitas_wp').notNull(),
		nama: text('nama').notNull(),
		jenisWp: text('jenis_wp', { enum: jenisWpProfilPenerimaValues }).notNull(),
		statusPtkp: text('status_ptkp', { enum: ptkpEbupotValues })
	},
	(t) => [unique('ebupot_profil_penerima_owner_identitas_unique').on(t.npwpPemotong, t.nomorIdentitasWp)]
);

// Facility certificate (fasilitas 4/8/10) held by a recipient, scoped to owner + recipient + period.
export const ebupot_sertifikat_lokal = sqliteTable(
	'ebupot_sertifikat_lokal',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		npwpPemotong: text('npwp_pemotong')
			.notNull()
			.references(() => wajib_pajak.npwp),
		nomorIdentitasWp: text('nomor_identitas_wp').notNull(),
		fasilitasKode: text('fasilitas_kode', { enum: fasilitasSertifikatLokalValues }).notNull(),
		nomorSertifikat: text('nomor_sertifikat').notNull(),
		// ISO dates (YYYY-MM-DD), inclusive.
		berlakuDari: text('berlaku_dari').notNull(),
		berlakuSampai: text('berlaku_sampai').notNull(),
		aktif: integer('aktif', { mode: 'boolean' }).notNull().default(true)
	},
	(t) => [
		index('ebupot_sertifikat_lokal_lookup_idx').on(
			t.npwpPemotong,
			t.nomorIdentitasWp,
			t.fasilitasKode
		)
	]
);

// Local receipt (SIM-SKD-...) standing in for a Surat Keterangan Domisili lookup in BP26.
export const ebupot_receipt_skd_lokal = sqliteTable(
	'ebupot_receipt_skd_lokal',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		npwpPemotong: text('npwp_pemotong')
			.notNull()
			.references(() => wajib_pajak.npwp),
		nomorReceipt: text('nomor_receipt').notNull(),
		nomorIdentitasWp: text('nomor_identitas_wp').notNull(),
		nama: text('nama').notNull(),
		alamat: text('alamat').notNull(),
		negaraAsalId: text('negara_asal_id')
			.notNull()
			.references(() => negara_spt_pph_badan.id),
		berlakuDari: text('berlaku_dari').notNull(),
		berlakuSampai: text('berlaku_sampai').notNull(),
		aktif: integer('aktif', { mode: 'boolean' }).notNull().default(true)
	},
	(t) => [unique('ebupot_receipt_skd_lokal_owner_receipt_unique').on(t.npwpPemotong, t.nomorReceipt)]
);

// Per-owner simulation settings (one row per withholder).
export const ebupot_pengaturan_lokal = sqliteTable('ebupot_pengaturan_lokal', {
	npwpPemotong: text('npwp_pemotong')
		.primaryKey()
		.references(() => wajib_pajak.npwp),
	// Government instance: allows the future 3-month period exception in the local simulation.
	instansiPemerintah: integer('instansi_pemerintah', { mode: 'boolean' }).notNull().default(false)
});
