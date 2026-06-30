import { sql } from 'drizzle-orm';
import {
	sqliteTable,
	text,
	integer,
	index,
	uniqueIndex,
	check,
	foreignKey,
} from 'drizzle-orm/sqlite-core';

import {
	AuthProvider,
	AuthSecurityEventType,
	AuthUserStatus,
	AuthTokenPurpose,
	MfaFactorType,
} from './constants';


// ==========================================
// 1. AUTH USERS
// Akun aplikasi. Bukan Wajib Pajak.
// ==========================================
export const authUsers = sqliteTable('auth_users', {
	id: text('id').primaryKey(),

	email: text('email').notNull(),
	normalizedEmail: text('normalized_email').notNull(),

	displayName: text('display_name').notNull(),
	avatarUrl: text('avatar_url'),

	status: text('status').notNull().default(AuthUserStatus.ACTIVE),
	tokenVersion: integer('token_version').notNull().default(0),

	emailVerifiedAt: text('email_verified_at'),
	lastLoginAt: text('last_login_at'),

	createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
	deletedAt: text('deleted_at'),
}, (table) => [
	index('idx_auth_users_status').on(table.status),

	uniqueIndex('uq_auth_users_normalized_email_active')
		.on(table.normalizedEmail)
		.where(sql`${table.deletedAt} IS NULL`),

	check(
		'ck_auth_users_status',
		sql`${table.status} IN ('ACTIVE', 'SUSPENDED', 'DELETED')`,
	),
	check(
		'ck_auth_users_token_version_non_negative',
		sql`${table.tokenVersion} >= 0`,
	),
]);


