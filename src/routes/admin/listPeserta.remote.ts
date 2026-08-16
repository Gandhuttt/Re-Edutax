import { query } from '$app/server';
import { requireAdmin } from '$lib/server/admin';
import { db } from '$lib/server/db';
import {
	batch_peserta,
	faktur_pajak,
	spt_pph_badan,
	spt_ppn,
	user,
	wajib_pajak
} from '$lib/server/db/schema';
import { asc, count, eq, sql } from 'drizzle-orm';

export const listPeserta = query(async () => {
	requireAdmin();

	// The auth user is the source of truth for "who can log in"; wajib_pajak carries the
	// tax profile. Left-joined so an account missing its profile still shows up here.
	const rows = await db
		.select({
			id: user.id,
			npwp: user.username,
			nama: user.name,
			email: user.email,
			role: user.role,
			banned: user.banned,
			createdAt: user.createdAt,
			nomorTelepon: wajib_pajak.nomor_telepon,
			profilAda: sql<number>`case when ${wajib_pajak.npwp} is null then 0 else 1 end`,
			batchId: wajib_pajak.batchId,
			batchNomor: batch_peserta.nomor,
			batchNama: batch_peserta.nama
		})
		.from(user)
		.leftJoin(wajib_pajak, eq(wajib_pajak.npwp, user.username))
		.leftJoin(batch_peserta, eq(batch_peserta.id, wajib_pajak.batchId))
		.where(eq(user.role, 'user'))
		.orderBy(asc(user.username));

	const [pphBadanCounts, ppnCounts, fakturCounts] = await Promise.all([
		db
			.select({ npwp: spt_pph_badan.npwp, jumlah: count() })
			.from(spt_pph_badan)
			.groupBy(spt_pph_badan.npwp),
		db.select({ npwp: spt_ppn.npwp, jumlah: count() }).from(spt_ppn).groupBy(spt_ppn.npwp),
		db
			.select({ npwp: faktur_pajak.npwpPenjual, jumlah: count() })
			.from(faktur_pajak)
			.groupBy(faktur_pajak.npwpPenjual)
	]);

	const toMap = (list: { npwp: string | null; jumlah: number }[]) =>
		new Map(list.map((row) => [row.npwp ?? '', row.jumlah]));

	const pphBadanByNpwp = toMap(pphBadanCounts);
	const ppnByNpwp = toMap(ppnCounts);
	const fakturByNpwp = toMap(fakturCounts);

	return rows.map((row) => ({
		...row,
		npwp: row.npwp ?? '',
		profilAda: row.profilAda === 1,
		jumlahSptPphBadan: pphBadanByNpwp.get(row.npwp ?? '') ?? 0,
		jumlahSptPpn: ppnByNpwp.get(row.npwp ?? '') ?? 0,
		jumlahFaktur: fakturByNpwp.get(row.npwp ?? '') ?? 0
	}));
});
