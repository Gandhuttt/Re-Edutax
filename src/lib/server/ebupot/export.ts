import { db } from '$lib/server/db';
import {
	bukti_potong_bp21,
	bukti_potong_bp26,
	bukti_potong_bpa1,
	bukti_potong_bpa2,
	bukti_potong_mp,
	fasilitas_pajak_ebupot,
	jenis_dokumen_ebupot,
	kode_objek_pajak_pph,
	negara_spt_pph_badan
} from '$lib/server/db/schema';
import type { BpaKind, BpLifecycleKind } from '$lib/helpers/bp-parity';
import { and, desc, eq, inArray, ne } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';
import * as XLSX from 'xlsx';

export type BpExportKind = 'bp21' | 'bp26';
export type BpExportFormat = 'csv' | 'xlsx' | 'print';

export const SIM_LABEL = 'SIMULASI PENDIDIKAN—BUKAN DOKUMEN RESMI DJP';
// D1 allows at most 100 bound parameters per statement (ids + owner + status).
export const MAX_EXPORT_IDS = 50;
export const MAX_EXPORT_ROWS = 5000;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class ExportError extends Error {
	constructor(
		public status: number,
		message: string
	) {
		super(message);
	}
}

// Parses ?ids=a,b,c. Returns null when absent (= all owned rows). Any malformed
// token rejects the whole request rather than silently dropping entries.
export const parseExportIds = (raw: string | null): string[] | null => {
	if (raw === null) return null;
	const parts = raw.split(',').map((s) => s.trim());
	if (parts.length === 0 || parts.some((p) => !UUID.test(p))) {
		throw new ExportError(400, 'Parameter ids harus berupa daftar UUID dipisah koma');
	}
	const unique = [...new Set(parts.map((p) => p.toLowerCase()))];
	if (unique.length > MAX_EXPORT_IDS) {
		throw new ExportError(400, `Maksimal ${MAX_EXPORT_IDS} ID per ekspor`);
	}
	return unique;
};

export type ExportRow = {
	id: string;
	jenis: BpExportKind;
	status: string;
	diterbitkan: boolean;
	nomorPemotongan: string | null;
	tahun: number;
	masaPajak: number;
	pembetulanKe: number;
	pembetulanDariNomor: string | null;
	pembetulanDariId: string | null;
	npwpPemotong: string;
	nitkuPemotong: string | null;
	nitkuPenerima: string | null;
	nomorIdentitasWp: string;
	nama: string;
	statusPtkp: string | null;
	alamat: string | null;
	negara: string | null;
	tanggalLahir: string | null;
	tempatLahir: string | null;
	nomorPaspor: string | null;
	nomorKitasKitap: string | null;
	receiptNumber: string | null;
	kodeObjek: string | null;
	namaObjek: string | null;
	fasilitasKode: string | null;
	fasilitasNama: string | null;
	pendapatanBrutoSebelumnya: number | null;
	bruto: number;
	dpp: number;
	tarif: number;
	pajak: number;
	jenisDokumen: string | null;
	nomorDokumen: string;
	tanggalDokumen: string | null;
	tanggalPemotongan: string | null;
};

const checkComplete = (rows: { id: string }[], ids: string[] | null) => {
	if (ids) {
		const found = new Set(rows.map((r) => r.id.toLowerCase()));
		if (ids.some((id) => !found.has(id))) {
			throw new ExportError(
				404,
				'Satu atau lebih ID tidak ditemukan, bukan milik akun ini, atau sudah dihapus. Tidak ada data diekspor.'
			);
		}
	}
	if (rows.length === 0) {
		throw new ExportError(404, 'Tidak ada bukti potong aktif untuk diekspor');
	}
	if (rows.length > MAX_EXPORT_ROWS) {
		throw new ExportError(
			413,
			`Jumlah baris melebihi ${MAX_EXPORT_ROWS}. Pilih ID tertentu atau kurangi data.`
		);
	}
};

