import { prerender } from '$app/server';
import { db } from '$lib/server/db';
import { fasilitas_pajak_ebupot } from '$lib/server/db/schema';
import { and, asc, eq, inArray } from 'drizzle-orm';

export const getFasilitasPajak = prerender(
	async () => {
		const rows = await db
			.select()
			.from(fasilitas_pajak_ebupot)
			.where(eq(fasilitas_pajak_ebupot.aktif, true))
			.orderBy(asc(fasilitas_pajak_ebupot.kode));

		return rows;
	},
	{ dynamic: true }
);

// Live-verified (see docs/ui-reference/coretax/ebupot/NOTES.md "BPU:
// Fasilitas Pajak and manual-rate objects"): BPU's own Fasilitas Pajak
// dropdown only ever offers these 3 of the 11 EBUPOT_TAX_CERTIFICATE codes --
// Tanpa Fasilitas (9), PPh Ditanggung Pemerintah/DTP (4), Fasilitas Lainnya
// (8) -- regardless of which Nama Objek Pajak is selected. Reproduced across
// two separate live sessions/accounts.
const bpuFasilitasKode = ['9', '4', '8'];

export const getFasilitasPajakBpu = prerender(
	async () => {
		const rows = await db
			.select()
			.from(fasilitas_pajak_ebupot)
			.where(and(eq(fasilitas_pajak_ebupot.aktif, true), inArray(fasilitas_pajak_ebupot.kode, bpuFasilitasKode)))
			.orderBy(asc(fasilitas_pajak_ebupot.kode));

		return rows;
	},
	{ dynamic: true }
);

// Live-verified (see docs/ui-reference/coretax/ebupot/NOTES.md): BP21's
// ParameterData across all 36 objects only ever references TaxCertificateCode
// 4 (DTP), 8 (Fasilitas Lainnya), 9 (Tanpa Fasilitas), 10 (SKB Pasal 21).
const bp21FasilitasKode = ['4', '8', '9', '10'];

export const getFasilitasPajakBp21 = prerender(
	async () => {
		const rows = await db
			.select()
			.from(fasilitas_pajak_ebupot)
			.where(and(eq(fasilitas_pajak_ebupot.aktif, true), inArray(fasilitas_pajak_ebupot.kode, bp21FasilitasKode)))
			.orderBy(asc(fasilitas_pajak_ebupot.kode));

		return rows;
	},
	{ dynamic: true }
);

// Live-verified (see docs/ui-reference/coretax/ebupot/NOTES.md "BP26"):
// BP26's single object code (27-100-99) references TaxCertificateCode 4
// (DTP), 7 (Surat Keterangan Domisili/SKD), 8 (Fasilitas Lainnya), 9
// (Tanpa Fasilitas) -- confirmed live, dropdown showed exactly these 4.
const bp26FasilitasKode = ['4', '7', '8', '9'];

export const getFasilitasPajakBp26 = prerender(
	async () => {
		const rows = await db
			.select()
			.from(fasilitas_pajak_ebupot)
			.where(and(eq(fasilitas_pajak_ebupot.aktif, true), inArray(fasilitas_pajak_ebupot.kode, bp26FasilitasKode)))
			.orderBy(asc(fasilitas_pajak_ebupot.kode));

		return rows;
	},
	{ dynamic: true }
);

// Live-verified (see docs/ui-reference/coretax/ebupot/NOTES.md "BPA1"):
// the "Jenis Fasilitas pada Masa Pajak Desember/Masa Pajak Terakhir"
// dropdown offers exactly 3 options -- Fasilitas Lainnya (8), Tanpa
// Fasilitas (9), PPh Pasal 21 Ditanggung Pemerintah/DTP (11, the
// Pasal-21-specific DTP code, distinct from BPU's general code 4).
const bpa1FasilitasKode = ['8', '9', '11'];

export const getFasilitasPajakBpa1 = prerender(
	async () => {
		const rows = await db
			.select()
			.from(fasilitas_pajak_ebupot)
			.where(and(eq(fasilitas_pajak_ebupot.aktif, true), inArray(fasilitas_pajak_ebupot.kode, bpa1FasilitasKode)))
			.orderBy(asc(fasilitas_pajak_ebupot.kode));

		return rows;
	},
	{ dynamic: true }
);

// Derived from the reference-data pull's ParameterData (not live UI-clicked
// this pass, see docs/ui-reference/coretax/ebupot/NOTES.md "MP"): MP's
// object codes' ItemList only ever references TaxCertificateCodes 9 (Tanpa
// Fasilitas) + 4 (DTP) combined into the TER-band entry, plus 8 (Fasilitas
// Lainnya) as the sole manual entry -- the same 3-code scope as BPU.
const mpFasilitasKode = ['4', '8', '9'];

export const getFasilitasPajakMp = prerender(
	async () => {
		const rows = await db
			.select()
			.from(fasilitas_pajak_ebupot)
			.where(and(eq(fasilitas_pajak_ebupot.aktif, true), inArray(fasilitas_pajak_ebupot.kode, mpFasilitasKode)))
			.orderBy(asc(fasilitas_pajak_ebupot.kode));

		return rows;
	},
	{ dynamic: true }
);
