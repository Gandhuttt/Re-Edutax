import { form, getRequestEvent } from '$app/server';
import { computeLabaRugiRows } from '$lib/helpers/labaRugiRollup';
import { decimalString, requiredString } from '$lib/helpers/valibot-schema';
import { db } from '$lib/server/db';
import {
	kode_koreksi_fiskal_spt_pph_badan,
	negara_spt_pph_badan,
	opini_auditor_spt_pph_badan,
	sektor_usaha_spt_pph_badan,
	spt_pph_badan,
	spt_pph_badan_lampiran_1_akun,
	spt_pph_badan_lampiran_1_laba_rugi,
	spt_pph_badan_lampiran_2_afiliasi,
	spt_pph_badan_lampiran_2_pihak
} from '$lib/server/db/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import * as v from 'valibot';

const decimalInput = (field: string) => v.union([decimalString(field), v.number(`${field} harus berupa angka`)]);

const booleanRadio = (fallback: boolean) =>
	v.optional(
		v.union([v.boolean(), v.pipe(v.picklist(['true', 'false']), v.transform((value) => value === 'true'))]),
		fallback
	);

const jsonRows = <TItem extends v.GenericSchema>(itemSchema: TItem) =>
	v.optional(v.pipe(v.string(), v.parseJson(undefined, 'Data tidak valid'), v.array(itemSchema)), '[]');

const SaveSptPphBadanSchema = v.object({
	id: requiredString('SPT PPh Badan'),
	action: v.optional(v.picklist(['Simpan Konsep', 'Simpan Lapor']), 'Simpan Konsep'),
	metodePembukuan: v.optional(v.picklist(['akrual', 'kas']), 'akrual'),
	sektorUsaha: requiredString('Sektor usaha'),
	diaudit: booleanRadio(false),
	opiniAuditor: v.optional(v.string(), ''),
	npwpKantorAkuntanPublik: v.optional(v.string(), ''),
	namaKantorAkuntanPublik: v.optional(v.string(), ''),
	menerimaPenghasilanPp23: booleanRadio(false),
	hanyaPenghasilanPp23: booleanRadio(false),
	menerimaPenghasilanFinal: booleanRadio(false),
	menerimaPenghasilanBukanObjekPajak: booleanRadio(false),
	l2a: jsonRows(
		v.object({
			nama: requiredString('Nama'),
			alamat: v.optional(v.string(), ''),
			negara: v.optional(v.string(), ''),
			npwp: v.optional(v.string(), ''),
			jabatan: v.optional(v.string(), ''),
			nilaiModal: decimalInput('Nilai modal disetor'),
			persentase: decimalInput('Persentase modal disetor'),
			dividen: decimalInput('Dividen/pembagian laba')
		})
	),
	l2b: jsonRows(
		v.object({
			nama: requiredString('Nama'),
			negara: v.optional(v.string(), ''),
			npwp: v.optional(v.string(), ''),
			modalNilai: decimalInput('Penyertaan modal'),
			modalPersen: decimalInput('Penyertaan modal (%)'),
			utangNilai: decimalInput('Utang'),
			utangTahun: decimalInput('Tahun utang'),
			utangBunga: decimalInput('Bunga utang/tahun'),
			piutangNilai: decimalInput('Piutang'),
			piutangTahun: decimalInput('Tahun piutang'),
			piutangBunga: decimalInput('Bunga piutang/tahun')
		})
	),
	labaRugi: jsonRows(
		v.object({
			akunId: requiredString('Akun laba rugi'),
			nilaiKomersial: decimalInput('Nilai komersial'),
			nonObjekPajak: decimalInput('Non objek pajak'),
			dikenakanPphFinal: decimalInput('Dikenakan PPh final'),
			penyesuaianFiskalPositif: decimalInput('Penyesuaian fiskal positif'),
			penyesuaianFiskalNegatif: decimalInput('Penyesuaian fiskal negatif'),
			kodePenyesuaianFiskal: v.optional(v.string(), '')
		})
	)
});

