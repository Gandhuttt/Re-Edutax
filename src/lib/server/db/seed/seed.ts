import process from 'node:process';
import { createSeedContext } from './context';
import { seedRegistry } from './batches/registry';

// Full local-dev seed: reference/master data plus demo accounts, sample
// companies, and test peserta/faktur rows. Never run this against
// production -- use seed-reference.ts there instead.
const seed = async () => {
	console.log('Seeding Better Auth users and wajib_pajak profiles...\n');

	const context = await createSeedContext();
	const seededAccounts = [];

	try {
		for (const { batch } of seedRegistry) {
			console.log(`Running batch: ${batch.name}`);
			seededAccounts.push(...(await batch.run(context)));
		}
	} finally {
		await context.dispose();
	}

	console.log('\nSeed complete. Login credentials:');
	for (const account of seededAccounts) {
		console.log(`NPWP: ${account.npwp} | Password: ${account.password} | ${account.nama}`);
	}
};

seed()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error('Seed failed:', error);
		process.exit(1);
	});
