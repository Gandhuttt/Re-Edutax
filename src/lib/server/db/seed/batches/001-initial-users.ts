import { seedTaxpayerAccounts } from '../helpers';
import type { SeedContext, TaxpayerSeedAccount } from '../context';

const accounts: TaxpayerSeedAccount[] = [
	{
		npwp: '0123456789012000',
		password: 'password123',
		nama: 'PT Contoh Sejahtera',
		email: 'contoh@example.com'
	},
	{
		npwp: '0234567890123000',
		password: 'test123',
		nama: 'PT Test Makmur',
		email: 'test@example.com'
	},
	{
		npwp: '0345678901234000',
		password: 'demo123',
		nama: 'CV Demo Jaya',
		email: 'demo@example.com'
	},
	...Array.from({ length: 10 }, (_, index) => {
		const number = index + 1;

		return {
			npwp: `33000000000001${number.toString().padStart(2, '0')}`,
			password: '123',
			nama: `Peserta ${number}`,
			email: `peserta${number}@example.com`
		};
	})
];

export const name = '001 initial users';

export const run = async (context: SeedContext) => {
	await seedTaxpayerAccounts(context, accounts);

	return accounts;
};
