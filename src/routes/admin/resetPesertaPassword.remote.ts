import { form } from '$app/server';
import { requiredString } from '$lib/helpers/valibot-schema';
import { requireAdmin } from '$lib/server/admin';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';

const ResetPesertaPasswordSchema = v.object({
	userId: requiredString('Peserta'),
	_password: v.pipe(
		v.string(),
		v.nonEmpty('Password baru harus diisi'),
		v.minLength(3, 'Password minimal 3 karakter')
	)
});

export const resetPesertaPassword = form(
	ResetPesertaPasswordSchema,
	async ({ userId, _password }) => {
		const { headers } = requireAdmin();

		const [target] = await db
			.select({ nama: user.name, role: user.role })
			.from(user)
			.where(eq(user.id, userId))
			.limit(1);

		if (!target || target.role !== 'user') {
			error(404, 'Peserta tidak ditemukan');
		}

		await auth.api.setUserPassword({
			headers,
			body: { userId, newPassword: _password }
		});

		return { message: `Password ${target.nama} direset` };
	}
);
