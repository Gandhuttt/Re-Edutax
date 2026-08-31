import { getBuktiPotongUntukPenerima } from '$lib/server/ebupot/getBuktiPotongUntukPenerima';
import { getJenisPajakDipotongDipungutId } from '../components/L3/saveLampiranL3.server';

// Only BPU can have a corporate recipient (BP21/BP26/BPA1/BPA2/MP are
// always personal-income withholding -- see the OP-side equivalent). Only
// non-final withholding is creditable here -- final tax (PPh Pasal 4(2)
// etc.) settles the obligation on its own, which is also why
// jenis_pajak_dipotong_dipungut_spt_pph_badan has no Pasal 4(2) row to map
// into at all (only Pasal 15/22/23/26).
const pasalKeKodeJenisPajak: Record<string, string> = {
	'Pasal 15': 'pph_pasal_15',
	'Pasal 22': 'pph_pasal_22',
	'Pasal 23': 'pph_pasal_23',
	'Pasal 26': 'pph_pasal_26'
};

export type PostedLampiranL3BRow = {
	namaPemotongPemungut: string;
	npwpPemotongPemungut: string;
	jenisPajakId: string;
	dpp: number;
	pph: number;
	nomorBukti: string;
	tanggalBukti: string;
	sumberBuktiPotongJenis: 'BPU';
	sumberBuktiPotongId: string;
};

// Bulk-computes Lampiran III.B rows from every eligible eBupot BPU bukti
// potong this taxpayer received (as recipient) for the given tax year --
// the "Posting SPT" pull, mirrored on
// pph-orang-pribadi/server/computePostedSptPphOrangPribadiLampiran.server.ts
// and modeled directly on ppn/server/computePostedSptPpnLampiran.server.ts.
export async function computePostedSptPphBadanLampiranL3B({
	npwp,
	tahunPajak
}: {
	npwp: string;
	tahunPajak: number;
}): Promise<PostedLampiranL3BRow[]> {
	const semua = await getBuktiPotongUntukPenerima(npwp);
	const eligible = semua.filter(
		(row) => row.jenis === 'BPU' && row.sifat === 'Tidak Final' && row.tahun === tahunPajak
	);

	const rows: PostedLampiranL3BRow[] = [];
	for (const row of eligible) {
		const kode = row.pasal ? pasalKeKodeJenisPajak[row.pasal] : undefined;
		// Shouldn't happen given the sifat filter (every non-final BPU pasal
		// maps to one of the 4 known codes), but skip defensively rather than
		// crash the whole Posting action over one bad row.
		if (!kode) continue;

		const jenisPajakId = await getJenisPajakDipotongDipungutId(kode);
		rows.push({
			namaPemotongPemungut: row.namaPemotong,
			npwpPemotongPemungut: row.npwpPemotong,
			jenisPajakId,
			dpp: row.penghasilanBruto,
			pph: row.pajakPenghasilan,
			nomorBukti: row.nomorPemotongan ?? '',
			tanggalBukti: row.tanggalBukti,
			sumberBuktiPotongJenis: 'BPU',
			sumberBuktiPotongId: row.id
		});
	}

	return rows;
}
