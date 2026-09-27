export type FakturLineAmountsInput = {
	kuantitas: number;
	hargaSatuan: number;
	hargaPotongan: number;
	dppNilaiLain: number;
	tarifPpn: number;
	tarifPpnBm: number;
};

export type FakturAmounts = {
	dpp: number;
	dppNilaiLain: number;
	ppn: number;
	ppnbm: number;
};

export type FakturPayment = {
	uangMuka?: boolean;
	pelunasan?: boolean;
	nilaiUangMuka?: number;
};

export function computeFakturLineAmounts(line: FakturLineAmountsInput): FakturAmounts {
	const dpp = Math.max(0, line.kuantitas * line.hargaSatuan - line.hargaPotongan);
	const ppnBase = line.dppNilaiLain > 0 ? line.dppNilaiLain : dpp;

	return {
		dpp,
		dppNilaiLain: line.dppNilaiLain,
		ppn: Math.round((ppnBase * line.tarifPpn) / 100),
		ppnbm: Math.round((dpp * line.tarifPpnBm) / 100)
	};
}

export function applyFakturPaymentAdjustment(
	amounts: FakturAmounts,
	payment: FakturPayment = {}
): FakturAmounts {
	if ((!payment.uangMuka && !payment.pelunasan) || amounts.dpp <= 0) return { ...amounts };

	const advance = Math.min(Math.max(0, payment.nilaiUangMuka ?? 0), amounts.dpp);
	const adjustedDpp = payment.pelunasan ? amounts.dpp - advance : advance;
	const factor = adjustedDpp / amounts.dpp;

	return {
		dpp: adjustedDpp,
		dppNilaiLain: Math.round(amounts.dppNilaiLain * factor),
		ppn: Math.round(amounts.ppn * factor),
		ppnbm: Math.round(amounts.ppnbm * factor)
	};
}

export function computeFakturAmounts(
	lines: readonly FakturLineAmountsInput[],
	payment: FakturPayment = {}
): { gross: FakturAmounts; taxable: FakturAmounts } {
	const gross = lines.reduce<FakturAmounts>(
		(total, line) => {
			const amounts = computeFakturLineAmounts(line);
			total.dpp += amounts.dpp;
			total.dppNilaiLain += amounts.dppNilaiLain;
			total.ppn += amounts.ppn;
			total.ppnbm += amounts.ppnbm;
			return total;
		},
		{ dpp: 0, dppNilaiLain: 0, ppn: 0, ppnbm: 0 }
	);

	return { gross, taxable: applyFakturPaymentAdjustment(gross, payment) };
}
