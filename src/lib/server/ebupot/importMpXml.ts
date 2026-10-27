import { db } from '$lib/server/db';
import type { Statement } from '$lib/server/db';
import { bukti_potong_mp } from '$lib/server/db/schema';
import { parseMpXml } from './parseMpXml';
import { getMpFacilityByKode, getMpObjectByKode, prepareMp } from './mpService';

const facilityCodes = { 'N/A': '9', DTP: '4', ETC: '8' } as const;

/**
 * Imports the official MmPayrollBulk template as local SUBMITTED, unissued slips. Every row is
 * resolved and validated with the same service as the interactive form (period, TIN, object,
 * facility, NITKU, tarif); nothing is written unless all rows pass, and the D1 batch is atomic.
 * The template carries no tax amount: PPh is recalculated locally.
 */
export async function importMpXml(xml: string, owner: string): Promise<number> {
	const rows = parseMpXml(xml, owner);
	const statements: Statement[] = [];
	for (const [index, row] of rows.entries()) {
		const fail = (message: string): never => { throw new Error(`Baris ${index + 1}: ${message}`); };
		const object = await getMpObjectByKode(row.objectCode);
		if (!object) fail(`TaxObjectCode ${row.objectCode} tidak aktif atau bukan objek pajak MP.`);
		const facility = await getMpFacilityByKode(facilityCodes[row.certificate]);
		if (!facility) fail(`TaxCertificate ${row.certificate} tidak tersedia untuk MP.`);
		const manual = facility!.kode === '8';
		const { errors, values } = await prepareMp(owner, {
			tahun: row.tahun, masaPajak: row.masaPajak, pegawaiAsing: row.foreign,
			nomorPaspor: row.passport, nomorIdentitasWp: row.tin, nama: '', nitkuPemotong: row.nitku,
			statusPtkp: row.ptkp, jabatan: row.position, kodeObjekPajakId: object!.id,
			fasilitasPajakId: facility!.id, penghasilanBruto: String(row.gross),
			tanggalPemotongan: row.withholdingDate,
			...(manual ? { tarifManual: String(row.rate),
				pajakPenghasilanManual: String(Math.round(row.gross * row.rate / 100)) } : {})
		}, { submit: true, existing: null });
		if (errors.length > 0) fail(errors.map((error) => error.message).join('; '));
		if (!manual && values.tarif !== row.rate) {
			fail(`Rate ${row.rate} tidak sesuai tarif TER otomatis (${values.tarif}); koreksi XML.`);
		}
		statements.push(db.insert(bukti_potong_mp).values({ ...values, id: crypto.randomUUID(),
			npwpPemotong: owner, status: 'SUBMITTED', diterbitkan: false, nomorPemotongan: null }));
	}
	// No write is executed until every row passes; D1 batch rolls back the whole file on failure.
	await db.batch(statements as [Statement, ...Statement[]]);
	return rows.length;
}
