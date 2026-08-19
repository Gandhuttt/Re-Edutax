import { getRequestEvent, query } from '$app/server';
import { db } from '$lib/server/db';
import {
	spt_pph_orang_pribadi,
	spt_pph_orang_pribadi_sumber_penghasilan,
	wajib_pajak
} from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { getLampiranL1 } from './components/L-1/getLampiranL1.server';
import { getLampiranL2 } from './components/L-2/getLampiranL2.server';
import { getLampiranL3A } from './components/L-3A/getLampiranL3A.server';
import { getLampiranL3A4 } from './components/L-3A-4/getLampiranL3A4.server';
import { getLampiranL3B } from './components/L-3B/getLampiranL3B.server';
import { getLampiranL4 } from './components/L-4/getLampiranL4.server';
import { getLampiranL3C } from './components/L-3C/getLampiranL3C.server';
import { getLampiranL3D } from './components/L-3D/getLampiranL3D.server';
import { getLampiranL5 } from './components/L-5/getLampiranL5.server';

export const getSptPphOrangPribadi = query(async () => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;
	const id = event.url.searchParams.get('id');

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	if (!id) {
		error(400, 'SPT PPh Orang Pribadi tidak dipilih');
	}

	const [spt] = await db
		.select()
		.from(spt_pph_orang_pribadi)
		.where(and(eq(spt_pph_orang_pribadi.id, id), eq(spt_pph_orang_pribadi.npwp, activeNpwp)))
		.limit(1);

	if (!spt) {
		error(404, 'SPT PPh Orang Pribadi tidak ditemukan');
	}

	const [
		identitas,
		sumberPenghasilan,
		lampiran1,
		lampiran2,
		lampiran3a,
		lampiran3a4,
		lampiran3b,
		lampiran4,
		lampiran3c,
		lampiran3d,
		lampiran5,
		previousVersion
	] = await Promise.all([
		// Section A rows 1 to 6 are prefilled read-only rather than stored on the SPT.
		db
			.select({
				npwp: wajib_pajak.npwp,
				nama: wajib_pajak.nama,
				email: wajib_pajak.email,
				nomorTelepon: wajib_pajak.nomor_telepon
			})
			.from(wajib_pajak)
			.where(eq(wajib_pajak.npwp, activeNpwp))
			.limit(1)
			.then((rows) => rows[0] ?? null),
		db
			.select({ kode: spt_pph_orang_pribadi_sumber_penghasilan.kode })
			.from(spt_pph_orang_pribadi_sumber_penghasilan)
			.where(eq(spt_pph_orang_pribadi_sumber_penghasilan.sptPphOrangPribadiId, id)),
		getLampiranL1(id),
		getLampiranL2(id),
		getLampiranL3A(id),
		getLampiranL3A4(id),
		getLampiranL3B(id),
		getLampiranL4(id),
		getLampiranL3C(id),
		getLampiranL3D(id),
		getLampiranL5(id, spt.tahunPajak),
		// Row 12a is read from the SPT being amended rather than typed, matching the
		// Badan pembetulan mechanic.
		spt.pembetulanKe > 0
			? db
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
					.then((rows) => rows[0] ?? null)
			: Promise.resolve(null)
	]);

	return {
		readonly: spt.statusDraft !== 'konsep',
		spt: {
			...spt,
			previousPphKurangLebihBayar: previousVersion?.pphKurangLebihBayar ?? null
		},
		identitas,
		sumberPenghasilan: sumberPenghasilan.map((row) => row.kode),
		lampiran1,
		lampiran2,
		lampiran3a,
		lampiran3a4,
		lampiran3b,
		lampiran4,
		lampiran3c,
		lampiran3d,
		lampiran5
	};
});
