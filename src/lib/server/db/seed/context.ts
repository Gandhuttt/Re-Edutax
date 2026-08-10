import { getPlatformProxy } from 'wrangler';
import { drizzle } from 'drizzle-orm/d1';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { betterAuth } from 'better-auth';
import { username } from 'better-auth/plugins';
import process from 'node:process';
import * as schema from '../schema';

export const createSeedContext = async () => {
	process.loadEnvFile?.();

	const { env, dispose } = await getPlatformProxy<{ DB: D1Database }>();

	const db = drizzle(env.DB, { schema });
	const auth = betterAuth({
		baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:5173',
		secret: process.env.BETTER_AUTH_SECRET ?? 'dev-only-better-auth-secret-change-me-32',
		database: drizzleAdapter(db, {
			provider: 'sqlite',
			schema
		}),
		emailAndPassword: {
			enabled: true,
			minPasswordLength: 3,
			autoSignIn: false
		},
		plugins: [
			username({
				minUsernameLength: 15,
				maxUsernameLength: 16,
				usernameNormalization: false,
				usernameValidator: (value) => /^\d{15,16}$/.test(value)
			})
		]
	});

	return { auth, db, dispose };
};

export type SeedContext = Awaited<ReturnType<typeof createSeedContext>>;

export type TaxpayerSeedAccount = {
	npwp: string;
	password: string;
	nama: string;
	email: string;
};