export const saveSptPphBadan = form(SaveSptPphBadanSchema, async (input) => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	const [spt] = await db
		.select({ id: spt_pph_badan.id })
		.from(spt_pph_badan)
		.where(
			and(
				eq(spt_pph_badan.id, input.id),
				eq(spt_pph_badan.npwp, activeNpwp),
				eq(spt_pph_badan.statusDraft, 'konsep')
			)
		)
		.limit(1);

	if (!spt) {
		error(404, 'Konsep SPT PPh Badan tidak ditemukan');
	}

	const statusDraft = input.action === 'Simpan Lapor' ? 'dilaporkan' : 'konsep';
	const sektorUsahaId = await getSektorUsahaId(input.sektorUsaha);
	const opiniAuditorId = await getOpiniAuditorId(input.diaudit, input.opiniAuditor);

	const labaRugiTemplate = await db
		.select({
			id: spt_pph_badan_lampiran_1_akun.id,
			nomorUrut: spt_pph_badan_lampiran_1_akun.nomorUrut,
			kode: spt_pph_badan_lampiran_1_akun.kode,
			namaAkun: spt_pph_badan_lampiran_1_akun.namaAkun,
			rowType: spt_pph_badan_lampiran_1_akun.rowType,
			classification: spt_pph_badan_lampiran_1_akun.classification,
			parentKode: spt_pph_badan_lampiran_1_akun.parentKode,
			sign: spt_pph_badan_lampiran_1_akun.sign
		})
		.from(spt_pph_badan_lampiran_1_akun)
		.where(eq(spt_pph_badan_lampiran_1_akun.sektorUsahaId, sektorUsahaId));

	const pphKurangLebihBayar =
		computeLabaRugiRows(
			labaRugiTemplate,
			input.labaRugi.map((row) => ({
				akunId: row.akunId,
				nilaiKomersial: Number(row.nilaiKomersial),
				nonObjekPajak: Number(row.nonObjekPajak),
				dikenakanPphFinal: Number(row.dikenakanPphFinal),
				penyesuaianFiskalPositif: Number(row.penyesuaianFiskalPositif),
				penyesuaianFiskalNegatif: Number(row.penyesuaianFiskalNegatif),
				kodePenyesuaianFiskal: row.kodePenyesuaianFiskal
			}))
		).find((row) => row.kode === '4800')?.nilaiFiskal ?? 0;

	await db.transaction(async (tx) => {
		await tx
			.update(spt_pph_badan)
			.set({
				metodePembukuan: input.metodePembukuan,
				sektorUsahaId,
				diaudit: input.diaudit,
				opiniAuditorId,
				npwpKantorAkuntanPublik: input.diaudit ? input.npwpKantorAkuntanPublik : null,
				namaKantorAkuntanPublik: input.diaudit ? input.namaKantorAkuntanPublik : null,
				menerimaPenghasilanPp23: input.menerimaPenghasilanPp23,
				hanyaPenghasilanPp23: input.hanyaPenghasilanPp23,
				menerimaPenghasilanFinal: input.menerimaPenghasilanFinal,
				menerimaPenghasilanBukanObjekPajak: input.menerimaPenghasilanBukanObjekPajak,
				pphKurangLebihBayar,
				statusDraft,
				tanggalDilaporkan: statusDraft === 'dilaporkan' ? new Date() : null
			})
			.where(eq(spt_pph_badan.id, input.id));

		const dataAkunIds = new Set(
			labaRugiTemplate.filter((row) => row.rowType === 'data').map((row) => row.id)
		);

		for (const row of input.labaRugi) {
			if (!dataAkunIds.has(row.akunId)) continue;

			const kodePenyesuaianFiskalId = row.kodePenyesuaianFiskal
				? await getKodePenyesuaianFiskalId(row.kodePenyesuaianFiskal)
				: null;

			const values = {
				nilaiKomersial: Number(row.nilaiKomersial),
				nonObjekPajak: Number(row.nonObjekPajak),
				dikenakanPphFinal: Number(row.dikenakanPphFinal),
				penyesuaianFiskalPositif: Number(row.penyesuaianFiskalPositif),
				penyesuaianFiskalNegatif: Number(row.penyesuaianFiskalNegatif),
				kodePenyesuaianFiskalId
			};

			await tx
				.insert(spt_pph_badan_lampiran_1_laba_rugi)
				.values({
					sptPphBadanId: input.id,
					akunId: row.akunId,
					...values
				})
				.onConflictDoUpdate({
					target: [
						spt_pph_badan_lampiran_1_laba_rugi.sptPphBadanId,
						spt_pph_badan_lampiran_1_laba_rugi.akunId
					],
					set: values
				});
		}

		await tx
			.delete(spt_pph_badan_lampiran_2_pihak)
			.where(
				and(
					eq(spt_pph_badan_lampiran_2_pihak.sptPphBadanId, input.id),
					eq(spt_pph_badan_lampiran_2_pihak.jenis, 'pemegang_saham')
				)
			);

		for (const [index, row] of input.l2a.entries()) {
			const negaraId = row.negara ? await getNegaraId(row.negara) : null;

			await tx.insert(spt_pph_badan_lampiran_2_pihak).values({
				sptPphBadanId: input.id,
				jenis: 'pemegang_saham',
				nomorUrut: index + 1,
				nama: row.nama,
				alamat: row.alamat,
				negaraId,
				npwpNikTin: row.npwp,
				jabatan: row.jabatan,
				modalSahamNominal: Number(row.nilaiModal),
				modalSahamPersentase: Number(row.persentase),
				dividenDiterima: Number(row.dividen)
			});
		}

		await tx
			.delete(spt_pph_badan_lampiran_2_afiliasi)
			.where(eq(spt_pph_badan_lampiran_2_afiliasi.sptPphBadanId, input.id));

		for (const [index, row] of input.l2b.entries()) {
			const negaraId = row.negara ? await getNegaraId(row.negara) : null;

			await tx.insert(spt_pph_badan_lampiran_2_afiliasi).values({
				sptPphBadanId: input.id,
				nomorUrut: index + 1,
				namaPihakAfiliasi: row.nama,
				negaraId,
				npwpTin: row.npwp,
				penyertaanModalNilai: Number(row.modalNilai),
				penyertaanModalPersentase: Number(row.modalPersen),
				utangNilai: Number(row.utangNilai),
				utangTahun: Number(row.utangTahun),
				utangBungaPersentase: Number(row.utangBunga),
				piutangNilai: Number(row.piutangNilai),
				piutangTahun: Number(row.piutangTahun),
				piutangBungaPersentase: Number(row.piutangBunga)
			});
		}
	});

	redirect(303, statusDraft === 'dilaporkan' ? '/surat-pemberitahuan/laporan' : '/surat-pemberitahuan/konsep');
});

