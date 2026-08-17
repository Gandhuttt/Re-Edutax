import { form, getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { spt_pph_orang_pribadi } from '$lib/server/db/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import * as v from 'valibot';

// The PTKP amounts and the progressive tariff implemented in the Induk engine are
// tax-year-2025 figures, so creation is restricted to that year until another is
// verified against the source. Same restriction as the Badan side.
const SUPPORTED_TAHUN_PAJAK = 2025;

const NewSptPphOrangPribadiSchema = v.object({
	tahunPajak: v.pipe(
		v.string(),
		v.nonEmpty('Tahun pajak'),
		v.transform(Number),
		v.integer('Tahun pajak harus berupa bilangan bulat'),
		v.value(SUPPORTED_TAHUN_PAJAK, `Tahun pajak yang didukung saat ini hanya ${SUPPORTED_TAHUN_PAJAK}`)
	)
});

export const newSptPphOrangPribadi = form(NewSptPphOrangPribadiSchema, async ({ tahunPajak }) => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	let [existing] = await db
		.select({ id: spt_pph_orang_pribadi.id })
		.from(spt_pph_orang_pribadi)
		.where(
			and(
				eq(spt_pph_orang_pribadi.npwp, activeNpwp),
				eq(spt_pph_orang_pribadi.tahunPajak, tahunPajak),
				eq(spt_pph_orang_pribadi.pembetulanKe, 0)
			)
		)
		.limit(1);

	if (!existing) {
		[existing] = await db
			.insert(spt_pph_orang_pribadi)
			.values({
				npwp: activeNpwp,
				tahunPajak,
				// Pencatatan is the default the captured draft used, and it is the
				// common case for an orang pribadi.
				metodePembukuan: 'pencatatan',
				periodeBulanMulai: 1,
				periodeBulanSelesai: 12
			})
			.returning({ id: spt_pph_orang_pribadi.id });
	}

	redirect(303, `/surat-pemberitahuan/pph-orang-pribadi?id=${existing.id}`);
});
