import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { betterAuth } from 'better-auth';
import { username } from 'better-auth/plugins';
import process from 'node:process';
import * as schema from '../schema';

export const createSeedContext = () => {
	process.loadEnvFile?.();

	const databaseUrl = process.env.DATABASE_URL;

	if (!databaseUrl) {
		throw new Error('DATABASE_URL is not set');
	}

	const db = drizzle(createClient({ url: databaseUrl }), { schema });
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

	return { auth, db };
};

export type SeedContext = ReturnType<typeof createSeedContext>;

export type TaxpayerSeedAccount = {
	npwp: string;
	password: string;
	nama: string;
	email: string;
};
