import { defineConfig } from 'drizzle-kit';

// Only push/migrate/studio actually open a connection, so credentials are read
// lazily instead of validated here — generate has to work with no D1 access at all.
export default defineConfig({
	schema: './src/lib/server/db/schema/index.ts',
	out: './drizzle',
	dialect: 'sqlite',
	driver: 'd1-http',
	dbCredentials: {
		accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
		databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
		token: process.env.CLOUDFLARE_D1_TOKEN!
	},
	verbose: true,
	strict: true
});
