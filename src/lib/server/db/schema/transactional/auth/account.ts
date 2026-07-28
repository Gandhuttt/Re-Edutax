import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createdAt, updatedAt } from '$lib/server/db/helpers/timestamps';
import { user } from './user';

export const account = sqliteTable(
	'account',
	{
		id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
		accountId: text('account_id').notNull(),
		providerId: text('provider_id').notNull(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		accessToken: text('access_token'),
		refreshToken: text('refresh_token'),
		idToken: text('id_token'),
		accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp_ms' }),
		refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp_ms' }),
		scope: text('scope'),
		password: text('password'),
		createdAt: createdAt(),
		updatedAt: updatedAt()
	},
	(t) => [index('account_user_id_idx').on(t.userId)]
);
