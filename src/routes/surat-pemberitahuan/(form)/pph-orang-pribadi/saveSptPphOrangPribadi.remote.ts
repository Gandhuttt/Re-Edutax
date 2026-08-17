import { form, getRequestEvent } from '$app/server';
import { booleanRadio, decimalInput, requiredString } from '$lib/helpers/valibot-schema';
import { db, type Statement } from '$lib/server/db';
import {
	spt_pph_orang_pribadi,
	spt_pph_orang_pribadi_sumber_penghasilan
} from '$lib/server/db/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import * as v from 'valibot';
import { hitungInduk, type PtkpStatus } from './components/Induk/hitungPphOrangPribadi';
import { L1Schema, saveLampiranL1 } from './components/L-1/saveLampiranL1.server';

const optionalPicklist = <const T extends string>(options: readonly T[]) =>
	v.optional(v.union([v.picklist(options), v.literal('')]), '');

const SaveSptPphOrangPribadiSchema = v.object({
	id: requiredString('SPT PPh Orang Pribadi'),
	action: v.optional(v.picklist(['Simpan Konsep', 'Simpan Lapor']), 'Simpan Konsep'),

	metodePembukuan: v.optional(
		v.picklist(['pembukuan_akrual', 'pembukuan_kas', 'pencatatan']),
		'pencatatan'
	),
	periodeBulanMulai: v.optional(decimalInput('Bulan awal'), 1),
	periodeBulanSelesai: v.optional(decimalInput('Bulan akhir'), 12),
	// Multi-select, submitted as a JSON array of codes.
	sumberPenghasilan: v.optional(
		v.pipe(
			v.string(),
			v.parseJson(undefined, 'Sumber penghasilan tidak valid'),
			v.array(v.picklist(['kegiatan_usaha', 'pekerjaan', 'pekerjaan_bebas']))
		),
		'[]'
	),

	a7StatusKewajibanSuamiIstri: optionalPicklist(['ph', 'mt']),
	a8NpwpSuamiIstri: v.optional(v.string(), ''),

	b1aPenghasilanPekerjaan: booleanRadio(false),
	b1b1PenghasilanUsaha: booleanRadio(false),
	b1b2Oppt: optionalPicklist(['tidak', 'peredaran_bruto_tertentu', 'pengusaha_tertentu']),
	b1b3Norma: optionalPicklist(['tidak_pembukuan', 'tidak_final_tanpa_pembukuan', 'ya_norma']),
	b1cPenghasilanDalamNegeriLainnya: booleanRadio(false),
	b1dPenghasilanLuarNegeri: booleanRadio(false),

	c3AdaPengurangPenghasilanNeto: booleanRadio(false),
	c5PtkpStatus: optionalPicklist([
		'tk_0',
		'tk_1',
		'tk_2',
		'tk_3',
		'k_0',
		'k_1',
		'k_2',
		'k_3',
		'k_i_0',
		'k_i_1',
		'k_i_2',
		'k_i_3',
		'tidak_berlaku'
	]),
	c8AdaPengurangPphTerutang: booleanRadio(false),

	d10aAdaPphDipotongPihakLain: booleanRadio(false),
	d10bAngsuranPph25: v.optional(decimalInput('Angsuran PPh Pasal 25'), 0),
	d10cStpPph25: v.optional(decimalInput('STP PPh Pasal 25'), 0),
	d10dAdaPengembalianKreditLuarNegeri: booleanRadio(false),
	d10dJumlah: v.optional(decimalInput('Pengembalian kredit PPh luar negeri'), 0),

	e11bAdaSkPengangsuranPenundaan: booleanRadio(false),
	e11bJumlah: v.optional(decimalInput('Jumlah yang diangsur atau ditunda'), 0),

	f12aGantiSptSebelumnya: booleanRadio(false),

	gMetodePengembalian: optionalPicklist(['pemeriksaan', 'pengembalian_pendahuluan']),
	gNomorRekening: v.optional(v.string(), ''),
	gNamaBank: v.optional(v.string(), ''),
	gNamaPemilikRekening: v.optional(v.string(), ''),

	h13aAngsuranTeratur: booleanRadio(false),
	h13bPerhitunganTersendiri: booleanRadio(false),
	h13cAngsuranOppt: booleanRadio(false),

	i14bMemilikiUtang: booleanRadio(false),
	i14cPenghasilanFinal: booleanRadio(false),
	i14dBukanObjekPajak: booleanRadio(false),
	i14ePenyusutanAmortisasiFiskal: booleanRadio(false),
	i14fBiayaEntertainment: booleanRadio(false),
	i14gDividenLuarNegeri: booleanRadio(false),
	i14hKelebihanPphFinal: v.optional(decimalInput('Kelebihan PPh Final'), 0),

	jaLaporanKeuangan: booleanRadio(false),
	jbBuktiZakat: booleanRadio(false),
	jcBuktiPotongLuarNegeri: booleanRadio(false),
	jdSuratKuasaKhusus: booleanRadio(false),
	jeDokumenLainnya: booleanRadio(false),

	penandatangan: v.optional(v.picklist(['wajib_pajak', 'kuasa_wajib_pajak']), 'wajib_pajak'),

	...L1Schema.entries,

	// Amounts fed by lampiran that do not exist yet, so they still travel through
	// the form as zeros. Rows 1.a and 10.a are NOT here: L-1 now supplies them,
	// and they are recomputed server-side from the rows being written rather than
	// trusted from the browser. Each of these drops off this list as its lampiran
	// lands (1.b from L-3A, 1.c from L-3A-4, 1.d from L-2 C, 3 from L-5 A and B,
	// 8 from L-5 C).
	n1b: v.optional(decimalInput('Penghasilan neto dari usaha'), 0),
	n1c: v.optional(decimalInput('Penghasilan dalam negeri lainnya'), 0),
	n1d: v.optional(decimalInput('Penghasilan luar negeri'), 0),
	n3: v.optional(decimalInput('Pengurang penghasilan neto'), 0),
	n8: v.optional(decimalInput('Pengurang PPh terutang'), 0)
});

