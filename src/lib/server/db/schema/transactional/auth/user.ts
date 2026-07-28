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
		createdAt: createdAt(),
		updatedAt: updatedAt()
	},
	(t) => [uniqueIndex('user_username_unique').on(t.username)]
);
