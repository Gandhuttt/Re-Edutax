import process from 'node:process';
import { eq } from 'drizzle-orm';
import { user } from '../../schema';
import type { SeedContext } from '../context';

/**
 * Staff account for the admin dashboard. It deliberately gets no wajib_pajak profile — an
 * administrator is not a taxpayer in this app, they only manage peserta accounts.
 */
const admin = {
	username: process.env.ADMIN_USERNAME ?? 'admin',
	password: process.env.ADMIN_PASSWORD ?? 'admin123',
	nama: process.env.ADMIN_NAME ?? 'Administrator',
	email: process.env.ADMIN_EMAIL ?? 'admin@example.com'
};

export const name = '014 admin user';

export const run = async ({ auth, db }: SeedContext) => {
	const [existing] = await db
		.select({ id: user.id })
		.from(user)
		.where(eq(user.username, admin.username))
		.limit(1);

	if (!existing) {
		await auth.api.signUpEmail({
			body: {
				name: admin.nama,
				email: admin.email,
				password: admin.password,
				username: admin.username,
				displayUsername: admin.username
			}
		});

		console.log(`Created admin user: ${admin.username}`);
	} else {
		console.log(`Admin user exists: ${admin.username}`);
	}

	// Set on every run so an account demoted or created before the admin plugin is repaired.
	await db.update(user).set({ role: 'admin' }).where(eq(user.username, admin.username));

	return [{ npwp: admin.username, password: admin.password, nama: admin.nama }];
};