// Read-only: owner-scoped, excludes DELETED, explicit ids must ALL match.
const loadExportRows = async (
	owner: string,
	jenis: BpExportKind,
	ids: string[] | null
): Promise<ExportRow[]> => {
	if (jenis === 'bp21') {
		const t = bukti_potong_bp21;
		const sumber = alias(bukti_potong_bp21, 'sumber');
		const rows = await db
			.select({
				id: t.id,
				status: t.status,
				diterbitkan: t.diterbitkan,
				nomorPemotongan: t.nomorPemotongan,
				tahun: t.tahun,
				masaPajak: t.masaPajak,
				pembetulanKe: t.pembetulanKe,
				pembetulanDariId: t.pembetulanDariId,
				pembetulanDariNomor: sumber.nomorPemotongan,
				npwpPemotong: t.npwpPemotong,
				nitkuPemotong: t.nitkuPemotong,
				nitkuPenerima: t.nitkuPenerima,
				nomorIdentitasWp: t.nomorIdentitasWp,
				nama: t.namaPenerima,
				statusPtkp: t.statusPtkp,
				kodeObjek: kode_objek_pajak_pph.kode,
				namaObjek: kode_objek_pajak_pph.nama,
				fasilitasKode: fasilitas_pajak_ebupot.kode,
				fasilitasNama: fasilitas_pajak_ebupot.nama,
				pendapatanBrutoSebelumnya: t.pendapatanBrutoSebelumnya,
				bruto: t.penghasilanBruto,
				dpp: t.dpp,
				tarif: t.tarif,
				pajak: t.pajakPenghasilan,
				jenisDokumen: jenis_dokumen_ebupot.nama,
				nomorDokumen: t.nomorDokumen,
				tanggalDokumen: t.tanggalDokumen,
				tanggalPemotongan: t.tanggalPemotongan
			})
			.from(t)
			.leftJoin(sumber, eq(t.pembetulanDariId, sumber.id))
			.leftJoin(kode_objek_pajak_pph, eq(t.kodeObjekPajakId, kode_objek_pajak_pph.id))
			.leftJoin(fasilitas_pajak_ebupot, eq(t.fasilitasPajakId, fasilitas_pajak_ebupot.id))
			.leftJoin(jenis_dokumen_ebupot, eq(t.jenisDokumenId, jenis_dokumen_ebupot.id))
			.where(
				and(
					eq(t.npwpPemotong, owner),
					ne(t.status, 'DELETED'),
					ids ? inArray(t.id, ids) : undefined
				)
			)
			.orderBy(desc(t.tahun), desc(t.masaPajak), t.namaPenerima, t.id)
			.limit(MAX_EXPORT_ROWS + 1);
		checkComplete(rows, ids);
		return rows.map((r) => ({
			...r,
			jenis,
			alamat: null,
			negara: null,
			tanggalLahir: null,
			tempatLahir: null,
			nomorPaspor: null,
			nomorKitasKitap: null,
			receiptNumber: null
		}));
	}

	const t = bukti_potong_bp26;
	const sumber = alias(bukti_potong_bp26, 'sumber');
	const rows = await db
		.select({
			id: t.id,
			status: t.status,
			diterbitkan: t.diterbitkan,
			nomorPemotongan: t.nomorPemotongan,
			tahun: t.tahun,
			masaPajak: t.masaPajak,
			pembetulanKe: t.pembetulanKe,
			pembetulanDariId: t.pembetulanDariId,
			pembetulanDariNomor: sumber.nomorPemotongan,
			npwpPemotong: t.npwpPemotong,
			nitkuPemotong: t.nitkuPemotong,
			nomorIdentitasWp: t.nomorIdentitasWp,
			nama: t.nama,
			alamat: t.alamat,
			negara: negara_spt_pph_badan.nama,
			tanggalLahir: t.tanggalLahir,
			tempatLahir: t.tempatLahir,
			nomorPaspor: t.nomorPaspor,
			nomorKitasKitap: t.nomorKitasKitap,
			receiptNumber: t.receiptNumber,
			kodeObjek: kode_objek_pajak_pph.kode,
			namaObjek: kode_objek_pajak_pph.nama,
			fasilitasKode: fasilitas_pajak_ebupot.kode,
			fasilitasNama: fasilitas_pajak_ebupot.nama,
			bruto: t.penghasilanBruto,
			dpp: t.dpp,
			tarif: t.tarif,
			pajak: t.pajakPenghasilan,
			jenisDokumen: jenis_dokumen_ebupot.nama,
			nomorDokumen: t.nomorDokumen,
			tanggalDokumen: t.tanggalDokumen,
			tanggalPemotongan: t.tanggalPemotongan
		})
		.from(t)
		.leftJoin(sumber, eq(t.pembetulanDariId, sumber.id))
		.leftJoin(negara_spt_pph_badan, eq(t.negaraAsalId, negara_spt_pph_badan.id))
		.leftJoin(kode_objek_pajak_pph, eq(t.kodeObjekPajakId, kode_objek_pajak_pph.id))
		.leftJoin(fasilitas_pajak_ebupot, eq(t.fasilitasPajakId, fasilitas_pajak_ebupot.id))
		.leftJoin(jenis_dokumen_ebupot, eq(t.jenisDokumenId, jenis_dokumen_ebupot.id))
		.where(
			and(
				eq(t.npwpPemotong, owner),
				ne(t.status, 'DELETED'),
				ids ? inArray(t.id, ids) : undefined
			)
		)
		.orderBy(desc(t.tahun), desc(t.masaPajak), t.nama, t.id)
		.limit(MAX_EXPORT_ROWS + 1);
	checkComplete(rows, ids);
	return rows.map((r) => ({
		...r,
		jenis,
		nitkuPenerima: null,
		statusPtkp: null,
		pendapatanBrutoSebelumnya: null
	}));
};

