import { form } from '$app/server';
import { booleanRadio } from '$lib/helpers/valibot-schema';
import { requiredString } from '$lib/helpers/valibot-schema';
import { requireAdmin } from '$lib/server/admin';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';
import { listPeserta } from './listPeserta.remote';

const SetPesertaBannedSchema = v.object({
	userId: requiredString('Peserta'),
	banned: booleanRadio(false)
});

/**
 * Blocking login is the safe alternative to deleting a peserta who already has SPT or
 * faktur data attached to their NPWP.
 */
export const setPesertaBanned = form(SetPesertaBannedSchema, async ({ userId, banned }) => {
	const { headers } = requireAdmin();

	const [target] = await db
		.select({ nama: user.name, role: user.role })
		.from(user)
		.where(eq(user.id, userId))
		.limit(1);

	if (!target || target.role !== 'user') {
		error(404, 'Peserta tidak ditemukan');
	}

	if (banned) {
		await auth.api.banUser({
			headers,
			body: { userId, banReason: 'Dinonaktifkan oleh administrator' }
		});
	} else {
		await auth.api.unbanUser({ headers, body: { userId } });
	}

	await listPeserta().refresh();

	return { message: `${target.nama} ${banned ? 'dinonaktifkan' : 'diaktifkan kembali'}` };
});
