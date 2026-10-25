export const SPT2126_YEARS = [2025, 2026] as const;
export type Spt2126Status = 'konsep' | 'menunggu_pembayaran' | 'dilaporkan';

export type Spt2126Input = {
	jenisWajibPajak: 'perusahaan' | 'instansi_pemerintah';
	kompensasi21SumberId: string | null;
	kompensasi21: number;
	kompensasi26SumberId: string | null;
	kompensasi26: number;
	sp2d21: number;
	sp2d26: number;
	sp2dKeterangan: string;
	pernyataan: boolean;
};

export const emptySpt2126Input = (): Spt2126Input => ({
	jenisWajibPajak: 'perusahaan',
	kompensasi21SumberId: null,
	kompensasi21: 0,
	kompensasi26SumberId: null,
	kompensasi26: 0,
	sp2d21: 0,
	sp2d26: 0,
	sp2dKeterangan: '',
	pernyataan: false
});

export type Spt2126Source = {
	id: string;
	jenis: 'MP' | 'BPA1' | 'BPA2' | 'BP21' | 'BP26';
	nama: string;
	identitas: string;
	kodeObjek: string;
	masaPajak: number;
	tahun: number;
	bruto: number;
	/** Includes DTP; subtract dtp once when calculating tax payable. */
	pajak: number;
	dtp: number;
	brutoTahunan: number | null;
	pajakTahunan: number | null;
	dtpTahunan: number | null;
	nomor: string;
	status: string;
};
export type Spt2126Summary = { bruto: number; pajak: number; dtp: number; jumlah: number };
export type Spt2126Article = Spt2126Summary & {
	kompensasi: number;
	sp2d: number;
	kurangLebihBayar: number;
	pembayaranSebelumnya: number;
	harusDibayar: number;
};
export type Spt2126Snapshot = {
	sources: Spt2126Source[];
	lia: Spt2126Summary;
	lib: Spt2126Summary;
	lii: Spt2126Summary;
	liii21: Spt2126Summary;
	liii26: Spt2126Summary;
	pasal21: Spt2126Article;
	pasal26: Spt2126Article;
};
export type Spt2126Compensation = {
	id: string;
	masaPajak: number;
	tahun: number;
	pasal: 21 | 26;
	tersedia: number;
};
export type Spt2126Detail = {
	id: string;
	npwpPemotong: string;
	namaPemotong: string;
	masaPajak: number;
	tahun: number;
	pembetulanKe: number;
	chainId: string;
	status: Spt2126Status;
	revision: number;
	createdAt: Date;
	tanggalPosting: Date | null;
	tanggalDilaporkan: Date | null;
	posted: boolean;
	sourcesChanged: boolean;
	sourceSignature: string | null;
	kredit21: number;
	kredit26: number;
	input: Spt2126Input;
	snapshot: Spt2126Snapshot | null;
	preview: Spt2126Snapshot;
	kompensasiTersedia: Spt2126Compensation[];
	pembayaran21: number;
	pembayaran26: number;
	kurangLebihBayar: number;
};

export class Spt2126Error extends Error {
	constructor(message: string, readonly status: 400 | 404 | 409 = 400) {
		super(message);
	}
}

export function rupiah(value: number, signed = false): number {
	if (!Number.isSafeInteger(value) || (!signed && value < 0)) {
		throw new Spt2126Error('Nilai rupiah harus bilangan bulat yang valid.');
	}
	return value;
}

export function isActiveSpt2126Source(status: string, issued: boolean): boolean {
	return issued && ['NORMAL', 'SUBMITTED', 'AMENDMENT'].includes(status);
}

/** Simulator rule, not a universal DJP backend formula. Prior MP must already be scoped by employer/recipient/object/period. */
export function lastPeriodSpt2126Gross(annualGross: number, priorMonthlyGross: number[]): number {
	let gross = rupiah(annualGross);
	for (const value of priorMonthlyGross) gross = rupiah(gross - rupiah(value), true);
	if (gross < 0) throw new Spt2126Error('Bruto BPA lebih kecil daripada total MP sebelumnya; perbaiki sumber.');
	return gross;
}