// BPA1/BPA2 rows: the full Penghasilan Bruto -> PPh Pasal 21 build-up of the form.
type BpaExportRow = {
	id: string;
	status: string;
	diterbitkan: boolean;
	nomorPemotongan: string | null;
	masaPajakAwal: number;
	tahunAwal: number;
	masaPajakAkhir: number;
	tahunAkhir: number;
	pembetulanKe: number;
	pembetulanDariId: string | null;
	pembetulanDariNomor: string | null;
	npwpPemotong: string;
	nomorIdentitasWp: string;
	nama: string;
	statusPtkp: string | null;
	jenisPemotongan: string | null;
	jumlahBulan: number | null;
	kodeObjek: string | null;
	namaObjek: string | null;
	penghasilanBruto: number;
	biayaJabatan: number;
	iuranPensiun: number;
	zakat: number;
	penghasilanNeto: number;
	penghasilanNetoSebelumnya: number;
	penghasilanTidakKenaPajak: number;
	penghasilanKenaPajak: number;
	pphPasal21Terutang: number;
	pphPasal21DipotongSebelumnya: number;
	pphPasal21TerutangPadaIni: number;
	/** BPA1: Dipotong/Ditanggung Pemerintah; BPA2: yang Telah Dipotong. */
	pphPasal21Dipotong: number;
	pphKurangLebih: number;
};

