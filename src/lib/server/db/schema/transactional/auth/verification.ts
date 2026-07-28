import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createdAt, updatedAt } from '$lib/server/db/helpers/timestamps';

export const verification = sqliteTable(
	'verification',
	{
		id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
		identifier: text('identifier').notNull(),
		value: text('value').notNull(),
		expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
		createdAt: createdAt(),
		updatedAt: updatedAt()
	},
	(t) => [index('verification_identifier_idx').on(t.identifier)]
);
