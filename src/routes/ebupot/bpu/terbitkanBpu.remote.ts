import { form, getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { bukti_potong_bpu } from '$lib/server/db/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import * as v from 'valibot';

// Simulated Terbitkan: this app never calls the real Coretax issuance
// action. Requires status SUBMITTED (a draft must go through Submit first,
// matching the real Simpan Konsep -> Submit -> Terbitkan order) and assigns
// a Nomor Pemotongan. Once issued the slip is locked (see updateBpu's
// diterbitkan=false guard) and becomes visible to the recipient's own
// "Bukti Potong Saya" recap. Usable both from the list (per-row action,
// like Hapus) and from the detail page via .for(id).
const generateNomorPemotongan = () => {
	const random = crypto.getRandomValues(new Uint32Array(1))[0];
	return String(random).padStart(10, '0').slice(0, 10);
};

const TerbitkanBpuSchema = v.object({ id: v.string() });

export const terbitkanBpu = form(TerbitkanBpuSchema, async ({ id }) => {
	const event = getRequestEvent();
	const activeNpwp = event.locals.user?.username;

	if (!activeNpwp) {
		error(401, 'Belum login');
	}

	const [existing] = await db
		.select({ id: bukti_potong_bpu.id, status: bukti_potong_bpu.status })
		.from(bukti_potong_bpu)
		.where(
			and(
				eq(bukti_potong_bpu.id, id),
				eq(bukti_potong_bpu.npwpPemotong, activeNpwp),
				eq(bukti_potong_bpu.diterbitkan, false)
			)
		)
		.limit(1);

	if (!existing) {
		error(404, 'BPU draft tidak ditemukan');
	}

	if (existing.status !== 'SUBMITTED') {
		error(400, 'BPU harus di-submit terlebih dahulu sebelum diterbitkan');
	}

	await db
		.update(bukti_potong_bpu)
		.set({ diterbitkan: true, nomorPemotongan: generateNomorPemotongan() })
		.where(eq(bukti_potong_bpu.id, id));

	redirect(303, '/ebupot/bpu');
});