// ==========================================
// 2. AUTH PASSWORD CREDENTIALS
// Kredensial password internal.
// Simpan hash, bukan password mentah.
// ==========================================
export const authPasswordCredentials = sqliteTable('auth_password_credentials', {
	userId: text('user_id')
		.primaryKey()
		.references(() => authUsers.id, {
			onUpdate: 'cascade',
			onDelete: 'cascade',
		}),

	passwordHash: text('password_hash').notNull(),

	passwordUpdatedAt: text('password_updated_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),

	mustChangePassword: integer('must_change_password', { mode: 'boolean' })
		.notNull()
		.default(false),

	failedLoginCount: integer('failed_login_count')
		.notNull()
		.default(0),

	lockedUntil: text('locked_until'),

	createdAt: text('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),

	updatedAt: text('updated_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	check(
		'ck_auth_password_credentials_failed_login_count_non_negative',
		sql`${table.failedLoginCount} >= 0`,
	),
]);


// ==========================================
// 3. AUTH IDENTITIES
// Akun OAuth / social login.
// Contoh: Google, GitHub, Microsoft.
// ==========================================
export const authIdentities = sqliteTable('auth_identities', {
	id: text('id').primaryKey(),

	userId: text('user_id')
		.notNull()
		.references(() => authUsers.id, {
			onUpdate: 'cascade',
			onDelete: 'cascade',
		}),

	provider: text('provider').notNull(),
	providerAccountId: text('provider_account_id').notNull(),

	providerEmail: text('provider_email'),
	providerUsername: text('provider_username'),

	createdAt: text('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),

	updatedAt: text('updated_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index('idx_auth_identities_user').on(table.userId),

	uniqueIndex('uq_auth_identities_provider_account')
		.on(table.provider, table.providerAccountId),

	check(
		'ck_auth_identities_provider',
		sql`${table.provider} IN (${sql.raw(`'${AuthProvider.GOOGLE}'`)}, ${sql.raw(`'${AuthProvider.GITHUB}'`)}, ${sql.raw(`'${AuthProvider.MICROSOFT}'`)})`,
	),
]);


// ==========================================
// 4. AUTH SESSIONS
// Merepresentasikan sesi login/device.
// Access token JWT boleh stateless,
// tapi session tetap berguna untuk revoke dan audit.
// ==========================================
export const authSessions = sqliteTable(
	'auth_sessions',
	{
		id: text('id').primaryKey(),

		userId: text('user_id')
			.notNull()
			.references(() => authUsers.id, {
				onUpdate: 'cascade',
				onDelete: 'cascade',
			}),

		ipAddress: text('ip_address'),
		userAgent: text('user_agent'),
		deviceName: text('device_name'),
		lastSeenAt: text('last_seen_at'),
		sessionVersion: integer('session_version').notNull().default(0),

		expiresAt: text('expires_at').notNull(),
		revokedAt: text('revoked_at'),
		revokedReason: text('revoked_reason'),

		createdAt: text('created_at')
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),

		updatedAt: text('updated_at')
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
	},
	(table) => [
		index('idx_auth_sessions_user').on(table.userId),
		index('idx_auth_sessions_expires_at').on(table.expiresAt),
		index('idx_auth_sessions_revoked_at').on(table.revokedAt),
		uniqueIndex('uq_auth_sessions_id_user').on(table.id, table.userId),
		check(
			'ck_auth_sessions_session_version_non_negative',
			sql`${table.sessionVersion} >= 0`,
		),
	],
);


// ==========================================
// 5. AUTH REFRESH TOKENS
// Untuk JWT hybrid.
// Simpan hash refresh token, bukan token mentah.
// Mendukung refresh token rotation.
// ==========================================
export const authRefreshTokens = sqliteTable(
	'auth_refresh_tokens',
	{
		id: text('id').primaryKey(),

		sessionId: text('session_id')
			.notNull()
			.references(() => authSessions.id, {
				onUpdate: 'cascade',
				onDelete: 'cascade',
			}),

		userId: text('user_id')
			.notNull()
			.references(() => authUsers.id, {
				onUpdate: 'cascade',
				onDelete: 'cascade',
			}),

		refreshTokenHash: text('refresh_token_hash')
			.notNull()
			.unique(),

		tokenFamilyId: text('token_family_id').notNull(),

		expiresAt: text('expires_at').notNull(),

		rotatedAt: text('rotated_at'),
		revokedAt: text('revoked_at'),

		replacedByTokenId: text('replaced_by_token_id'),
		reuseDetectedAt: text('reuse_detected_at'),

		createdAt: text('created_at')
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),

		updatedAt: text('updated_at')
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
	},
	(table) => [
		index('idx_auth_refresh_tokens_session').on(table.sessionId),
		index('idx_auth_refresh_tokens_user').on(table.userId),
		index('idx_auth_refresh_tokens_family').on(table.tokenFamilyId),
		index('idx_auth_refresh_tokens_expires_at').on(table.expiresAt),
		index('idx_auth_refresh_tokens_revoked_at').on(table.revokedAt),
		foreignKey({
			columns: [table.replacedByTokenId],
			foreignColumns: [table.id],
		}).onUpdate('cascade').onDelete('set null'),
		foreignKey({
			columns: [table.sessionId, table.userId],
			foreignColumns: [authSessions.id, authSessions.userId],
		}).onUpdate('cascade').onDelete('cascade'),
	],
);


// ==========================================
// 6. AUTH VERIFICATION TOKENS
// Untuk verifikasi email, reset password, dan magic link.
// Simpan hash token, bukan token mentah.
// ==========================================
export const authVerificationTokens = sqliteTable(
	'auth_verification_tokens',
	{
		id: text('id').primaryKey(),

		userId: text('user_id').references(() => authUsers.id, {
			onUpdate: 'cascade',
			onDelete: 'cascade',
		}),

		identifier: text('identifier').notNull(),
		// Biasanya email normalized.

		purpose: text('purpose').notNull(),

		tokenHash: text('token_hash')
			.notNull()
			.unique(),

		expiresAt: text('expires_at').notNull(),
		consumedAt: text('consumed_at'),

		createdAt: text('created_at')
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
	},
	(table) => [
		index('idx_auth_verification_tokens_user').on(table.userId),
		index('idx_auth_verification_tokens_identifier').on(table.identifier),
		index('idx_auth_verification_tokens_expires_at').on(table.expiresAt),

		check(
			'ck_auth_verification_tokens_purpose',
			sql`${table.purpose} IN (${sql.raw(`'${AuthTokenPurpose.EMAIL_VERIFICATION}'`)}, ${sql.raw(`'${AuthTokenPurpose.PASSWORD_RESET}'`)}, ${sql.raw(`'${AuthTokenPurpose.MAGIC_LINK}'`)})`,
		),
	],
);


// ==========================================
// 7. AUTH MFA FACTORS
// Faktor autentikasi tambahan.
// Tahap awal cukup TOTP.
// ==========================================
export const authMfaFactors = sqliteTable(
	'auth_mfa_factors',
	{
		id: text('id').primaryKey(),

		userId: text('user_id')
			.notNull()
			.references(() => authUsers.id, {
				onUpdate: 'cascade',
				onDelete: 'cascade',
			}),

		type: text('type')
			.notNull()
			.default(MfaFactorType.TOTP),

		label: text('label'),

		secretEncrypted: text('secret_encrypted').notNull(),

		enabledAt: text('enabled_at'),
		lastUsedAt: text('last_used_at'),

		createdAt: text('created_at')
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),

		updatedAt: text('updated_at')
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),

		deletedAt: text('deleted_at'),
	},
	(table) => [
		index('idx_auth_mfa_factors_user').on(table.userId),

		check(
			'ck_auth_mfa_factors_type',
			sql`${table.type} IN (${sql.raw(`'${MfaFactorType.TOTP}'`)})`,
		),
	],
);