async function getOpiniAuditorId(diaudit: boolean, kode: string) {
	if (!diaudit) return null;

	if (!kode) {
		error(400, 'Opini auditor harus dipilih');
	}

	const [opiniAuditor] = await db
		.select({ id: opini_auditor_spt_pph_badan.id })
		.from(opini_auditor_spt_pph_badan)
		.where(
			and(
				eq(opini_auditor_spt_pph_badan.kode, kode),
				eq(opini_auditor_spt_pph_badan.aktif, true)
			)
		)
		.limit(1);

	if (!opiniAuditor) {
		error(400, 'Opini auditor tidak valid');
	}

	return opiniAuditor.id;
}

async function getNegaraId(kode: string) {
	const [negara] = await db
		.select({ id: negara_spt_pph_badan.id })
		.from(negara_spt_pph_badan)
		.where(and(eq(negara_spt_pph_badan.kode, kode), eq(negara_spt_pph_badan.aktif, true)))
		.limit(1);

	if (!negara) {
		error(400, 'Negara tidak valid');
	}

	return negara.id;
}

async function getKodePenyesuaianFiskalId(kode: string) {
	const [kodeKoreksiFiskal] = await db
		.select({ id: kode_koreksi_fiskal_spt_pph_badan.id })
		.from(kode_koreksi_fiskal_spt_pph_badan)
		.where(
			and(eq(kode_koreksi_fiskal_spt_pph_badan.kode, kode), eq(kode_koreksi_fiskal_spt_pph_badan.aktif, true))
		)
		.limit(1);

	if (!kodeKoreksiFiskal) {
		error(400, 'Kode penyesuaian fiskal tidak valid');
	}

	return kodeKoreksiFiskal.id;
}

async function getSektorUsahaId(kode: string) {
	if (!kode) {
		error(400, 'Sektor usaha harus dipilih');
	}

	const [sektorUsaha] = await db
		.select({ id: sektor_usaha_spt_pph_badan.id })
		.from(sektor_usaha_spt_pph_badan)
		.where(
			and(
				eq(sektor_usaha_spt_pph_badan.kode, kode),
				eq(sektor_usaha_spt_pph_badan.aktif, true)
			)
		)
		.limit(1);

	if (!sektorUsaha) {
		error(400, 'Sektor usaha tidak valid');
	}

	return sektorUsaha.id;
}
