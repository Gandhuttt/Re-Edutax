import { form, getRequestEvent } from '$app/server';
import { computeLabaRugiRows } from '$lib/helpers/labaRugiRollup';
import { decimalString, requiredString } from '$lib/helpers/valibot-schema';
import { db } from '$lib/server/db';
import {
	jenis_pajak_dipotong_dipungut_spt_pph_badan,
	jenis_penghasilan_kredit_pajak_luar_negeri_spt_pph_badan,
	kode_koreksi_fiskal_spt_pph_badan,
	mata_uang_spt_pph_badan,
	negara_spt_pph_badan,
	objek_pajak_spt_pph_badan,
	opini_auditor_spt_pph_badan,
	sektor_usaha_spt_pph_badan,
	spt_pph_badan,
	spt_pph_badan_lampiran_1_akun,
	spt_pph_badan_lampiran_1_laba_rugi,
	spt_pph_badan_lampiran_1_neraca,
	spt_pph_badan_lampiran_1_neraca_akun,
	spt_pph_badan_lampiran_2_afiliasi,
	spt_pph_badan_lampiran_2_pihak,
	spt_pph_badan_lampiran_3_penghasilan_luar_negeri,
	spt_pph_badan_lampiran_3_pph_dipotong,
	spt_pph_badan_lampiran_4_pph_final,
	spt_pph_badan_lampiran_5_pp23_bulanan,
	spt_pph_badan_lampiran_5_pp23_dipotong_bulanan,
	spt_pph_badan_lampiran_5_tku
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
	),
	neraca: jsonRows(
		v.object({
			akunId: requiredString('Akun neraca'),
			nilai: decimalInput('Nilai')
		})
	),
	l3aPengembalianPengurangan: v.optional(
		decimalInput('Pengembalian/pengurangan PPh luar negeri tahun sebelumnya'),
		0
	),
	l3a: jsonRows(
		v.object({
			namaPemberiPenghasilan: requiredString('Nama pemberi penghasilan'),
			negara: requiredString('Negara'),
			tanggal: requiredString('Tanggal'),
			jenisPenghasilan: requiredString('Jenis penghasilan'),
			penghasilanNeto: decimalInput('Penghasilan neto'),
			pphLuarNegeri: decimalInput('PPh luar negeri'),
			mataUang: v.optional(v.string(), ''),
			pphLuarNegeriMataUangAsing: decimalInput('PPh luar negeri (mata uang asing)'),
			kreditPajakYangDapatDikreditkan: decimalInput('Kredit pajak yang dapat dikreditkan'),
			keterangan: v.optional(v.string(), '')
		})
	),
	l3b: jsonRows(
		v.object({
			namaPemotongPemungut: requiredString('Nama pemotong/pemungut pajak'),
			npwp: requiredString('NPWP'),
			jenisPajak: requiredString('Jenis pajak'),
			dpp: decimalInput('DPP'),
			pph: decimalInput('Pajak penghasilan'),
			nomorBukti: requiredString('Nomor bukti pemotongan/SSP/SSPCP'),
			tanggalBukti: requiredString('Tanggal bukti pemotongan/SSP/SSPCP')
		})
	),
	l4a: jsonRows(
		v.object({
			npwpPemotongPemungutPenyetor: v.optional(v.string(), ''),
			namaPemotongPemungutPenyetor: v.optional(v.string(), ''),
			objekPajak: requiredString('Objek pajak'),
			dasarPengenaanPajak: decimalInput('Dasar pengenaan pajak'),
			tarif: decimalInput('Tarif'),
			pphFinalTerutang: decimalInput('PPh final terutang'),
			nomorBuktiPotong: v.optional(v.string(), ''),
			tanggalBuktiPotong: v.optional(v.string(), ''),
			keterangan: v.optional(v.string(), '')
		})
	),
	l5a: jsonRows(
		v.object({
			nitku: requiredString('NI TKU'),
			nama: requiredString('Nama TKU'),
			alamat: v.optional(v.string(), ''),
			kelurahan: v.optional(v.string(), ''),
			kecamatan: v.optional(v.string(), ''),
			kabupaten: v.optional(v.string(), ''),
			provinsi: v.optional(v.string(), ''),
			bulanan: v.array(
				v.object({
					bulan: v.pipe(v.number('Bulan harus berupa angka'), v.integer(), v.minValue(1), v.maxValue(12)),
					jumlahPeredaranBruto: decimalInput('Peredaran bruto')
				})
			)
		})
	),
	l5bDipotong: jsonRows(
		v.object({
			bulan: v.pipe(v.number('Bulan harus berupa angka'), v.integer(), v.minValue(1), v.maxValue(12)),
			nilai: decimalInput('PPh dipotong/dipungut pihak lain')
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

	const neracaTemplate = await db
		.select({ id: spt_pph_badan_lampiran_1_neraca_akun.id, rowType: spt_pph_badan_lampiran_1_neraca_akun.rowType })
		.from(spt_pph_badan_lampiran_1_neraca_akun)
		.where(eq(spt_pph_badan_lampiran_1_neraca_akun.sektorUsahaId, sektorUsahaId));

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
				lampiran3PengembalianPenguranganPphLuarNegeriTahunSebelumnya: Number(
					input.l3aPengembalianPengurangan
				),
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

		const neracaDataAkunIds = new Set(
			neracaTemplate.filter((row) => row.rowType === 'data').map((row) => row.id)
		);

		for (const row of input.neraca) {
			if (!neracaDataAkunIds.has(row.akunId)) continue;

			const values = { nilai: Number(row.nilai) };

			await tx
				.insert(spt_pph_badan_lampiran_1_neraca)
				.values({
					sptPphBadanId: input.id,
					akunId: row.akunId,
					...values
				})
				.onConflictDoUpdate({
					target: [spt_pph_badan_lampiran_1_neraca.sptPphBadanId, spt_pph_badan_lampiran_1_neraca.akunId],
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

		await tx
			.delete(spt_pph_badan_lampiran_3_penghasilan_luar_negeri)
			.where(eq(spt_pph_badan_lampiran_3_penghasilan_luar_negeri.sptPphBadanId, input.id));

		for (const [index, row] of input.l3a.entries()) {
			const negaraId = await getNegaraId(row.negara);
			const jenisPenghasilanId = await getJenisPenghasilanKreditPajakLuarNegeriId(row.jenisPenghasilan);
			const mataUangId = row.mataUang ? await getMataUangId(row.mataUang) : null;

			await tx.insert(spt_pph_badan_lampiran_3_penghasilan_luar_negeri).values({
				sptPphBadanId: input.id,
				nomorUrut: index + 1,
				namaPemberiPenghasilan: row.namaPemberiPenghasilan,
				negaraId,
				tanggal: row.tanggal,
				jenisPenghasilanId,
				penghasilanNeto: Number(row.penghasilanNeto),
				pphLuarNegeri: Number(row.pphLuarNegeri),
				mataUangId,
				pphLuarNegeriMataUangAsing: Number(row.pphLuarNegeriMataUangAsing),
				kreditPajakYangDapatDikreditkan: Number(row.kreditPajakYangDapatDikreditkan),
				keterangan: row.keterangan
			});
		}

		await tx
			.delete(spt_pph_badan_lampiran_3_pph_dipotong)
			.where(eq(spt_pph_badan_lampiran_3_pph_dipotong.sptPphBadanId, input.id));

		for (const [index, row] of input.l3b.entries()) {
			const jenisPajakId = await getJenisPajakDipotongDipungutId(row.jenisPajak);

			await tx.insert(spt_pph_badan_lampiran_3_pph_dipotong).values({
				sptPphBadanId: input.id,
				nomorUrut: index + 1,
				namaPemotongPemungut: row.namaPemotongPemungut,
				npwpPemotongPemungut: row.npwp,
				jenisPajakId,
				dpp: Number(row.dpp),
				pph: Number(row.pph),
				nomorBukti: row.nomorBukti,
				tanggalBukti: row.tanggalBukti
			});
		}

		await tx
			.delete(spt_pph_badan_lampiran_4_pph_final)
			.where(eq(spt_pph_badan_lampiran_4_pph_final.sptPphBadanId, input.id));

		for (const [index, row] of input.l4a.entries()) {
			const objekPajakId = await getObjekPajakId(row.objekPajak);

			await tx.insert(spt_pph_badan_lampiran_4_pph_final).values({
				sptPphBadanId: input.id,
				nomorUrut: index + 1,
				npwpPemotongPemungutPenyetor: row.npwpPemotongPemungutPenyetor,
				namaPemotongPemungutPenyetor: row.namaPemotongPemungutPenyetor,
				objekPajakId,
				dasarPengenaanPajak: Number(row.dasarPengenaanPajak),
				tarif: Number(row.tarif),
				pphFinalTerutang: Number(row.pphFinalTerutang),
				nomorBuktiPotong: row.nomorBuktiPotong,
				tanggalBuktiPotong: row.tanggalBuktiPotong,
				keterangan: row.keterangan
			});
		}

		const existingTku = await tx
			.select({ id: spt_pph_badan_lampiran_5_tku.id })
			.from(spt_pph_badan_lampiran_5_tku)
			.where(eq(spt_pph_badan_lampiran_5_tku.sptPphBadanId, input.id));

		for (const row of existingTku) {
			await tx
				.delete(spt_pph_badan_lampiran_5_pp23_bulanan)
				.where(eq(spt_pph_badan_lampiran_5_pp23_bulanan.tkuId, row.id));
		}

		await tx.delete(spt_pph_badan_lampiran_5_tku).where(eq(spt_pph_badan_lampiran_5_tku.sptPphBadanId, input.id));

		for (const row of input.l5a) {
			const [tku] = await tx
				.insert(spt_pph_badan_lampiran_5_tku)
				.values({
					sptPphBadanId: input.id,
					nitku: row.nitku,
					nama: row.nama,
					alamat: row.alamat,
					kelurahan: row.kelurahan,
					kecamatan: row.kecamatan,
					kabupaten: row.kabupaten,
					provinsi: row.provinsi
				})
				.returning({ id: spt_pph_badan_lampiran_5_tku.id });

			for (const bulanan of row.bulanan) {
				const jumlahPeredaranBruto = Number(bulanan.jumlahPeredaranBruto);
				const jumlahPphFinalTerutang = Math.round(jumlahPeredaranBruto * 0.005);

				await tx.insert(spt_pph_badan_lampiran_5_pp23_bulanan).values({
					tkuId: tku.id,
					bulan: bulanan.bulan,
					jumlahPeredaranBruto,
					jumlahPphFinalTerutang
				});
			}
		}

		await tx
			.delete(spt_pph_badan_lampiran_5_pp23_dipotong_bulanan)
			.where(eq(spt_pph_badan_lampiran_5_pp23_dipotong_bulanan.sptPphBadanId, input.id));

		for (const row of input.l5bDipotong) {
			await tx.insert(spt_pph_badan_lampiran_5_pp23_dipotong_bulanan).values({
				sptPphBadanId: input.id,
				bulan: row.bulan,
				nilai: Number(row.nilai)
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

async function getJenisPenghasilanKreditPajakLuarNegeriId(kode: string) {
	const [jenisPenghasilan] = await db
		.select({ id: jenis_penghasilan_kredit_pajak_luar_negeri_spt_pph_badan.id })
		.from(jenis_penghasilan_kredit_pajak_luar_negeri_spt_pph_badan)
		.where(
			and(
				eq(jenis_penghasilan_kredit_pajak_luar_negeri_spt_pph_badan.kode, kode),
				eq(jenis_penghasilan_kredit_pajak_luar_negeri_spt_pph_badan.aktif, true)
			)
		)
		.limit(1);

	if (!jenisPenghasilan) {
		error(400, 'Jenis penghasilan tidak valid');
	}

	return jenisPenghasilan.id;
}

async function getMataUangId(kode: string) {
	const [mataUang] = await db
		.select({ id: mata_uang_spt_pph_badan.id })
		.from(mata_uang_spt_pph_badan)
		.where(and(eq(mata_uang_spt_pph_badan.kode, kode), eq(mata_uang_spt_pph_badan.aktif, true)))
		.limit(1);

	if (!mataUang) {
		error(400, 'Mata uang tidak valid');
	}

	return mataUang.id;
}

async function getJenisPajakDipotongDipungutId(kode: string) {
	const [jenisPajak] = await db
		.select({ id: jenis_pajak_dipotong_dipungut_spt_pph_badan.id })
		.from(jenis_pajak_dipotong_dipungut_spt_pph_badan)
		.where(
			and(
				eq(jenis_pajak_dipotong_dipungut_spt_pph_badan.kode, kode),
				eq(jenis_pajak_dipotong_dipungut_spt_pph_badan.aktif, true)
			)
		)
		.limit(1);

	if (!jenisPajak) {
		error(400, 'Jenis pajak tidak valid');
	}

	return jenisPajak.id;
}

async function getObjekPajakId(kode: string) {
	const [objekPajak] = await db
		.select({ id: objek_pajak_spt_pph_badan.id })
		.from(objek_pajak_spt_pph_badan)
		.where(and(eq(objek_pajak_spt_pph_badan.kode, kode), eq(objek_pajak_spt_pph_badan.aktif, true)))
		.limit(1);

	if (!objekPajak) {
		error(400, 'Objek pajak tidak valid');
	}

	return objekPajak.id;
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