// ==========================================
// 8. AUTH MFA RECOVERY CODES
// Recovery code untuk MFA.
// Simpan hash, bukan kode mentah.
// ==========================================
export const authMfaRecoveryCodes = sqliteTable(
	'auth_mfa_recovery_codes',
	{
		id: text('id').primaryKey(),

		userId: text('user_id')
			.notNull()
			.references(() => authUsers.id, {
				onUpdate: 'cascade',
				onDelete: 'cascade',
			}),

		codeHash: text('code_hash')
			.notNull()
			.unique(),

		usedAt: text('used_at'),

		createdAt: text('created_at')
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
	},
	(table) => [
		index('idx_auth_mfa_recovery_codes_user').on(table.userId),
	],
);


// ==========================================
// 9. AUTH SECURITY EVENTS
// Audit trail internal auth-service.
// Tidak untuk domain pajak.
// ==========================================
export const authSecurityEvents = sqliteTable(
	'auth_security_events',
	{
		id: text('id').primaryKey(),

		userId: text('user_id').references(() => authUsers.id, {
			onUpdate: 'cascade',
			onDelete: 'set null',
		}),

		eventType: text('event_type').notNull(),

		ipAddress: text('ip_address'),
		userAgent: text('user_agent'),

		metadataJson: text('metadata_json'),
		// JSON string. Contoh: alasan gagal login, provider OAuth, dsb.

		createdAt: text('created_at')
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
	},
	(table) => [
		index('idx_auth_security_events_user').on(table.userId),
		index('idx_auth_security_events_type').on(table.eventType),
		index('idx_auth_security_events_created_at').on(table.createdAt),
		check(
			'ck_auth_security_events_type',
			sql`${table.eventType} IN (
				${sql.raw(`'${AuthSecurityEventType.USER_REGISTERED}'`)},
				${sql.raw(`'${AuthSecurityEventType.EMAIL_VERIFIED}'`)},
				${sql.raw(`'${AuthSecurityEventType.LOGIN_SUCCESS}'`)},
				${sql.raw(`'${AuthSecurityEventType.LOGIN_FAILED}'`)},
				${sql.raw(`'${AuthSecurityEventType.LOGOUT}'`)},
				${sql.raw(`'${AuthSecurityEventType.PASSWORD_CHANGED}'`)},
				${sql.raw(`'${AuthSecurityEventType.PASSWORD_RESET_REQUESTED}'`)},
				${sql.raw(`'${AuthSecurityEventType.PASSWORD_RESET_COMPLETED}'`)},
				${sql.raw(`'${AuthSecurityEventType.SESSION_REVOKED}'`)},
				${sql.raw(`'${AuthSecurityEventType.REFRESH_TOKEN_REUSED}'`)},
				${sql.raw(`'${AuthSecurityEventType.MFA_ENABLED}'`)},
				${sql.raw(`'${AuthSecurityEventType.MFA_DISABLED}'`)},
				${sql.raw(`'${AuthSecurityEventType.USER_SUSPENDED}'`)}
			)`,
		),
	],
);


// ==========================================
// 10. AUTH OUTBOX
// Untuk publikasi event ke service lain.
// Contoh:
// - AuthUserCreated
// - AuthUserEmailVerified
// - AuthUserSuspended
// - AuthSessionRevoked
// ==========================================
export const authOutbox = sqliteTable(
	'auth_outbox',
	{
		id: text('id').primaryKey(),

		eventType: text('event_type').notNull(),
		aggregateType: text('aggregate_type').notNull(), // biasanya 'AUTH_USER' atau 'AUTH_SESSION'
		aggregateId: text('aggregate_id').notNull(),

		payloadJson: text('payload_json').notNull(),

		publishedAt: text('published_at'),

		createdAt: text('created_at')
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
	},
	(table) => [
		index('idx_auth_outbox_published_at').on(table.publishedAt),
		index('idx_auth_outbox_aggregate').on(table.aggregateType, table.aggregateId),
	],
);
