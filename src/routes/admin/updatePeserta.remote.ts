import { form } from '$app/server';
import { requiredString } from '$lib/helpers/valibot-schema';
import { requireAdmin } from '$lib/server/admin';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { user, wajib_pajak } from '$lib/server/db/schema';
import { error, invalid } from '@sveltejs/kit';
import { and, eq, ne } from 'drizzle-orm';
import * as v from 'valibot';
import { listPeserta } from './listPeserta.remote';

const UpdatePesertaSchema = v.object({
	userId: requiredString('Peserta'),
	nama: v.pipe(v.string(), v.nonEmpty('Nama harus diisi')),
	email: v.pipe(v.string(), v.nonEmpty('Email harus diisi'), v.email('Email tidak valid')),
	nomorTelepon: v.optional(v.string(), '')
});

export const updatePeserta = form(
	UpdatePesertaSchema,
	async ({ userId, nama, email, nomorTelepon }) => {
		const { headers } = requireAdmin();

		const [target] = await db
			.select({ npwp: user.username, role: user.role })
			.from(user)
			.where(eq(user.id, userId))
			.limit(1);

		if (!target || target.role !== 'user') {
			error(404, 'Peserta tidak ditemukan');
		}

		const [emailBentrok] = await db
			.select({ id: user.id })
			.from(user)
			.where(and(eq(user.email, email.toLowerCase()), ne(user.id, userId)))
			.limit(1);

		if (emailBentrok) {
			invalid(`Email ${email} sudah dipakai akun lain`);
		}

		await auth.api.adminUpdateUser({
			headers,
			body: {
				userId,
				data: { name: nama, email: email.toLowerCase() }
			}
		});

		if (target.npwp) {
			await db
				.update(wajib_pajak)
				.set({ nama, email, nomor_telepon: nomorTelepon || null })
				.where(eq(wajib_pajak.npwp, target.npwp));
		}

		await listPeserta().refresh();

		return { message: `Data ${nama} diperbarui` };
	}
);
