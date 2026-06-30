import { json } from '@sveltejs/kit';

import { auth } from '$lib/server/better-auth';
import { accessTokenConfig, signAccessToken } from '$lib/server/jwt';

export const POST = async ({ locals, request }) => {
	const session =
		locals.session ??
		(await auth.api.getSession({
			headers: request.headers,
		}));

	if (!session) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	const { user } = session;

	const accessToken = signAccessToken({
		sub: user.id,
		email: user.email,
		name: user.name ?? null,
	});

	return json({
		tokenType: 'Bearer',
		accessToken,
		expiresIn: accessTokenConfig.expiresIn,
		user: {
			id: user.id,
			email: user.email,
			name: user.name,
		},
	});
};