const loadBpaExportRows = async (owner: string, jenis: BpaKind, ids: string[] | null): Promise<BpaExportRow[]> => {
	const t = jenis === 'bpa1' ? bukti_potong_bpa1 : bukti_potong_bpa2;
	const sumber = alias(t, 'sumber');
	const rows = await db
		.select({
			id: t.id,
			status: t.status,
			diterbitkan: t.diterbitkan,
			nomorPemotongan: t.nomorPemotongan,
			masaPajakAwal: t.masaPajakAwal,
			tahunAwal: t.tahunAwal,
			masaPajakAkhir: t.masaPajakAkhir,
			tahunAkhir: t.tahunAkhir,
			pembetulanKe: t.pembetulanKe,
			pembetulanDariId: t.pembetulanDariId,
			pembetulanDariNomor: sumber.nomorPemotongan,
			npwpPemotong: t.npwpPemotong,
			nomorIdentitasWp: t.nomorIdentitasWp,
			nama: t.nama,
			statusPtkp: t.statusPtkp,
			jenisPemotongan: t.jenisPemotongan,
			jumlahBulan: t.jumlahBulan,
			kodeObjek: kode_objek_pajak_pph.kode,
			namaObjek: kode_objek_pajak_pph.nama,
			penghasilanBruto: t.penghasilanBruto,
			biayaJabatan: t.biayaJabatan,
			iuranPensiun: t.iuranPensiun,
			zakat: t.zakat,
			penghasilanNeto: t.penghasilanNeto,
			penghasilanNetoSebelumnya: t.penghasilanNetoSebelumnya,
			penghasilanTidakKenaPajak: t.penghasilanTidakKenaPajak,
			penghasilanKenaPajak: t.penghasilanKenaPajak,
			pphPasal21Terutang: t.pphPasal21Terutang,
			pphPasal21DipotongSebelumnya: t.pphPasal21DipotongSebelumnya,
			pphPasal21TerutangPadaIni: t.pphPasal21TerutangPadaIni,
			pphPasal21Dipotong: jenis === 'bpa1' ? bukti_potong_bpa1.pphDipotongDitanggungPemerintah : bukti_potong_bpa2.pphPasal21YangTelahDipotong,
			pphKurangLebih: t.pphKurangLebihDipotongDesember
		})
		.from(t)
		.leftJoin(sumber, eq(t.pembetulanDariId, sumber.id))
		.leftJoin(kode_objek_pajak_pph, eq(t.kodeObjekPajakId, kode_objek_pajak_pph.id))
		.where(and(eq(t.npwpPemotong, owner), ne(t.status, 'DELETED'), ids ? inArray(t.id, ids) : undefined))
		.orderBy(desc(t.tahunAkhir), desc(t.masaPajakAkhir), t.nama, t.id)
		.limit(MAX_EXPORT_ROWS + 1);
	checkComplete(rows, ids);
	return rows;
};

// MP rows: monthly TER slip (single masa pajak).
type MpExportRow = {
	id: string;
	status: string;
	diterbitkan: boolean;
	nomorPemotongan: string | null;
	masaPajak: number;
	tahun: number;
	pembetulanKe: number;
	pembetulanDariId: string | null;
	pembetulanDariNomor: string | null;
	npwpPemotong: string;
	nitkuPemotong: string | null;
	nomorIdentitasWp: string;
	nama: string;
	pegawaiAsing: boolean;
	nomorPaspor: string;
	statusPtkp: string | null;
	jabatan: string;
	kodeObjek: string | null;
	namaObjek: string | null;
	fasilitasKode: string | null;
	fasilitasNama: string | null;
	penghasilanBruto: number;
	tarif: number;
	pajak: number;
	tanggalPemotongan: string | null;
};

const loadMpExportRows = async (owner: string, ids: string[] | null): Promise<MpExportRow[]> => {
	const t = bukti_potong_mp;
	const sumber = alias(t, 'sumber');
	const rows = await db
		.select({
			id: t.id,
			status: t.status,
			diterbitkan: t.diterbitkan,
			nomorPemotongan: t.nomorPemotongan,
			masaPajak: t.masaPajak,
			tahun: t.tahun,
			pembetulanKe: t.pembetulanKe,
			pembetulanDariId: t.pembetulanDariId,
			pembetulanDariNomor: sumber.nomorPemotongan,
			npwpPemotong: t.npwpPemotong,
			nitkuPemotong: t.nitkuPemotong,
			nomorIdentitasWp: t.nomorIdentitasWp,
			nama: t.nama,
			pegawaiAsing: t.pegawaiAsing,
			nomorPaspor: t.nomorPaspor,
			statusPtkp: t.statusPtkp,
			jabatan: t.jabatan,
			kodeObjek: kode_objek_pajak_pph.kode,
			namaObjek: kode_objek_pajak_pph.nama,
			fasilitasKode: fasilitas_pajak_ebupot.kode,
			fasilitasNama: fasilitas_pajak_ebupot.nama,
			penghasilanBruto: t.penghasilanBruto,
			tarif: t.tarif,
			pajak: t.pajakPenghasilanDipotong,
			tanggalPemotongan: t.tanggalPemotongan
		})
		.from(t)
		.leftJoin(sumber, eq(t.pembetulanDariId, sumber.id))
		.leftJoin(kode_objek_pajak_pph, eq(t.kodeObjekPajakId, kode_objek_pajak_pph.id))
		.leftJoin(fasilitas_pajak_ebupot, eq(t.fasilitasPajakId, fasilitas_pajak_ebupot.id))
		.where(and(eq(t.npwpPemotong, owner), ne(t.status, 'DELETED'), ids ? inArray(t.id, ids) : undefined))
		.orderBy(desc(t.tahun), desc(t.masaPajak), t.nama, t.id)
		.limit(MAX_EXPORT_ROWS + 1);
	checkComplete(rows, ids);
	return rows;
};

