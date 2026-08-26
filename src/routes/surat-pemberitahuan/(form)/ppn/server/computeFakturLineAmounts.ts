// Shared DPP/PPN/PPnBM math for one transaksi_faktur_pajak line item. Used by
// both the induk aggregation (computePostedSptPpnFields) and the per-invoice
// lampiran snapshot (computePostedSptPpnLampiran) so the two never drift.
export function computeFakturLineAmounts(line: {
	kuantitas: number;
	hargaSatuan: number;
	hargaPotongan: number;
	dppNilaiLain: number;
	tarifPpn: number;
	tarifPpnBm: number;
}) {
	const dpp = Math.max(0, line.kuantitas * line.hargaSatuan - line.hargaPotongan);
	const ppnBase = line.dppNilaiLain > 0 ? line.dppNilaiLain : dpp;

	return {
		dpp,
		dppNilaiLain: line.dppNilaiLain,
		ppn: Math.round((ppnBase * line.tarifPpn) / 100),
		ppnbm: Math.round((dpp * line.tarifPpnBm) / 100)
	};
}
