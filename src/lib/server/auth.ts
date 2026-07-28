import { building, dev } from '$app/environment';
import { getRequestEvent } from '$app/server';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { betterAuth } from 'better-auth';
import { username } from 'better-auth/plugins';
import { sveltekitCookies } from 'better-auth/svelte-kit';

const devSecret = 'dev-only-better-auth-secret-change-me-32';

export const auth = betterAuth({
	baseURL: env.BETTER_AUTH_URL ?? 'http://localhost:5173',
	secret: env.BETTER_AUTH_SECRET ?? (dev || building ? devSecret : undefined),
	database: drizzleAdapter(db, {
		provider: 'sqlite',
		schema
	}),
	emailAndPassword: {
		enabled: true,
		disableSignUp: true
	},
	plugins: [
		username({
			minUsernameLength: 15,
			maxUsernameLength: 16,
			usernameNormalization: false,
			usernameValidator: (value) => /^\d{15,16}$/.test(value)
		}),
		sveltekitCookies(getRequestEvent)
	]
});
