import { form, getRequestEvent } from '$app/server';
import { booleanRadio, decimalInput, requiredString } from '$lib/helpers/valibot-schema';
import { db } from '$lib/server/db';
import { opini_auditor_spt_pph_badan, sektor_usaha_spt_pph_badan, spt_pph_badan } from '$lib/server/db/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import * as v from 'valibot';
import { L1Schema, saveLampiranL1 } from './components/L1/saveLampiranL1.server';
import { L2Schema, saveLampiranL2 } from './components/L2/saveLampiranL2.server';
import { L3Schema, saveLampiranL3 } from './components/L3/saveLampiranL3.server';
import { L4Schema, saveLampiranL4 } from './components/L4/saveLampiranL4.server';
import { L5Schema, saveLampiranL5 } from './components/L5/saveLampiranL5.server';

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
	l3aPengembalianPengurangan: v.optional(decimalInput('Pengembalian/pengurangan PPh luar negeri tahun sebelumnya'), 0),
	...L1Schema.entries,
	...L2Schema.entries,
	...L3Schema.entries,
	...L4Schema.entries,
	...L5Schema.entries
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

	await db.transaction(async (tx) => {
		const pphKurangLebihBayar = await saveLampiranL1(tx, input.id, sektorUsahaId, {
			labaRugi: input.labaRugi,
			neraca: input.neraca
		});

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
				lampiran3PengembalianPenguranganPphLuarNegeriTahunSebelumnya: Number(input.l3aPengembalianPengurangan),
				statusDraft,
				tanggalDilaporkan: statusDraft === 'dilaporkan' ? new Date() : null
			})
			.where(eq(spt_pph_badan.id, input.id));

		await saveLampiranL2(tx, input.id, { l2a: input.l2a, l2b: input.l2b });
		await saveLampiranL3(tx, input.id, { l3a: input.l3a, l3b: input.l3b });
		await saveLampiranL4(tx, input.id, { l4a: input.l4a, l4b: input.l4b });
		await saveLampiranL5(tx, input.id, { l5a: input.l5a, l5bDipotong: input.l5bDipotong });
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
		.where(and(eq(opini_auditor_spt_pph_badan.kode, kode), eq(opini_auditor_spt_pph_badan.aktif, true)))
		.limit(1);

	if (!opiniAuditor) {
		error(400, 'Opini auditor tidak valid');
	}

	return opiniAuditor.id;
}

async function getSektorUsahaId(kode: string) {
	if (!kode) {
		error(400, 'Sektor usaha harus dipilih');
	}

	const [sektorUsaha] = await db
		.select({ id: sektor_usaha_spt_pph_badan.id })
		.from(sektor_usaha_spt_pph_badan)
		.where(and(eq(sektor_usaha_spt_pph_badan.kode, kode), eq(sektor_usaha_spt_pph_badan.aktif, true)))
		.limit(1);

	if (!sektorUsaha) {
		error(400, 'Sektor usaha tidak valid');
	}

	return sektorUsaha.id;
}
