import { and, eq, inArray } from 'drizzle-orm';
import { db } from '$lib/server/db';
import type { Statement } from '$lib/server/db';
import { bukti_potong_bpa1, bukti_potong_bpa2, fasilitas_pajak_ebupot, kode_objek_pajak_pph } from '$lib/server/db/schema';
import { calculateBpa } from '$lib/helpers/bpa-calc';
import type { BpaCalcResult } from '$lib/helpers/bpa-calc';
import type { BpaKind } from '$lib/helpers/bp-parity';
import { getBpContext } from './bpLookup';
import { parseBpaXml } from './parseBpaXml';
import { priorMonthlyPph21Withheld } from './priorMonthlyWithheld';

const certificateCodes: Record<string, string> = { 'N/A': '9', DTP: '11' };

export async function importBpaXml(xml: string, kind: BpaKind, owner: string): Promise<number> {
	const rows = parseBpaXml(xml, kind, owner);
	const [objects, facilities] = await Promise.all([
		db.select().from(kode_objek_pajak_pph).where(and(eq(kode_objek_pajak_pph.jenisBuktiPotong, kind), eq(kode_objek_pajak_pph.aktif, true))),
		db.select().from(fasilitas_pajak_ebupot).where(eq(fasilitas_pajak_ebupot.aktif, true))
	]);
	const statements: Statement[] = [];
	for (const [index, row] of rows.entries()) {
		const fail: (message: string) => never = (message) => { throw new Error(`Baris ${index + 1}: ${message}`); };
		const context = await getBpContext(owner, row.tin);
		const name = context.knownTaxpayer?.nama.trim();
		if (!name) fail('nama penerima belum tersedia pada data Wajib Pajak lokal. Daftarkan penerima terlebih dahulu.');
		if (!context.ownBranches.some((branch) => branch.nitku === row.nitku)) fail('NITKU pemotong belum terdaftar di Tempat Kegiatan Usaha akun Anda.');
		const object = objects.find((item) => item.kode === row.objectCode);
		if (!object) fail('objek pajak tidak aktif atau tidak tersedia untuk jenis bukti ini.');
		const facility = kind === 'bpa1' ? facilities.find((item) => item.kode === certificateCodes[row.certificate]) : null;
		if (kind === 'bpa1' && !facility) fail(`TaxCertificate ${row.certificate} tidak tersedia.`);
		let previousNet = 0; let previousTax = 0;
		if (row.previousSlip) {
			const table = kind === 'bpa1' ? bukti_potong_bpa1 : bukti_potong_bpa2;
			const previous = await db.select({ net: table.penghasilanNeto, tax: table.pphPasal21TerutangPadaIni,
				year: table.tahunAkhir, month: table.masaPajakAkhir }).from(table).where(and(
				eq(table.npwpPemotong, owner), eq(table.nomorIdentitasWp, row.tin),
				eq(table.nomorPemotongan, row.previousSlip), eq(table.diterbitkan, true),
				inArray(table.status, ['NORMAL', 'SUBMITTED'])
			)).limit(2);
			if (previous.length !== 1) fail('PrevWhTaxSlip harus menunjuk satu bukti aktif yang telah diterbitkan milik akun dan penerima ini.');
			const slip = previous[0];
			if (slip.year !== row.tahun || slip.month >= row.masaPajakAwal) fail('PrevWhTaxSlip harus berasal dari masa sebelumnya pada tahun pajak yang sama.');
			previousNet = slip.net; previousTax = slip.tax;
		}
		const dtp = facility?.kode === '11';
		const monthlyTax = dtp ? 0 : await priorMonthlyPph21Withheld({ npwpPemotong: owner,
			nomorIdentitasWp: row.tin, nama: name, kodeObjekPajakId: object.id,
			masaPajakAwal: row.masaPajakAwal, tahunAwal: row.tahun,
			masaPajakAkhir: row.masaPajakAkhir, tahunAkhir: row.tahun });
		const gross = row.salary + row.otherBenefit + (kind === 'bpa1'
			? row.honorarium + row.insurance + row.natura + row.bonus
			: row.wifeBenefit + row.childBenefit + row.incomeImprovement + row.structuralBenefit + row.riceBenefit + row.otherRegular);
		if (!Number.isSafeInteger(gross + row.incomeTaxBenefit) || !Number.isSafeInteger(row.pensionContribution + row.zakat)) fail('jumlah komponen penghasilan/pengurang di luar batas angka aman.');
		let calc: BpaCalcResult;
		try {
			calc = calculateBpa({ brutoTanpaTunjanganPph: gross, tunjanganPph: row.incomeTaxBenefit,
				grossUp: row.grossUp, masaPajakAwal: row.masaPajakAwal, tahunAwal: row.tahun,
				masaPajakAkhir: row.masaPajakAkhir, tahunAkhir: row.tahun, kodeObjek: object.kode,
				disetahunkan: row.withholdingStatus === 'KURANG_SETAHUN_DISETAHUNKAN', jumlahBulan: row.months,
				iuranPensiun: row.pensionContribution, zakat: row.zakat, penghasilanNetoSebelumnya: previousNet,
				statusPtkp: row.ptkp, pphDipotongSebelumnya: previousTax, parameterData: object.parameterData,
				facilityKode: facility?.kode ?? null, dtp, pphDipotongBulanan: monthlyTax });
		} catch (cause) { fail(cause instanceof Error ? cause.message : 'Penghitungan BPA gagal.'); }
		if (Object.values(calc).some((value) => !Number.isFinite(value) || Math.abs(value) > Number.MAX_SAFE_INTEGER)) fail('hasil penghitungan di luar batas angka aman.');
		const { tunjanganPph, pphDipotongAtauDitanggung, ...computed } = calc;
		const common = { ...computed, id: crypto.randomUUID(), npwpPemotong: owner,
			masaPajakAwal: row.masaPajakAwal, tahunAwal: row.tahun, masaPajakAkhir: row.masaPajakAkhir, tahunAkhir: row.tahun,
			bekerjaDiLebihDariSatuPemberiKerja: row.secondEmployer, nomorIdentitasWp: row.tin, nama: name,
			statusPtkp: row.ptkp, kodeObjekPajakId: object.id, jenisPemotongan: row.withholdingStatus, jumlahBulan: row.months,
			iuranPensiun: row.pensionContribution, zakat: row.zakat, nomorBuktiSebelumnya: row.previousSlip,
			penghasilanNetoSebelumnya: previousNet, pphPasal21DipotongSebelumnya: previousTax,
			nitkuPemotong: row.nitku, tanggalPemotongan: row.withholdingDate,
			status: 'SUBMITTED' as const, diterbitkan: false, nomorPemotongan: null };
		// Article21IncomeTax is a template total, not an authority: all tax totals
		// are recalculated from local references/monthly slips, just like detail save.
		if (kind === 'bpa1') statements.push(db.insert(bukti_potong_bpa1).values({ ...common,
			pegawaiAsing: row.foreign, nomorPaspor: row.passport, jabatan: row.position,
			fasilitasPajakId: facility!.id, isGrossUp: row.grossUp, gajiPensiunThtJht: row.salary,
			tunjanganPph, tunjanganLainnya: row.otherBenefit, honorarium: row.honorarium,
			premiAsuransi: row.insurance, natura: row.natura, tantiemBonus: row.bonus,
			pphDipotongDitanggungPemerintah: pphDipotongAtauDitanggung }));
		else statements.push(db.insert(bukti_potong_bpa2).values({ ...common,
			nip: row.nip, pangkatGolongan: row.rank, posisi: row.position, gajiPokokPensiun: row.salary,
			tunjanganIstri: row.wifeBenefit, tunjanganAnak: row.childBenefit,
			tunjanganPerbaikanPenghasilan: row.incomeImprovement, tunjanganStrukturalFungsional: row.structuralBenefit,
			tunjanganBeras: row.riceBenefit, tunjanganLainLain: row.otherBenefit,
			penghasilanTetapTeraturLainnya: row.otherRegular, pphPasal21YangTelahDipotong: pphDipotongAtauDitanggung }));
	}
	// No write is executed until every row is resolved and recalculated; D1
	// batch is atomic, including foreign-key and insert failures.
	await db.batch(statements as [Statement, ...Statement[]]);
	return rows.length;
}