type Cell = string | number | null;
type Column<R = ExportRow> = { header: string; get: (r: R) => Cell; kinds?: BpLifecycleKind[] };

const asal = (r: { pembetulanKe: number; pembetulanDariId: string | null }) =>
	r.pembetulanKe > 0 || r.pembetulanDariId ? 'Pembetulan' : 'Normal';

const jenisPemotonganLabel: Record<string, string> = {
	KURANG_SETAHUN: 'Kurang dari Setahun',
	KURANG_SETAHUN_DISETAHUNKAN: 'Kurang dari setahun yang penghasilannya disetahunkan',
	SETAHUN_PENUH: 'Setahun Penuh'
};


const MP_COLUMNS: Column<MpExportRow>[] = [
	{ header: 'Jenis', get: () => 'MP' },
	{ header: 'Status', get: (r) => r.status },
	{ header: 'Diterbitkan (Simulasi)', get: (r) => (r.diterbitkan ? 'Ya' : 'Belum') },
	{ header: 'Nomor Bukti Potong (Simulasi)', get: (r) => r.nomorPemotongan },
	{ header: 'Tahun', get: (r) => r.tahun },
	{ header: 'Masa Pajak', get: (r) => r.masaPajak },
	{ header: 'Asal', get: asal },
	{ header: 'Pembetulan Ke', get: (r) => r.pembetulanKe },
	{ header: 'Pembetulan Dari Nomor', get: (r) => r.pembetulanDariNomor },
	{ header: 'NPWP Pemotong', get: (r) => r.npwpPemotong },
	{ header: 'NITKU Pemotong', get: (r) => r.nitkuPemotong },
	{ header: 'Nomor Identitas Penerima', get: (r) => r.nomorIdentitasWp },
	{ header: 'Nama Penerima', get: (r) => r.nama },
	{ header: 'Pegawai Asing', get: (r) => (r.pegawaiAsing ? 'Ya' : 'Tidak') },
	{ header: 'Nomor Paspor', get: (r) => r.nomorPaspor || null },
	{ header: 'Status PTKP', get: (r) => (r.statusPtkp ? `${r.statusPtkp.slice(0, -1)}/${r.statusPtkp.slice(-1)}` : null) },
	{ header: 'Jabatan', get: (r) => r.jabatan },
	{ header: 'Kode Objek Pajak', get: (r) => r.kodeObjek },
	{ header: 'Nama Objek Pajak', get: (r) => r.namaObjek },
	{ header: 'Kode Fasilitas', get: (r) => r.fasilitasKode },
	{ header: 'Fasilitas Pajak', get: (r) => r.fasilitasNama },
	{ header: 'Penghasilan Bruto', get: (r) => r.penghasilanBruto },
	{ header: 'Tarif (%)', get: (r) => r.tarif },
	{ header: 'PPh Dipotong', get: (r) => r.pajak },
	{ header: 'Tanggal Pemotongan', get: (r) => r.tanggalPemotongan },
	{ header: 'Keterangan', get: () => SIM_LABEL }
];

