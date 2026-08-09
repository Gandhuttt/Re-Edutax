import process from 'node:process';
import { createSeedContext } from './context';
import * as initialUsers from './batches/001-initial-users';
import * as fakturReferenceMaster from './batches/002-faktur-reference-master';
import * as fakturDemo from './batches/002-faktur-demo';
import * as sptPphBadanReferenceMaster from './batches/003-spt-pph-badan-reference-master';
import * as batch16Peserta from './batches/004-batch-16-peserta';
import * as lampiran1Akun from './batches/005-lampiran-1-akun';
import * as lampiran1NeracaAkun from './batches/006-lampiran-1-neraca-akun';
import * as lampiran3Referensi from './batches/007-lampiran-3-referensi';
import * as lampiran4ObjekPajak from './batches/008-lampiran-4-objek-pajak';
import * as lampiran4BukanObjekPajak from './batches/009-lampiran-4-bukan-objek-pajak';

const batches = [
	initialUsers,
	fakturReferenceMaster,
	sptPphBadanReferenceMaster,
	batch16Peserta,
	lampiran1Akun,
	lampiran1NeracaAkun,
	lampiran3Referensi,
	lampiran4ObjekPajak,
	lampiran4BukanObjekPajak,
	fakturDemo
];

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
