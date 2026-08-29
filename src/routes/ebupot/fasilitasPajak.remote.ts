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
