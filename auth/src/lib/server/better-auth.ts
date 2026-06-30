import { env } from '$env/dynamic/private';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';

import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';

if (!env.BETTER_AUTH_SECRET) {
	throw new Error('BETTER_AUTH_SECRET is not set');
}

export const auth = betterAuth({
	secret: env.BETTER_AUTH_SECRET,
	baseURL: env.BETTER_AUTH_URL,
	basePath: '/api/auth',
	database: drizzleAdapter(db, {
		provider: 'sqlite',
		schema,
	}),
	emailAndPassword: {
		enabled: true,
	},
	user: {
		additionalFields: {
			role: {
				type: "string",
				required: true,
				defaultValue: "taxpayer",
			},
			jenis_wp: {
				type: "string",
				required: false,
			}
		}
	}
});

export type Session = typeof auth.$Infer.Session;
