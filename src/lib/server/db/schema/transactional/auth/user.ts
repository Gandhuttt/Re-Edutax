import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { createdAt, updatedAt } from '$lib/server/db/helpers/timestamps';

export const user = sqliteTable(
	'user',
	{
		id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
		name: text('name').notNull(),
		email: text('email').notNull().unique(),
		emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
		image: text('image'),
		username: text('username').unique(),
		displayUsername: text('display_username'),
		// Better Auth admin plugin fields. `role` drives the admin dashboard guard;
		// 'user' is every seeded/created peserta, 'admin' is staff.
		role: text('role').notNull().default('user'),
		banned: integer('banned', { mode: 'boolean' }).notNull().default(false),
		banReason: text('ban_reason'),
		banExpires: integer('ban_expires', { mode: 'timestamp_ms' }),
		createdAt: createdAt(),
		updatedAt: updatedAt()
	},
	(t) => [uniqueIndex('user_username_unique').on(t.username)]
);
