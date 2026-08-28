import process from 'node:process';
import { createSeedContext } from './context';
import { seedRegistry } from './batches/registry';

// Reference/master data only -- no Better Auth accounts, no sample companies,
// no test peserta/faktur rows. Safe to run against any environment, including
// production. See seed.ts for the full local-dev seed (reference + demo).
const seedReference = async () => {
	console.log('Seeding reference/master data only...\n');

	const context = await createSeedContext();

	try {
		for (const { batch, kind } of seedRegistry) {
			if (kind !== 'reference') continue;
			console.log(`Running batch: ${batch.name}`);
			await batch.run(context);
		}
	} finally {
		await context.dispose();
	}

	console.log('\nReference data seed complete.');
};

seedReference()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error('Reference seed failed:', error);
		process.exit(1);
	});
