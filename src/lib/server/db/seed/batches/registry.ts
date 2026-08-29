import type { SeedContext } from '../context';
import * as initialUsers from './001-initial-users';
import * as fakturReferenceMaster from './002-faktur-reference-master';
import * as fakturDemo from './002-faktur-demo';
import * as sptPphBadanReferenceMaster from './003-spt-pph-badan-reference-master';
import * as batch16Peserta from './004-batch-16-peserta';
import * as lampiran1Akun from './005-lampiran-1-akun';
import * as lampiran1NeracaAkun from './006-lampiran-1-neraca-akun';
import * as lampiran3Referensi from './007-lampiran-3-referensi';
import * as lampiran4ObjekPajak from './008-lampiran-4-objek-pajak';
import * as lampiran4BukanObjekPajak from './009-lampiran-4-bukan-objek-pajak';
import * as lampiran9JenisHarta from './010-lampiran-9-jenis-harta';
import * as lampiran9MetodePenyusutan from './011-lampiran-9-metode-penyusutan';
import * as lampiran10aReferensi from './012-lampiran-10a-referensi';
import * as kodeKoreksiFiskal from './013-kode-koreksi-fiskal';
import * as adminUser from './014-admin-user';
import * as batchPeserta from './015-batch-peserta';
import * as pphOpLampiranReferensi from './016-pph-op-lampiran-referensi';
import * as pphOpKodeKoreksiFiskal from './017-pph-op-kode-koreksi-fiskal';
import * as pphOpLampiran3aAkun from './018-pph-op-lampiran-3a-akun';
import * as pphOpLampiran3aNeracaAkun from './019-pph-op-lampiran-3a-neraca-akun';
import * as ebupotReferenceMaster from './020-ebupot-reference-master';

type SeedBatchModule = {
	name: string;
	run: (context: SeedContext) => Promise<{ npwp: string; password: string; nama: string }[]>;
};

// "reference" batches only touch lookup/master tables (kode transaksi, chart
// of accounts, etc.) -- no wajib_pajak accounts, no sample companies -- so
// they're safe to run against any environment, including production, via
// seed-reference.ts. "demo" batches create real Better Auth users, sample
// companies, and test peserta/faktur rows, and must stay local/dev only (see
// seed.ts). Order matters here: demo batches like batchPeserta and fakturDemo
// depend on wajib_pajak rows created by earlier demo batches.
export const seedRegistry: { batch: SeedBatchModule; kind: 'reference' | 'demo' }[] = [
	{ batch: initialUsers, kind: 'demo' },
	{ batch: fakturReferenceMaster, kind: 'reference' },
	{ batch: sptPphBadanReferenceMaster, kind: 'reference' },
	{ batch: batch16Peserta, kind: 'demo' },
	{ batch: lampiran1Akun, kind: 'reference' },
	{ batch: lampiran1NeracaAkun, kind: 'reference' },
	{ batch: lampiran3Referensi, kind: 'reference' },
	{ batch: lampiran4ObjekPajak, kind: 'reference' },
	{ batch: lampiran4BukanObjekPajak, kind: 'reference' },
	{ batch: lampiran9JenisHarta, kind: 'reference' },
	{ batch: lampiran9MetodePenyusutan, kind: 'reference' },
	{ batch: lampiran10aReferensi, kind: 'reference' },
	{ batch: kodeKoreksiFiskal, kind: 'reference' },
	{ batch: adminUser, kind: 'demo' },
	{ batch: batchPeserta, kind: 'demo' },
	{ batch: pphOpLampiranReferensi, kind: 'reference' },
	{ batch: pphOpKodeKoreksiFiskal, kind: 'reference' },
	{ batch: pphOpLampiran3aAkun, kind: 'reference' },
	{ batch: pphOpLampiran3aNeracaAkun, kind: 'reference' },
	{ batch: ebupotReferenceMaster, kind: 'reference' },
	{ batch: fakturDemo, kind: 'demo' }
];
