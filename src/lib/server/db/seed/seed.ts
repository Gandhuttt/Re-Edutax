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
import * as lampiran9JenisHarta from './batches/010-lampiran-9-jenis-harta';
import * as lampiran9MetodePenyusutan from './batches/011-lampiran-9-metode-penyusutan';
import * as lampiran10aReferensi from './batches/012-lampiran-10a-referensi';
import * as kodeKoreksiFiskal from './batches/013-kode-koreksi-fiskal';
import * as adminUser from './batches/014-admin-user';
import * as batchPeserta from './batches/015-batch-peserta';
import * as pphOpLampiranReferensi from './batches/016-pph-op-lampiran-referensi';
import * as pphOpKodeKoreksiFiskal from './batches/017-pph-op-kode-koreksi-fiskal';
import * as pphOpLampiran3aAkun from './batches/018-pph-op-lampiran-3a-akun';
import * as pphOpLampiran3aNeracaAkun from './batches/019-pph-op-lampiran-3a-neraca-akun';

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
	lampiran9JenisHarta,
	lampiran9MetodePenyusutan,
	lampiran10aReferensi,
	kodeKoreksiFiskal,
	adminUser,
	batchPeserta,
	pphOpLampiranReferensi,
	pphOpKodeKoreksiFiskal,
	pphOpLampiran3aAkun,
	pphOpLampiran3aNeracaAkun,
	fakturDemo
];

const seed = async () => {
	console.log('Seeding Better Auth users and wajib_pajak profiles...\n');

	const context = await createSeedContext();
	const seededAccounts = [];

	try {
		for (const batch of batches) {
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
