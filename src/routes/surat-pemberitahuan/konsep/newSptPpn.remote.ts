import { form, getRequestEvent } from '$app/server';
import { error, redirect } from '@sveltejs/kit';
import * as v from 'valibot';
import { getOrCreateSptPpnForPeriod } from '../(form)/ppn/server/getOrCreateCurrentSptPpn.server';
import { getTaxpayerForSptPpn } from '../(form)/ppn/server/getTaxpayerForSptPpn.server';

const numericField = (message: string, min: number, max: number) =>
	v.pipe(
		v.string(),
		v.nonEmpty(message),
		v.transform(Number),
		v.integer(`${message} harus berupa bilangan bulat`),
		v.minValue(min, `${message} tidak valid`),
		v.maxValue(max, `${message} tidak valid`)
	);

const NewSptPpnSchema = v.object({
	masaPajak: numericField('Masa pajak', 1, 12),
	tahun: numericField('Tahun', 2000, 2100)
});

export const newSptPpn = form(NewSptPpnSchema, async ({ masaPajak, tahun }) => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	const taxpayer = await getTaxpayerForSptPpn(activeNpwp);
	const sptPpn = await getOrCreateSptPpnForPeriod(activeNpwp, taxpayer.nama, masaPajak, tahun);

	redirect(303, `/surat-pemberitahuan/ppn?id=${sptPpn.id}`);
});
