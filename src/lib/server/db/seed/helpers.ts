import { eq } from 'drizzle-orm';
import { user, wajib_pajak } from '../schema';
import type { SeedContext, TaxpayerSeedAccount } from './context';

export const seedTaxpayerAccounts = async (
	{ auth, db }: SeedContext,
	accounts: TaxpayerSeedAccount[]
) => {
	for (const account of accounts) {
		const existingUser = await db
			.select({ id: user.id })
			.from(user)
			.where(eq(user.username, account.npwp))
			.limit(1);

		if (existingUser.length === 0) {
			await auth.api.signUpEmail({
				body: {
					name: account.nama,
					email: account.email,
					password: account.password,
					username: account.npwp,
					displayUsername: account.npwp
				}
			});

			console.log(`Created auth user: ${account.nama}`);
		} else {
			console.log(`Auth user exists: ${account.nama}`);
		}

		await db
			.insert(wajib_pajak)
			.values({
				npwp: account.npwp,
				nama: account.nama,
				email: account.email
			})
			.onConflictDoUpdate({
				target: wajib_pajak.npwp,
				set: {
					nama: account.nama,
					email: account.email
				}
			});
	}
};