export function validateSpt2126Input(input: Spt2126Input): Spt2126Input {
	for (const value of [input.kompensasi21, input.kompensasi26, input.sp2d21, input.sp2d26]) rupiah(value);
	if (!['perusahaan', 'instansi_pemerintah'].includes(input.jenisWajibPajak)) {
		throw new Spt2126Error('Pilih skenario wajib pajak simulator.');
	}
	if ((input.sp2d21 || input.sp2d26) && input.jenisWajibPajak !== 'instansi_pemerintah') {
		throw new Spt2126Error('SP2D hanya tersedia untuk skenario simulator instansi pemerintah.');
	}
	if (typeof input.pernyataan !== 'boolean' || typeof input.sp2dKeterangan !== 'string' || input.sp2dKeterangan.length > 1000) {
		throw new Spt2126Error('Pernyataan/keterangan tidak valid.');
	}
	for (const id of [input.kompensasi21SumberId, input.kompensasi26SumberId]) {
		if (id !== null && (typeof id !== 'string' || !id || id.length > 64)) throw new Spt2126Error('Sumber kompensasi tidak valid.');
	}
	if ((input.sp2d21 || input.sp2d26) && !input.sp2dKeterangan.trim()) {
		throw new Spt2126Error('SP2D simulator wajib disertai keterangan; bukan validasi SP2D DJP.');
	}
	if ((input.kompensasi21 > 0 && !input.kompensasi21SumberId) || (input.kompensasi26 > 0 && !input.kompensasi26SumberId)) {
		throw new Spt2126Error('Pilih sumber kompensasi.');
	}
	return { ...input, sp2dKeterangan: input.sp2dKeterangan.trim() };
}

const summary = (): Spt2126Summary => ({ bruto: 0, pajak: 0, dtp: 0, jumlah: 0 });
function add(to: Spt2126Summary, bruto: number, pajak: number, dtp: number, jumlah = 1) {
	to.bruto = rupiah(to.bruto + bruto, true);
	to.pajak = rupiah(to.pajak + pajak, true);
	to.dtp = rupiah(to.dtp + dtp, true);
	to.jumlah += jumlah;
}

export function aggregateSpt2126(sources: Spt2126Source[], input: Spt2126Input, paid21 = 0, paid26 = 0): Spt2126Snapshot {
	const lia = summary(), lib = summary(), lii = summary(), liii21 = summary(), liii26 = summary();
	for (const source of sources) {
		for (const amount of [source.bruto, source.pajak, source.dtp]) rupiah(amount, true);
		if (source.jenis === 'MP') {
			add(lia, source.bruto, source.pajak, source.dtp);
		} else if (source.jenis === 'BPA1' || source.jenis === 'BPA2') {
			add(lib, source.bruto, source.pajak, source.dtp);
			add(lii, source.brutoTahunan ?? 0, source.pajakTahunan ?? 0, source.dtpTahunan ?? 0);
		} else {
			add(source.jenis === 'BP21' ? liii21 : liii26, source.bruto, source.pajak, source.dtp);
		}
	}
	const article = (parts: Spt2126Summary[], kompensasi: number, sp2d: number, paid: number): Spt2126Article => {
		const total = summary();
		for (const part of parts) add(total, part.bruto, part.pajak, part.dtp, part.jumlah);
		const kurangLebihBayar = rupiah(total.pajak - total.dtp - kompensasi - sp2d, true);
		return { ...total, kompensasi, sp2d, kurangLebihBayar, pembayaranSebelumnya: paid, harusDibayar: rupiah(kurangLebihBayar - paid, true) };
	};
	return {
		sources, lia, lib, lii, liii21, liii26,
		pasal21: article([lia, lib, liii21], input.kompensasi21, input.sp2d21, paid21),
		pasal26: article([liii26], input.kompensasi26, input.sp2d26, paid26)
	};
}