const BPA_COLUMNS: Column<BpaExportRow>[] = [
	{ header: 'Status', get: (r) => r.status },
	{ header: 'Diterbitkan (Simulasi)', get: (r) => (r.diterbitkan ? 'Ya' : 'Belum') },
	{ header: 'Nomor Bukti Potong (Simulasi)', get: (r) => r.nomorPemotongan },
	{ header: 'Masa Pajak Awal', get: (r) => `${String(r.masaPajakAwal).padStart(2, '0')}-${r.tahunAwal}` },
	{ header: 'Masa Pajak Akhir', get: (r) => `${String(r.masaPajakAkhir).padStart(2, '0')}-${r.tahunAkhir}` },
	{ header: 'Asal', get: asal },
	{ header: 'Pembetulan Ke', get: (r) => r.pembetulanKe },
	{ header: 'Pembetulan Dari Nomor', get: (r) => r.pembetulanDariNomor },
	{ header: 'NPWP Pemotong', get: (r) => r.npwpPemotong },
	{ header: 'Nomor Identitas Penerima', get: (r) => r.nomorIdentitasWp },
	{ header: 'Nama Penerima', get: (r) => r.nama },
	{ header: 'Status PTKP', get: (r) => (r.statusPtkp ? `${r.statusPtkp.slice(0, -1)}/${r.statusPtkp.slice(-1)}` : null) },
	{ header: 'Jenis Pemotongan', get: (r) => (r.jenisPemotongan ? jenisPemotonganLabel[r.jenisPemotongan] : null) },
	{ header: 'Number Of Months', get: (r) => r.jumlahBulan },
	{ header: 'Kode Objek Pajak', get: (r) => r.kodeObjek },
	{ header: 'Nama Objek Pajak', get: (r) => r.namaObjek },
	{ header: 'Penghasilan Bruto', get: (r) => r.penghasilanBruto },
	{ header: 'Biaya Jabatan / Biaya Pensiun', get: (r) => r.biayaJabatan },
	{ header: 'Iuran Pensiun', get: (r) => r.iuranPensiun },
	{ header: 'Zakat', get: (r) => r.zakat },
	{ header: 'Penghasilan Neto', get: (r) => r.penghasilanNeto },
	{ header: 'Penghasilan Neto Sebelumnya', get: (r) => r.penghasilanNetoSebelumnya },
	{ header: 'Penghasilan Tidak Kena Pajak', get: (r) => r.penghasilanTidakKenaPajak },
	{ header: 'Penghasilan Kena Pajak', get: (r) => r.penghasilanKenaPajak },
	{ header: 'PPh Pasal 21 Terutang', get: (r) => r.pphPasal21Terutang },
	{ header: 'PPh Pasal 21 Dipotong Sebelumnya', get: (r) => r.pphPasal21DipotongSebelumnya },
	{ header: 'PPh Pasal 21 Terutang pada Bukti Ini', get: (r) => r.pphPasal21TerutangPadaIni },
	{ header: 'PPh Pasal 21 Dipotong/Ditanggung Pemerintah', get: (r) => r.pphPasal21Dipotong },
	{ header: 'PPh Pasal 21 Kurang (Lebih) Dipotong', get: (r) => r.pphKurangLebih },
	{ header: 'Keterangan', get: () => SIM_LABEL }
];

