import { form, getRequestEvent } from '$app/server';
import { error, invalid } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { db, type Statement } from '$lib/server/db';
import { bukti_potong_bp21, bukti_potong_bp26, fasilitas_pajak_ebupot, jenis_dokumen_ebupot, kode_objek_pajak_pph, negara_spt_pph_badan } from '$lib/server/db/schema';
import { isAllowedPeriod, isObjectAvailable } from '$lib/helpers/bp-parity';
import { ptkpEbupotValues } from '$lib/helpers/ptkp-ebupot';
import { ebupotCountryCodes } from '$lib/helpers/ebupot-country-codes';
import { resolveBp21, computeBp21Amounts, type Bp21Amounts } from '$lib/helpers/resolveBp21';
import { resolveBp26, computeBp26Amounts, type Bp26Amounts } from '$lib/helpers/resolveBp26';
import { getLocalBpContext, isRecipientBranch, type LocalBpContext } from '$lib/server/ebupot/localRegistry';
import { parseBpXml, type BpXmlRow } from '$lib/server/ebupot/parseBpXml';

const certificateCodes: Record<string, string> = { 'N/A': '9', DTP: '4', TaxExAr21: '10', ETC: '8', COD: '7' };

export const importBp = form('unchecked', async (input) => {
	const owner = getRequestEvent().locals.user?.username;
	if (!owner) error(401, 'Belum login');
	const kind = input.jenis;
	if (kind !== 'bp21' && kind !== 'bp26') invalid('Pilih jenis BP21 atau BP26.');
	const file = input.file;
	if (!(file instanceof File) || !file.name.toLowerCase().endsWith('.xml')) invalid('Pilih berkas XML sesuai template resmi DJP.');
	if (file.size > 1_048_576) invalid('Ukuran XML maksimum 1 MiB.');
	let rows: BpXmlRow[];
	try { rows = parseBpXml(await file.text(), kind, owner); }
	catch (cause) { invalid(cause instanceof Error ? cause.message : 'XML tidak dapat dibaca.'); }
	const [objects, facilities, documents, countries] = await Promise.all([
		db.select().from(kode_objek_pajak_pph).where(and(eq(kode_objek_pajak_pph.jenisBuktiPotong, kind), eq(kode_objek_pajak_pph.aktif, true))),
		db.select().from(fasilitas_pajak_ebupot).where(eq(fasilitas_pajak_ebupot.aktif, true)),
		db.select().from(jenis_dokumen_ebupot).where(eq(jenis_dokumen_ebupot.aktif, true)),
		db.select().from(negara_spt_pph_badan).where(eq(negara_spt_pph_badan.aktif, true))
	]);
	const contextCache = new Map<string, Promise<LocalBpContext>>();
	const statements: Statement[] = [];
	for (const [index, row] of rows.entries()) {
		const fail: (message: string) => never = (message) => invalid(`Baris ${index + 1}: ${message}`);
		const key = `${row.tin}:${row.tahun}:${row.masaPajak}`;
		let pendingContext = contextCache.get(key);
		if (!pendingContext) { pendingContext = getLocalBpContext(owner, row.tin, row.tahun, row.masaPajak); contextCache.set(key, pendingContext); }
		const context = await pendingContext;
		if (!isAllowedPeriod(row.tahun, row.masaPajak, context.government)) fail('masa pajak di luar rentang yang diizinkan.');
		const facility = facilities.find((item) => item.kode === certificateCodes[row.certificate]);
		if (!facility) fail(`TaxCertificate ${row.certificate} tidak tersedia dalam referensi lokal.`);
		const object = objects.find((item) => item.kode === row.objectCode);
		if (!object || !isObjectAvailable(object, facility.kode, row.tahun, row.masaPajak)) fail('objek pajak tidak tersedia untuk fasilitas dan masa tersebut.');
		const document = documents.find((item) => item.kode === row.document);
		if (!document) fail(`Document ${row.document} tidak tersedia dalam referensi lokal.`);
		if (row.nitku && !context.ownBranches.some((branch) => branch.nitku === row.nitku)) fail('NITKU pemotong belum terdaftar sebagai cabang akun aktif.');
		const common = {
			id: crypto.randomUUID(), npwpPemotong: owner, masaPajak: row.masaPajak, tahun: row.tahun,
			nomorIdentitasWp: row.tin, fasilitasPajakId: facility.id, kodeObjekPajakId: object.id,
			penghasilanBruto: row.gross, jenisDokumenId: document.id, nomorDokumen: row.documentNumber,
			tanggalDokumen: row.documentDate, nitkuPemotong: row.nitku || null,
			tanggalPemotongan: row.withholdingDate, status: 'SAVEDINVALID' as const,
			diterbitkan: false, nomorPemotongan: null
		};
		if (kind === 'bp21') {
			if (!ptkpEbupotValues.includes(row.ptkp as (typeof ptkpEbupotValues)[number])) fail('StatusTaxExemption tidak valid.');
			if (context.recipientProfile && context.recipientProfile.jenisWp !== 'orang_pribadi') fail('profil penerima BP21 harus Orang Pribadi.');
			const name = context.recipientProfile?.nama || context.knownTaxpayer?.nama;
			if (!name) fail('nama penerima BP21 tidak tercantum dalam template. Daftarkan profil penerima pada Referensi Lokal sebelum impor.');
			if (row.recipientNitku && !(await isRecipientBranch(row.tin, row.recipientNitku))) fail('NITKU penerima tidak cocok dengan cabang penerima lokal.');
			let amounts: Bp21Amounts;
			try {
				const resolved = resolveBp21(object.parameterData, facility.kode, row.ptkp, row.gross, 0);
				amounts = computeBp21Amounts(resolved, row.gross, { dppManual: row.deemed, tarifManual: row.rate, pajakPenghasilanManual: Math.round(row.gross * (row.deemed / 100) * (row.rate / 100)) });
			} catch (cause) { fail(cause instanceof Error ? cause.message : 'Penghitungan BP21 gagal.'); }
			if (amounts.dpp !== row.deemed || amounts.tarif !== row.rate) fail('Deemed/Rate tidak sesuai tarif otomatis referensi lokal; koreksi XML atau pilih fasilitas manual yang benar.');
			statements.push(db.insert(bukti_potong_bp21).values({ ...common, ...amounts, namaPenerima: name, statusPtkp: row.ptkp as (typeof ptkpEbupotValues)[number], nitkuPenerima: row.recipientNitku || null, pendapatanBrutoSebelumnya: 0 }));
		} else {
			const country = countries.find((item) => item.kode === ebupotCountryCodes[row.country]);
			if (row.country && !country) fail(`CounterpartCountry ${row.country} tidak tersedia/aktif di referensi lokal.`);
			let amounts: Bp26Amounts;
			try { amounts = computeBp26Amounts(resolveBp26(object.parameterData, facility.kode, row.gross), row.gross, { dppManual: row.deemed, tarifManual: row.rate }); }
			catch (cause) { fail(cause instanceof Error ? cause.message : 'Penghitungan BP26 gagal.'); }
			if (amounts.dpp !== row.deemed || amounts.tarif !== row.rate) fail('Deemed/Rate tidak sesuai tarif otomatis referensi lokal.');
			statements.push(db.insert(bukti_potong_bp26).values({ ...common, ...amounts, nama: row.name, alamat: row.address, negaraAsalId: country?.id ?? null, tanggalLahir: row.dob, tempatLahir: row.birthCity, nomorPaspor: row.passport, nomorKitasKitap: row.kitas, receiptNumber: row.receipt === '-' ? null : row.receipt || null }));
		}
	}
	// Build every statement only after validation. D1 batch rolls back the whole file on failure.
	await db.batch(statements as [Statement, ...Statement[]]);
	return { imported: rows.length, message: `${rows.length} konsep ${kind.toUpperCase()} dibuat secara lokal. Belum di-Submit atau diterbitkan; bukan upload ke DJP.` };
});
