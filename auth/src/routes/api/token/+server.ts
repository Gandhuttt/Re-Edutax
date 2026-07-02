import { json } from '@sveltejs/kit';

import { auth } from '$lib/server/better-auth';
import { accessTokenConfig, signAccessToken } from '$lib/server/jwt';
import { getTaxpayerProfileByUserId } from '$lib/server/taxpayer';

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
	const taxpayerProfile = await getTaxpayerProfileByUserId(user.id);

	if (!taxpayerProfile) {
		return json({ message: 'Taxpayer profile not found' }, { status: 409 });
	}

	const accessToken = signAccessToken({
		sub: user.id,
		email: user.email,
		name: user.name ?? null,
		role: user.role,
		jenisWp: taxpayerProfile.jenisWp.code,
		kategoriWp: taxpayerProfile.kategoriWp.code,
	});

	return json({
		tokenType: 'Bearer',
		accessToken,
		expiresIn: accessTokenConfig.expiresIn,
		user: {
			id: user.id,
			email: user.email,
			name: user.name,
			role: user.role,
			npwp: taxpayerProfile.npwp,
			jenisWp: taxpayerProfile.jenisWp,
			kategoriWp: taxpayerProfile.kategoriWp,
		},
	});
};
