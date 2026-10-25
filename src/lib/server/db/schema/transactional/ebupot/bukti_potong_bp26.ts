import { index, integer, real, sqliteTable, text, type AnySQLiteColumn } from 'drizzle-orm/sqlite-core';
import { fasilitas_pajak_ebupot } from '../../references/ebupot/fasilitas_pajak_ebupot';
import { jenis_dokumen_ebupot } from '../../references/ebupot/jenis_dokumen_ebupot';
import { kode_objek_pajak_pph } from '../../references/ebupot/kode_objek_pajak_pph';
import { negara_spt_pph_badan } from '../../references/spt_pph_badan/negara';
import { wajib_pajak } from '../wajib_pajak/wajib_pajak';
import { bpStatusValues } from '../../../../../helpers/bp-parity';

// eBupot BP26 ("Bukti Pemotongan Wajib Pajak Luar Negeri") -- PPh Pasal 26
// withholding for non-resident recipients. See
// docs/ui-reference/coretax/ebupot/NOTES.md "BP26" for the live-verified
// form this mirrors, and bukti_potong_bpu.ts for the shared status-
// lifecycle / Terbitkan-simulation conventions this table reuses as-is.
//
// Unlike BPU/BP21, the recipient here is a non-resident: no NIK/NPWP, no
// DJP taxpayer-master lookup, no NITKU -- Nama is a plain typed field
// (confirmed live), and identity is instead captured via Alamat, Negara
// Asal (reusing the country reference already seeded for SPT PPh Badan --
// see negara.remote.ts), and optional Tanggal/Tempat Lahir, Nomor Paspor,
// Nomor KITAS/KITAP.
export const bukti_potong_bp26 = sqliteTable(
'bukti_potong_bp26',
{
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),

	npwpPemotong: text('npwp_pemotong')
		.notNull()
		.references(() => wajib_pajak.npwp),

	masaPajak: integer('masa_pajak')
		.notNull()
		.$defaultFn(() => new Date().getMonth() + 1),
	tahun: integer('tahun')
		.notNull()
		.$defaultFn(() => new Date().getFullYear()),
	status: text('status', { enum: bpStatusValues }).notNull().default('NORMAL'),

	nomorIdentitasWp: text('nomor_identitas_wp').notNull().default(''),
	nama: text('nama').notNull().default(''),
	alamat: text('alamat').notNull().default(''),
	negaraAsalId: text('negara_asal_id').references(() => negara_spt_pph_badan.id),
	tanggalLahir: text('tanggal_lahir'),
	tempatLahir: text('tempat_lahir').notNull().default(''),
	nomorPaspor: text('nomor_paspor').notNull().default(''),
	nomorKitasKitap: text('nomor_kitas_kitap').notNull().default(''),

	kodeObjekPajakId: text('kode_objek_pajak_id').references(() => kode_objek_pajak_pph.id),
	fasilitasPajakId: text('fasilitas_pajak_id').references(() => fasilitas_pajak_ebupot.id),

	penghasilanBruto: real('penghasilan_bruto').notNull().default(0),
	dpp: real('dpp').notNull().default(0),
	tarif: real('tarif').notNull().default(0),
	pajakPenghasilan: real('pajak_penghasilan').notNull().default(0),

	jenisDokumenId: text('jenis_dokumen_id').references(() => jenis_dokumen_ebupot.id),
	nomorDokumen: text('nomor_dokumen').notNull().default(''),
	tanggalDokumen: text('tanggal_dokumen'),

	nomorPemotongan: text('nomor_pemotongan'),
	// WithholdingDate (Tanggal Pemotongan), ISO date; distinct from the document date.
	tanggalPemotongan: text('tanggal_pemotongan'),
	diterbitkan: integer('diterbitkan', { mode: 'boolean' }).notNull().default(false),

	// Persisted NITKU (tempat_kegiatan_usaha.nitku) captured at save time.
	nitkuPemotong: text('nitku_pemotong'),
	receiptNumber: text('receipt_number'),
	// Amendment origin: the BP26 this row replaces (stays valid until this row is issued).
	pembetulanDariId: text('pembetulan_dari_id').references((): AnySQLiteColumn => bukti_potong_bp26.id, {
		onDelete: 'set null'
	}),
	pembetulanKe: integer('pembetulan_ke').notNull().default(0),
},
(t) => [
	index('bukti_potong_bp26_pembetulan_dari_idx').on(t.pembetulanDariId),
	index('bukti_potong_bp26_owner_idx').on(t.npwpPemotong, t.tahun, t.masaPajak),
	index('bukti_potong_bp26_receipt_idx').on(t.npwpPemotong, t.receiptNumber)
]
);
