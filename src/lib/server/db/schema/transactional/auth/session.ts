import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { createdAt, updatedAt } from '$lib/server/db/helpers/timestamps';
import { user } from './user';

export const session = sqliteTable(
	'session',
	{
		id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
		expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
		token: text('token').notNull().unique(),
		createdAt: createdAt(),
		updatedAt: updatedAt(),
		ipAddress: text('ip_address'),
		userAgent: text('user_agent'),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		// Set by the admin plugin when an admin impersonates a peserta.
		impersonatedBy: text('impersonated_by')
	},
	(t) => [uniqueIndex('session_token_unique').on(t.token), index('session_user_id_idx').on(t.userId)]
);
