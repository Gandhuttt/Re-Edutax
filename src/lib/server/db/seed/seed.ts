import process from 'node:process';
import { createSeedContext } from './context';
import * as initialUsers from './batches/001-initial-users';
import * as fakturReferenceMaster from './batches/002-faktur-reference-master';
import * as fakturDemo from './batches/002-faktur-demo';

const batches = [initialUsers, fakturReferenceMaster, fakturDemo];

const seed = async () => {
	console.log('Seeding Better Auth users and wajib_pajak profiles...\n');

	const context = createSeedContext();
	const seededAccounts = [];

	for (const batch of batches) {
		console.log(`Running batch: ${batch.name}`);
		seededAccounts.push(...(await batch.run(context)));
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