const COLUMNS: Column[] = [
	{ header: 'Jenis', get: (r) => r.jenis.toUpperCase() },
	{ header: 'Status', get: (r) => r.status },
	{ header: 'Diterbitkan (Simulasi)', get: (r) => (r.diterbitkan ? 'Ya' : 'Belum') },
	{ header: 'Nomor Bukti Potong (Simulasi)', get: (r) => r.nomorPemotongan },
	{ header: 'Tahun', get: (r) => r.tahun },
	{ header: 'Masa Pajak', get: (r) => r.masaPajak },
	{ header: 'Asal', get: asal },
	{ header: 'Pembetulan Ke', get: (r) => r.pembetulanKe },
	{ header: 'Pembetulan Dari Nomor', get: (r) => r.pembetulanDariNomor },
	{ header: 'NPWP Pemotong', get: (r) => r.npwpPemotong },
	{ header: 'NITKU Pemotong', get: (r) => r.nitkuPemotong },
	{ header: 'Nomor Identitas Penerima', get: (r) => r.nomorIdentitasWp },
	{ header: 'Nama Penerima', get: (r) => r.nama },
	{ header: 'NITKU Penerima', get: (r) => r.nitkuPenerima, kinds: ['bp21'] },
	{ header: 'Status PTKP', get: (r) => r.statusPtkp, kinds: ['bp21'] },
	{ header: 'Alamat', get: (r) => r.alamat, kinds: ['bp26'] },
	{ header: 'Negara Asal', get: (r) => r.negara, kinds: ['bp26'] },
	{ header: 'Tanggal Lahir', get: (r) => r.tanggalLahir, kinds: ['bp26'] },
	{ header: 'Tempat Lahir', get: (r) => r.tempatLahir, kinds: ['bp26'] },
	{ header: 'Nomor Paspor', get: (r) => r.nomorPaspor, kinds: ['bp26'] },
	{ header: 'Nomor KITAS/KITAP', get: (r) => r.nomorKitasKitap, kinds: ['bp26'] },
	{ header: 'Nomor Receipt SKD (Simulasi)', get: (r) => r.receiptNumber, kinds: ['bp26'] },
	{ header: 'Kode Objek Pajak', get: (r) => r.kodeObjek },
	{ header: 'Nama Objek Pajak', get: (r) => r.namaObjek },
	{ header: 'Kode Fasilitas', get: (r) => r.fasilitasKode },
	{ header: 'Fasilitas Pajak', get: (r) => r.fasilitasNama },
	{
		header: 'Pendapatan Bruto Sebelumnya',
		get: (r) => r.pendapatanBrutoSebelumnya,
		kinds: ['bp21']
	},
	{ header: 'Penghasilan Bruto', get: (r) => r.bruto },
	{ header: 'DPP (%)', get: (r) => r.dpp },
	{ header: 'Tarif (%)', get: (r) => r.tarif },
	{ header: 'PPh Dipotong', get: (r) => r.pajak },
	{ header: 'Jenis Dokumen', get: (r) => r.jenisDokumen },
	{ header: 'Nomor Dokumen', get: (r) => r.nomorDokumen },
	{ header: 'Tanggal Dokumen', get: (r) => r.tanggalDokumen },
	{ header: 'Tanggal Pemotongan', get: (r) => r.tanggalPemotongan },
	{ header: 'Keterangan', get: () => SIM_LABEL }
];

const columnsFor = (jenis: BpExportKind) =>
	COLUMNS.filter((c) => !c.kinds || c.kinds.includes(jenis));

export type ExportTable = { columns: string[]; rows: Cell[][] };

const tabulate = <R>(rows: R[], cols: Column<R>[]): ExportTable => ({
	columns: cols.map((c) => c.header),
	rows: rows.map((r) => cols.map((c) => c.get(r)))
});

/** Owner-scoped export table for any list kind (BP21/BP26 slips or BPA1/BPA2 recaps). */
export const loadExportTable = async (
	owner: string,
	jenis: BpLifecycleKind,
	ids: string[] | null
): Promise<ExportTable> =>
	jenis === 'bp21' || jenis === 'bp26'
		? tabulate(await loadExportRows(owner, jenis, ids), columnsFor(jenis))
		: jenis === 'mp'
			? tabulate(await loadMpExportRows(owner, ids), MP_COLUMNS)
			: tabulate(await loadBpaExportRows(owner, jenis, ids), BPA_COLUMNS);

// Neutralises spreadsheet formula injection: if the first character that is not
// whitespace/control/invisible is = + - @, prefix an apostrophe.
// eslint-disable-next-line no-control-regex
const LEADING_INVISIBLE = /^[\u0000-\u0020\u007f-\u00a0\u00ad\u061c\u180e\u200b-\u200f\u2028-\u202e\u2060-\u206f\ufeff]*/;
export const safeText = (value: string): string => {
	const rest = value.slice(LEADING_INVISIBLE.exec(value)?.[0].length ?? 0);
	return rest !== '' && '=+-@'.includes(rest[0]) ? `'${value}` : value;
};

const csvCell = (c: Cell): string => {
	if (c === null) return '';
	if (typeof c === 'number') return Number.isFinite(c) ? String(c) : '';
	return `"${safeText(c).replace(/"/g, '""')}"`;
};

export const buildCsv = (table: ExportTable): string => {
	const lines = [table.columns.map(csvCell).join(',')];
	for (const row of table.rows) lines.push(row.map(csvCell).join(','));
	return '\uFEFF' + lines.join('\r\n') + '\r\n';
};

