import { form, getRequestEvent } from '$app/server';
import { MP_EDITABLE_STATUSES, isAllowedMpPeriod } from '$lib/helpers/mp-parity';
import { db } from '$lib/server/db';
import { bukti_potong_mp } from '$lib/server/db/schema';
import { prepareMp } from '$lib/server/ebupot/mpService';
import { error, invalid, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import * as v from 'valibot';

type IssueArg = Exclude<Parameters<typeof invalid>[number], string>;

const optionalText = v.optional(v.string(), '');

const UpdateMpSchema = v.object({
	intent: v.optional(v.picklist(['draft', 'submit']), 'draft'),
	periode: v.pipe(v.string(), v.regex(/^\d{4}-\d{2}$/, 'Masa pajak harus dipilih')),
	pegawaiAsing: v.optional(v.picklist(['true', 'false']), 'false'),
	nomorIdentitasWp: optionalText,
	nama: optionalText,
	nitkuPemotong: optionalText,
	statusPtkp: optionalText,
	jabatan: optionalText,
	kodeObjekPajakId: optionalText,
	fasilitasPajakId: optionalText,
	// Shape/finite checks live in prepareMp so the importer shares them.
	penghasilanBruto: v.optional(v.pipe(v.string(), v.transform((value) => value.replaceAll('.', '').trim())), ''),
	tarifManual: optionalText,
	pajakPenghasilanManual: v.optional(
		v.pipe(v.string(), v.transform((value) => value.replaceAll('.', '').trim())),
		''
	)
});

export const updateMp = form(UpdateMpSchema, async (input, issue) => {
	const event = getRequestEvent();
	const owner = event.locals.user?.username;
	const id = event.params.id;

	if (!owner) error(401, 'Belum login');
	if (!id) error(400, 'Bad id');

	const [existing] = await db
		.select()
		.from(bukti_potong_mp)
		.where(
			and(
				eq(bukti_potong_mp.id, id),
				eq(bukti_potong_mp.npwpPemotong, owner),
				eq(bukti_potong_mp.diterbitkan, false)
			)
		)
		.limit(1);

	if (!existing) error(404, 'MP draft tidak ditemukan');
	if (!MP_EDITABLE_STATUSES.includes(existing.status)) {
		error(409, 'MP pada status ini tidak dapat diubah');
	}

	const isSubmit = input.intent === 'submit';
	const tahun = Number(input.periode.slice(0, 4));
	const masaPajak = Number(input.periode.slice(5, 7));

	// Coretax locks the period of an already-saved MP; only a legacy out-of-range period may be corrected.
	if (
		existing.status !== 'NORMAL' &&
		isAllowedMpPeriod(existing.tahun, existing.masaPajak) &&
		(tahun !== existing.tahun || masaPajak !== existing.masaPajak)
	) {
		invalid(issue.periode('Masa pajak MP yang sudah disimpan tidak dapat diubah'));
	}
	const { errors, values } = await prepareMp(
		owner,
		{
			tahun,
			masaPajak,
			pegawaiAsing: input.pegawaiAsing === 'true',
			// Not editable here (no Coretax MP field); keep what an import stored.
			nomorPaspor: existing.nomorPaspor,
			nomorIdentitasWp: input.nomorIdentitasWp,
			nama: input.nama,
			nitkuPemotong: input.nitkuPemotong,
			statusPtkp: input.statusPtkp,
			jabatan: input.jabatan,
			kodeObjekPajakId: input.kodeObjekPajakId,
			fasilitasPajakId: input.fasilitasPajakId,
			penghasilanBruto: input.penghasilanBruto,
			tarifManual: input.tarifManual,
			pajakPenghasilanManual: input.pajakPenghasilanManual,
			tanggalPemotongan: existing.tanggalPemotongan
		},
		{ submit: isSubmit, existing }
	);

	if (errors.length > 0) {
		// prepareMp reports plain field names; map them onto the typed issue builders.
		const fields = issue as unknown as Record<string, ((message: string) => IssueArg) | undefined>;
		invalid(...errors.map((e) => fields[e.field]?.(e.message) ?? e.message));
	}

	// Guarded update: the row must still be this owner's, unissued and in the status we
	// validated against, so a stale save cannot clobber a concurrent transition.
	const updated = await db
		.update(bukti_potong_mp)
		.set({
			...values,
			// Draft always resets to "Disimpan Tidak Valid"; only a complete Submit validates.
			status: isSubmit ? 'SUBMITTED' : 'SAVEDINVALID'
		})
		.where(
			and(
				eq(bukti_potong_mp.id, id),
				eq(bukti_potong_mp.npwpPemotong, owner),
				eq(bukti_potong_mp.diterbitkan, false),
				eq(bukti_potong_mp.status, existing.status)
			)
		)
		.returning({ id: bukti_potong_mp.id });

	if (updated.length === 0) {
		invalid('MP sudah berubah atau diterbitkan dari sesi lain. Muat ulang halaman sebelum menyimpan.');
	}

	redirect(303, '/ebupot/mp');
});
