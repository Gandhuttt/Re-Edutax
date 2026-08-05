import { seedTaxpayerAccounts } from '../helpers';
import type { SeedContext, TaxpayerSeedAccount } from '../context';

const peserta: (Omit<TaxpayerSeedAccount, 'npwp' | 'password' | 'email'> & { pekerjaan: string })[] = [
	{ nama: 'Yunita Wulandari S.E.', pekerjaan: 'karyawan holding company' },
	{ nama: 'Fatkhiyah Nuzulita Rizki', pekerjaan: 'karyawan kontraktor' },
	{ nama: 'Dian Rahmawati, S.Ak.', pekerjaan: 'karyawan digital marketing' },
	{ nama: 'Dewi Mukti Wijayanti, S.AB', pekerjaan: 'fresh graduate' },
	{ nama: 'Renie Novrianti, S.Pd', pekerjaan: 'pengelola usaha makanan' },
	{ nama: 'Adityo Rachtomo', pekerjaan: 'manufaktur' },
	{ nama: 'Fanda Wulandari', pekerjaan: 'mahasiswa' },
	{ nama: 'Meriana Rosalita, S.E', pekerjaan: 'karyawan retail otomotif' },
	{ nama: 'Della Aulia Nurul Azizah Amd, Ak.', pekerjaan: 'karyawan' },
	{ nama: 'Alfita Ayu Cahyani, S.E', pekerjaan: 'karyawan makanan minuman' },
	{ nama: 'Fika Faridhotul Farchah', pekerjaan: 'karyawan makanan minuman' },
	{ nama: 'Adina Luna Putri Maysa, A.Md.Ak', pekerjaan: 'karyawan' },
	{ nama: 'Rio Edison, S.H.', pekerjaan: 'hukum' },
	{ nama: 'Syarifah Gita Lestari, S.H.', pekerjaan: 'karyawan manufaktur' }
];

const accounts: TaxpayerSeedAccount[] = peserta.map((row, index) => {
	const number = index + 1;

	return {
		npwp: `33000000000016${number.toString().padStart(2, '0')}`,
		password: '123',
		nama: row.nama,
		email: `batch16.peserta${number}@example.com`
	};
});

export const name = '004 batch 16 peserta';

export const run = async (context: SeedContext) => {
	await seedTaxpayerAccounts(context, accounts);

	return accounts;
};