export const saveSptPphOrangPribadi = form(SaveSptPphOrangPribadiSchema, async (input) => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	const [spt] = await db
		.select({
			id: spt_pph_orang_pribadi.id,
			npwp: spt_pph_orang_pribadi.npwp,
			tahunPajak: spt_pph_orang_pribadi.tahunPajak,
			pembetulanKe: spt_pph_orang_pribadi.pembetulanKe,
			statusDraft: spt_pph_orang_pribadi.statusDraft
		})
		.from(spt_pph_orang_pribadi)
		.where(
			and(eq(spt_pph_orang_pribadi.id, input.id), eq(spt_pph_orang_pribadi.npwp, activeNpwp))
		)
		.limit(1);

	if (!spt) {
		error(404, 'SPT PPh Orang Pribadi tidak ditemukan');
	}

	if (spt.statusDraft !== 'konsep') {
		error(400, 'SPT ini sudah tidak berstatus konsep');
	}

	// Row 12a is read from the SPT being amended, never from the submitted form.
	const f12a =
		spt.pembetulanKe > 0
			? ((
					await db
						.select({ pphKurangLebihBayar: spt_pph_orang_pribadi.pphKurangLebihBayar })
						.from(spt_pph_orang_pribadi)
						.where(
							and(
								eq(spt_pph_orang_pribadi.npwp, spt.npwp),
								eq(spt_pph_orang_pribadi.tahunPajak, spt.tahunPajak),
								eq(spt_pph_orang_pribadi.pembetulanKe, spt.pembetulanKe - 1)
							)
						)
						.limit(1)
				)[0]?.pphKurangLebihBayar ?? 0)
			: 0;

	// L-1 both persists its own rows and reports the figures it feeds upward, all
	// derived from the rows about to be written.
	const lampiran1 = saveLampiranL1(input.id, input);

	const computed = hitungInduk({
		n1a: lampiran1.n1a,
		n1b: Number(input.n1b),
		n1c: Number(input.n1c),
		n1d: Number(input.n1d),
		c3AdaPengurangPenghasilanNeto: input.c3AdaPengurangPenghasilanNeto,
		n3: Number(input.n3),
		c5PtkpStatus: (input.c5PtkpStatus || null) as PtkpStatus | null,
		c8AdaPengurangPphTerutang: input.c8AdaPengurangPphTerutang,
		n8: Number(input.n8),
		d10aAdaPphDipotongPihakLain: input.d10aAdaPphDipotongPihakLain,
		n10a: lampiran1.n10a,
		d10bAngsuranPph25: Number(input.d10bAngsuranPph25),
		d10cStpPph25: Number(input.d10cStpPph25),
		d10dAdaPengembalianKreditLuarNegeri: input.d10dAdaPengembalianKreditLuarNegeri,
		d10dJumlah: Number(input.d10dJumlah),
		e11bAdaSkPengangsuranPenundaan: input.e11bAdaSkPengangsuranPenundaan,
		e11bJumlah: Number(input.e11bJumlah),
		f12a
	});

	// On a pembetulan it is row 12b, the difference against the amended return,
	// that determines what is still payable; on a normal return it is 11c.
	const terutang = spt.pembetulanKe > 0 ? computed.n12b : computed.n11c;

	const statusDraft: 'konsep' | 'menunggu_pembayaran' | 'dilaporkan' =
		input.action === 'Simpan Lapor'
			? terutang > 0
				? 'menunggu_pembayaran'
				: 'dilaporkan'
			: 'konsep';

	// D1 has no real multi-statement transaction over the Workers binding, only
	// db.batch(), so every statement is built upfront and run in one batch.
	const statements: Statement[] = [
		db
			.update(spt_pph_orang_pribadi)
			.set({
				metodePembukuan: input.metodePembukuan,
				periodeBulanMulai: Number(input.periodeBulanMulai),
				periodeBulanSelesai: Number(input.periodeBulanSelesai),
				a7StatusKewajibanSuamiIstri: input.a7StatusKewajibanSuamiIstri || null,
				a8NpwpSuamiIstri: input.a7StatusKewajibanSuamiIstri ? input.a8NpwpSuamiIstri : null,
				b1aPenghasilanPekerjaan: input.b1aPenghasilanPekerjaan,
				b1b1PenghasilanUsaha: input.b1b1PenghasilanUsaha,
				// 1.b.2, 1.b.3 and 1.b.5 are removed from the form entirely when 1.b.1
				// is Tidak, so their answers are cleared rather than kept.
				b1b2Oppt: input.b1b1PenghasilanUsaha ? input.b1b2Oppt || null : null,
				b1b3Norma: input.b1b1PenghasilanUsaha ? input.b1b3Norma || null : null,
				b1cPenghasilanDalamNegeriLainnya: input.b1cPenghasilanDalamNegeriLainnya,
				b1dPenghasilanLuarNegeri: input.b1dPenghasilanLuarNegeri,
				c3AdaPengurangPenghasilanNeto: input.c3AdaPengurangPenghasilanNeto,
				c5PtkpStatus: input.c5PtkpStatus || null,
				c8AdaPengurangPphTerutang: input.c8AdaPengurangPphTerutang,
				d10aAdaPphDipotongPihakLain: input.d10aAdaPphDipotongPihakLain,
				d10bAngsuranPph25: Math.round(Number(input.d10bAngsuranPph25)),
				d10cStpPph25: Math.round(Number(input.d10cStpPph25)),
				d10dAdaPengembalianKreditLuarNegeri: input.d10dAdaPengembalianKreditLuarNegeri,
				d10dJumlah: input.d10dAdaPengembalianKreditLuarNegeri
					? Math.round(Number(input.d10dJumlah))
					: 0,
				e11bAdaSkPengangsuranPenundaan: input.e11bAdaSkPengangsuranPenundaan,
				e11bJumlah: input.e11bAdaSkPengangsuranPenundaan ? Math.round(Number(input.e11bJumlah)) : 0,
				f12aGantiSptSebelumnya: input.f12aGantiSptSebelumnya,
				gMetodePengembalian: input.gMetodePengembalian || null,
				gNomorRekening: input.gNomorRekening,
				gNamaBank: input.gNamaBank,
				gNamaPemilikRekening: input.gNamaPemilikRekening,
				h13aAngsuranTeratur: input.h13aAngsuranTeratur,
				h13bPerhitunganTersendiri: input.h13bPerhitunganTersendiri,
				h13cAngsuranOppt: input.h13cAngsuranOppt,
				i14bMemilikiUtang: input.i14bMemilikiUtang,
				i14cPenghasilanFinal: input.i14cPenghasilanFinal,
				i14dBukanObjekPajak: input.i14dBukanObjekPajak,
				i14ePenyusutanAmortisasiFiskal: input.i14ePenyusutanAmortisasiFiskal,
				i14fBiayaEntertainment: input.i14fBiayaEntertainment,
				i14gDividenLuarNegeri: input.i14gDividenLuarNegeri,
				i14hKelebihanPphFinal: Math.round(Number(input.i14hKelebihanPphFinal)),
				jaLaporanKeuangan: input.jaLaporanKeuangan,
				jbBuktiZakat: input.jbBuktiZakat,
				jcBuktiPotongLuarNegeri: input.jcBuktiPotongLuarNegeri,
				jdSuratKuasaKhusus: input.jdSuratKuasaKhusus,
				jeDokumenLainnya: input.jeDokumenLainnya,
				penandatangan: input.penandatangan,
				pphKurangLebihBayar: Math.round(terutang),
				statusDraft,
				tanggalDilaporkan: statusDraft === 'dilaporkan' ? new Date() : null
			})
			.where(eq(spt_pph_orang_pribadi.id, input.id)),
		// Sumber Penghasilan is a set, so it is replaced wholesale.
		db
			.delete(spt_pph_orang_pribadi_sumber_penghasilan)
			.where(eq(spt_pph_orang_pribadi_sumber_penghasilan.sptPphOrangPribadiId, input.id)),
		...input.sumberPenghasilan.map((kode) =>
			db
				.insert(spt_pph_orang_pribadi_sumber_penghasilan)
				.values({ sptPphOrangPribadiId: input.id, kode })
		),
		...lampiran1.statements
	];

	await db.batch(statements as [Statement, ...Statement[]]);

	if (statusDraft === 'menunggu_pembayaran') {
		redirect(303, '/surat-pemberitahuan/pembayaran');
	}

	if (statusDraft === 'dilaporkan') {
		redirect(303, '/surat-pemberitahuan/laporan');
	}

	redirect(303, '/surat-pemberitahuan/konsep');
});
