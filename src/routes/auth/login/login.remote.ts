import { form } from '$app/server';
import { auth } from '$lib/server/auth';
import { invalid, redirect } from '@sveltejs/kit';
import * as v from 'valibot';

const LoginSchema = v.object({
	npwp: v.pipe(
		v.string(),
		v.nonEmpty('NPWP harus diisi.'),
		v.regex(/^\d{15,16}$/, 'NPWP harus berisi 15 sampai 16 digit.')
	),
	_password: v.pipe(v.string(), v.nonEmpty('Password harus diisi.'))
});

export const login = form(LoginSchema, async ({ npwp, _password }, issue) => {
	try {
		await auth.api.signInUsername({
			body: {
				username: npwp,
				password: _password
			}
		});
	} catch {
		invalid(issue.npwp('NPWP atau password salah.'));
	}

	redirect(303, '/');
});
