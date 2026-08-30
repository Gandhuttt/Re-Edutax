import { query } from '$app/server';
import { listBuktiPotongSaya } from '../../../../../ebupot/bukti-potong-saya/listBuktiPotongSaya.remote';

// Backs "Impor dari eBupot" on L-1 Bagian E. All 6 eBupot bukti types are
// personal-income eligible (BP21/BP26/BPA1/BPA2/MP always are; BPU can be
// either an individual or corporate recipient, and this app has no
// account-type flag to tell -- so it's offered here too, same as it's
// offered on the Badan side, and the taxpayer picks whichever form actually
// matches who they are).
//
// Only *creditable* (non-final) withholding belongs in a Lampiran E credit
// line -- final tax (PPh Pasal 4(2) etc.) settles the obligation on its own
// and is never entered here, so `sifat = 'Tidak Final'` rows are the only
// ones offered. Dedup (excluding bukti already imported into the SPT
// currently open) happens client-side in E.svelte, against whatever's
// already in the bound `rows` array -- this query has no sptId to scope by
// and doesn't need one.
export const listBuktiPotongForImport = query(async () => {
	const rows = await listBuktiPotongSaya();
	return rows.filter((row) => row.sifat === 'Tidak Final');
});
