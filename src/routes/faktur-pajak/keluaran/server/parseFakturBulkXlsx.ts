import { error } from '@sveltejs/kit';
import * as XLSX from 'xlsx';
import type { TaxInvoiceRow } from './parseTaxInvoiceBulk';

// Parses the real Coretax e-Faktur "Impor Data" bulk Excel template (confirmed
// against a real filled-in export, "1D. JULI PART 1 EDIT.xlsx"): four sheets,
// "Faktur" (header rows keyed by "Baris") + "DetailFaktur" (line items FK'd
// back to "Baris") + "REF" (dropdown value lists) + "Keterangan" (field docs).
// Reuses TaxInvoiceRow/TaxInvoiceGoodServiceRow from the XML importer so
// importFaktur.remote.ts's insertion logic is shared between both formats.

type SheetRow = Record<string, unknown>;

function sheetToRows(workbook: XLSX.WorkBook, sheetName: string): SheetRow[] {
	const sheet = workbook.Sheets[sheetName];
	if (!sheet) {
		error(400, `Sheet "${sheetName}" tidak ditemukan pada file.`);
	}

	const grid = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: true, defval: null });
	const headerRowIndex = grid.findIndex((row) => row?.[0] === 'Baris');
	if (headerRowIndex === -1) {
		error(400, `Sheet "${sheetName}": baris header ("Baris") tidak ditemukan.`);
	}

	const headers = grid[headerRowIndex].map((cell) => String(cell ?? ''));
	const rows: SheetRow[] = [];
	for (let i = headerRowIndex + 1; i < grid.length; i++) {
		const raw = grid[i];
		if (!raw || raw[0] === null || raw[0] === undefined || raw[0] === '') continue;
		// The real template terminates each sheet's data block with a literal
		// "END" sentinel row in the Baris column, not just running out of rows.
		if (typeof raw[0] !== 'number') break;

		const row: SheetRow = {};
		headers.forEach((header, col) => {
			if (header) row[header] = raw[col] ?? null;
		});
		rows.push(row);
	}

	return rows;
}

function excelSerialToIsoDate(value: unknown): string {
	if (typeof value === 'number') {
		const date = XLSX.SSF.parse_date_code(value);
		return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
	}

	const text = String(value ?? '').trim();
	const match = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
	if (match) {
		const [, dd, mm, yyyy] = match;
		return `${yyyy}-${mm}-${dd}`;
	}

	error(400, `Tanggal Faktur "${text}" tidak valid (harus format DD/MM/YYYY).`);
}

function textOrNull(value: unknown): string | null {
	const text = String(value ?? '').trim();
	return text === '' || text === '-' ? null : text;
}

// "Keterangan Tambahan" in the real template holds the full REF-sheet label
// ("1 - Pajak Pertambahan Nilai Tidak Dipungut ..."), not the bare kode
// jenis_informasi_tambahan_faktur_pajak.kode expects -- pull the leading
// number off the label.
function extractLeadingAddInfoKode(value: unknown): string | null {
	const text = String(value ?? '').trim();
	const match = text.match(/^(\d+)\s*-/);
	return match ? match[1] : null;
}

export function parseFakturBulkXlsx(buffer: ArrayBuffer, activeNpwp: string): { rows: TaxInvoiceRow[] } {
	let workbook: XLSX.WorkBook;
	try {
		workbook = XLSX.read(buffer, { type: 'array' });
	} catch {
		error(400, 'File Excel tidak valid.');
	}

	const fakturSheet = workbook.Sheets['Faktur'];
	if (!fakturSheet) {
		error(400, 'File Excel bukan format Impor Data Faktur Keluaran yang valid (sheet "Faktur" tidak ditemukan).');
	}
	const headerGrid = XLSX.utils.sheet_to_json<unknown[]>(fakturSheet, {
		header: 1,
		raw: true,
		defval: null
	});
	const npwpLabelRow = headerGrid.find((row) => row?.[0] === 'NPWP Penjual');
	const npwpPenjual = String(npwpLabelRow?.find((cell, i) => i > 0 && cell !== null) ?? '').trim();
	if (npwpPenjual !== activeNpwp) {
		error(400, `NPWP Penjual pada file (${npwpPenjual}) tidak sesuai dengan NPWP Anda.`);
	}

	const fakturRows = sheetToRows(workbook, 'Faktur');
	const detailRows = sheetToRows(workbook, 'DetailFaktur');

	if (fakturRows.length === 0) {
		return { rows: [] };
	}

	const detailsByBaris = new Map<number, SheetRow[]>();
	for (const detail of detailRows) {
		const baris = Number(detail['Baris']);
		const list = detailsByBaris.get(baris) ?? [];
		list.push(detail);
		detailsByBaris.set(baris, list);
	}

	const rows = fakturRows.map((row) => {
		const baris = Number(row['Baris']);
		const trxCode = Number(row['Kode Transaksi']);
		if (!trxCode) {
			error(400, `Faktur baris ${baris}: Kode Transaksi "${row['Kode Transaksi']}" tidak valid.`);
		}

		const details = detailsByBaris.get(baris) ?? [];
		if (details.length === 0) {
			error(400, `Faktur baris ${baris}: tidak ada baris DetailFaktur yang cocok.`);
		}

		return {
			taxInvoiceDate: excelSerialToIsoDate(row['Tanggal Faktur']),
			trxCode,
			addInfo: extractLeadingAddInfoKode(row['Keterangan Tambahan']),
			customDoc: textOrNull(row['Dokumen Pendukung']),
			refDesc: textOrNull(row['Referensi']),
			buyerTin: String(row['NPWP/NIK Pembeli'] ?? '').trim(),
			buyerAdress: textOrNull(row['Alamat Pembeli']),
			goodServices: details.map((good, goodIndex) => {
				const opt = String(good['Barang/Jasa'] ?? '');
				const code = String(good['Kode Barang Jasa'] ?? '');
				const unit = String(good['Nama Satuan Ukur'] ?? '');
				const name = String(good['Nama Barang/Jasa'] ?? '');

				if (!opt || !code || !unit || !name) {
					error(
						400,
						`Faktur baris ${baris}, DetailFaktur ke-${goodIndex + 1}: Barang/Jasa, Kode Barang Jasa, Nama Satuan Ukur dan Nama Barang/Jasa wajib diisi.`
					);
				}

				return {
					opt,
					code,
					name,
					unit,
					price: Number(good['Harga Satuan'] ?? 0),
					qty: Number(good['Jumlah Barang Jasa'] ?? 0),
					totalDiscount: Number(good['Total Diskon'] ?? 0),
					otherTaxBase: Number(good['DPP Nilai Lain'] ?? 0),
					vatRate: Number(good['Tarif PPN'] ?? 0),
					stlgRate: Number(good['Tarif PPnBM'] ?? 0)
				};
			})
		};
	});

	return { rows };
}