export const buildXlsx = async (table: ExportTable, jenis: BpLifecycleKind): Promise<Uint8Array<ArrayBuffer>> => {
	// Workbook generation stays server-side.
	const title = `${jenis.toUpperCase()} SIMULASI`;
	const aoa: (string | number | null)[][] = [
		[SIM_LABEL],
		[],
		table.columns,
		...table.rows.map((row) => row.map((v) => (typeof v === 'string' ? safeText(v) : v)))
	];
	const ws = XLSX.utils.aoa_to_sheet(aoa);
	ws['!cols'] = table.columns.map((header) => ({ wch: Math.max(12, Math.min(40, header.length + 2)) }));
	const wb = XLSX.utils.book_new();
	wb.Props = { Title: `${title} - bukan dokumen resmi DJP` };
	XLSX.utils.book_append_sheet(wb, ws, title);
	return new Uint8Array(XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer);
};

export const escapeHtml = (value: string): string =>
	value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');

const NUM = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 });

const displayCell = (header: string, v: Cell): string => {
	if (v === null || v === '') return '-';
	if (typeof v === 'number') {
		return /^(Penghasilan|PPh|Pendapatan)/.test(header) ? `Rp ${NUM.format(v)}` : NUM.format(v);
	}
	return v;
};

export const buildPrintHtml = (table: ExportTable, jenis: BpLifecycleKind, nonce: string): string => {
	const keep = table.columns.map((header, index) => ({ header, index })).filter((c) => c.header !== 'Keterangan');
	const title = `Cetak ${jenis.toUpperCase()} (Simulasi)`;
	const rows = table.rows;
	const slips = rows
		.map((r) => {
			const body = keep
				.map(
					(c) =>
						`<tr><th>${escapeHtml(c.header)}</th><td>${escapeHtml(displayCell(c.header, r[c.index]))}</td></tr>`
				)
				.join('');
			return `<section class="slip"><div class="sim">${escapeHtml(SIM_LABEL)}</div><h1>Bukti Pemotongan ${escapeHtml(jenis.toUpperCase())}</h1><table>${body}</table><div class="sim">${escapeHtml(SIM_LABEL)}</div></section>`;
		})
		.join('');
	return `<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>${escapeHtml(title)}</title><style>
@page{size:A4;margin:12mm}
body{font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:#111;margin:0;background:#eee}
.bar{position:sticky;top:0;background:#fff;padding:8px 12px;border-bottom:1px solid #ccc;display:flex;gap:12px;align-items:center}
.bar button{font-size:12pt;padding:6px 14px;cursor:pointer}
.slip{background:#fff;width:186mm;min-height:270mm;margin:12px auto;padding:6mm;box-sizing:border-box;page-break-after:always;break-after:page}
.slip:last-of-type{page-break-after:auto;break-after:auto}
.sim{border:2px solid #b00020;color:#b00020;font-weight:bold;text-align:center;padding:4px;margin:6px 0}
h1{font-size:15pt;text-align:center;margin:8px 0}
table{width:100%;border-collapse:collapse}
th,td{border:1px solid #888;padding:3px 6px;text-align:left;vertical-align:top;font-size:10pt;overflow-wrap:anywhere}
th{width:42%;background:#f3f3f3}
@media print{body{background:#fff}.bar{display:none}.slip{margin:0;padding:0;width:auto;min-height:0}}
</style></head><body><div class="bar"><button type="button" id="cetak">Cetak / Simpan PDF</button><span>${rows.length} bukti potong. ${escapeHtml(SIM_LABEL)}. Pilih &quot;Simpan sebagai PDF&quot; pada dialog cetak peramban.</span></div>${slips}<script nonce="${nonce}">document.getElementById('cetak').addEventListener('click',function(){window.print();});</script></body></html>`;
};

export const newNonce = (): string => {
	const bytes = crypto.getRandomValues(new Uint8Array(16));
	let s = '';
	for (const b of bytes) s += String.fromCharCode(b);
	return btoa(s);
};
