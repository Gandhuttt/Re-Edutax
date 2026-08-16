import { building, dev } from '$app/environment';
import { getRequestEvent } from '$app/server';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { betterAuth } from 'better-auth';
import { admin, username } from 'better-auth/plugins';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { isValidUsername, usernameMaxLength, usernameMinLength } from '$lib/helpers/username';

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
		disableSignUp: true,
		// Peserta accounts are handed out in class with short throwaway passwords (the seed
		// batches use '123'), so the 8-char default would lock admins out of reusing them.
		minPasswordLength: 3
	},
	plugins: [
		username({
			minUsernameLength: usernameMinLength,
			maxUsernameLength: usernameMaxLength,
			usernameNormalization: false,
			usernameValidator: isValidUsername
		}),
		admin({
			defaultRole: 'user',
			adminRoles: ['admin']
		}),
		sveltekitCookies(getRequestEvent)
	]
});
