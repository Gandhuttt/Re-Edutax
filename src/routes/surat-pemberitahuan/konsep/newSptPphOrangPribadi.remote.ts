import { form, getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { spt_pph_orang_pribadi } from '$lib/server/db/schema';
import { error, redirect } from '@sveltejs/kit';
import * as v from 'valibot';
import { TAHUN_SPT } from './tahunSpt';

const NewSptPphOrangPribadiSchema = v.object({
	tahunPajak: v.pipe(
		v.string(),
		v.nonEmpty('Tahun pajak'),
		v.transform(Number),
		v.integer('Tahun pajak harus berupa bilangan bulat'),
		v.picklist(TAHUN_SPT, `Tahun pajak yang didukung: ${TAHUN_SPT.join(', ')}`)
	)
});

export const newSptPphOrangPribadi = form(NewSptPphOrangPribadiSchema, async ({ tahunPajak }) => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	// Every call opens a new normal SPT (pembetulanKe 0): a taxpayer may file more than
	// one per tahun pajak. Amendments are a separate flow (newPembetulanSptPphOrangPribadi).
	const [created] = await db
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

	redirect(303, `/surat-pemberitahuan/pph-orang-pribadi?id=${created.id}`);
});
