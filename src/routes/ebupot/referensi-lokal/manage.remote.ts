import { form, getRequestEvent, query } from '$app/server';
import { isValidIsoDate } from '$lib/helpers/bp-parity';
import { ptkpEbupotValues } from '$lib/helpers/ptkp-ebupot';
import { db } from '$lib/server/db';
import {
	bukti_potong_bp21,
	bukti_potong_bp26,
	ebupot_pengaturan_lokal,
	ebupot_profil_penerima,
	ebupot_receipt_skd_lokal,
	ebupot_sertifikat_lokal,
	fasilitasSertifikatLokalValues,
	jenisWpProfilPenerimaValues,
	negara_spt_pph_badan,
	tempat_kegiatan_usaha,
	wajib_pajak
} from '$lib/server/db/schema';
import { error, invalid } from '@sveltejs/kit';
import { and, asc, desc, eq, or } from 'drizzle-orm';
import * as v from 'valibot';

// Local registry management for BP21/BP26. Everything here is an EDUCATIONAL
// SIMULATION owned by the logged-in account; nothing is verified against DJP.

const RECEIPT_PREFIX = 'SIM-SKD-';

const requireOwner = () => {
	const owner = getRequestEvent().locals.user?.username;
	if (!owner) error(401, 'Belum login');
	return owner;
};

const teks = (label: string, maks: number) =>
	v.pipe(
		v.string(),
		v.trim(),
		v.nonEmpty(`${label} harus diisi`),
		v.maxLength(maks, `${label} maksimal ${maks} karakter`)
	);

const teksOpsional = (label: string, maks: number) =>
	v.optional(
		v.pipe(v.string(), v.trim(), v.maxLength(maks, `${label} maksimal ${maks} karakter`)),
		''
	);

const idOpsional = v.optional(v.pipe(v.string(), v.trim(), v.maxLength(64)), '');

const identitas = v.pipe(
	v.string(),
	v.trim(),
	v.nonEmpty('Nomor identitas WP harus diisi'),
	v.regex(/^[A-Za-z0-9]{3,32}$/, 'Nomor identitas WP harus 3-32 huruf/angka tanpa spasi')
);

const tanggal = (label: string) =>
	v.pipe(
		v.string(),
		v.trim(),
		v.check(isValidIsoDate, `${label} bukan tanggal yang valid (YYYY-MM-DD)`)
	);

export const getReferensiLokal = query(async () => {
	const owner = requireOwner();

	const [wp] = await db
		.select({ id: wajib_pajak.id })
		.from(wajib_pajak)
		.where(eq(wajib_pajak.npwp, owner))
		.limit(1);

	const [branches, profiles, certificates, receipts, setting, negara] = await Promise.all([
		wp
			? db
					.select({
						id: tempat_kegiatan_usaha.id,
						nitku: tempat_kegiatan_usaha.nitku,
						nama: tempat_kegiatan_usaha.nama,
						email: tempat_kegiatan_usaha.email,
						nomorTelepon: tempat_kegiatan_usaha.nomor_telepon,
						alamat: tempat_kegiatan_usaha.alamat,
						kodePos: tempat_kegiatan_usaha.kode_pos
					})
					.from(tempat_kegiatan_usaha)
					.where(eq(tempat_kegiatan_usaha.wajib_pajak, wp.id))
					.orderBy(asc(tempat_kegiatan_usaha.nitku))
			: Promise.resolve([]),
		db
			.select()
			.from(ebupot_profil_penerima)
			.where(eq(ebupot_profil_penerima.npwpPemotong, owner))
			.orderBy(asc(ebupot_profil_penerima.nomorIdentitasWp)),
		db
			.select()
			.from(ebupot_sertifikat_lokal)
			.where(eq(ebupot_sertifikat_lokal.npwpPemotong, owner))
			.orderBy(asc(ebupot_sertifikat_lokal.nomorIdentitasWp), desc(ebupot_sertifikat_lokal.berlakuSampai)),
		db
			.select({
				id: ebupot_receipt_skd_lokal.id,
				nomorReceipt: ebupot_receipt_skd_lokal.nomorReceipt,
				nomorIdentitasWp: ebupot_receipt_skd_lokal.nomorIdentitasWp,
				nama: ebupot_receipt_skd_lokal.nama,
				alamat: ebupot_receipt_skd_lokal.alamat,
				negaraAsalId: ebupot_receipt_skd_lokal.negaraAsalId,
				negaraNama: negara_spt_pph_badan.nama,
				berlakuDari: ebupot_receipt_skd_lokal.berlakuDari,
				berlakuSampai: ebupot_receipt_skd_lokal.berlakuSampai,
				aktif: ebupot_receipt_skd_lokal.aktif
			})
			.from(ebupot_receipt_skd_lokal)
			.leftJoin(
				negara_spt_pph_badan,
				eq(ebupot_receipt_skd_lokal.negaraAsalId, negara_spt_pph_badan.id)
			)
			.where(eq(ebupot_receipt_skd_lokal.npwpPemotong, owner))
			.orderBy(asc(ebupot_receipt_skd_lokal.nomorReceipt)),
		db
			.select({ instansiPemerintah: ebupot_pengaturan_lokal.instansiPemerintah })
			.from(ebupot_pengaturan_lokal)
			.where(eq(ebupot_pengaturan_lokal.npwpPemotong, owner))
			.limit(1),
		db
			.select({ id: negara_spt_pph_badan.id, nama: negara_spt_pph_badan.nama })
			.from(negara_spt_pph_badan)
			.where(eq(negara_spt_pph_badan.aktif, true))
			.orderBy(asc(negara_spt_pph_badan.nama))
	]);

	return {
		owner,
		hasTaxpayer: Boolean(wp),
		branches,
		profiles,
		certificates,
		receipts,
		government: setting[0]?.instansiPemerintah ?? false,
		negara
	};
});

// ---------------------------------------------------------------- Cabang (NITKU)

const SaveCabangSchema = v.object({
	id: idOpsional,
	nitku: v.optional(v.pipe(v.string(), v.trim()), ''),
	nama: teks('Nama cabang', 120),
	email: teksOpsional('Email', 120),
	nomorTelepon: teksOpsional('Nomor telepon', 32),
	alamat: teksOpsional('Alamat', 255),
	kodePos: teksOpsional('Kode pos', 10)
});

export const simpanCabang = form(SaveCabangSchema, async (input, issue) => {
	const owner = requireOwner();

	const [wp] = await db
		.select({ id: wajib_pajak.id })
		.from(wajib_pajak)
		.where(eq(wajib_pajak.npwp, owner))
		.limit(1);
	if (!wp) invalid('Akun Anda belum memiliki data Wajib Pajak.');

	const detail = {
		nama: input.nama,
		email: input.email || null,
		nomor_telepon: input.nomorTelepon || null,
		alamat: input.alamat || null,
		kode_pos: input.kodePos || null
	};

	if (input.id) {
		// NITKU is immutable after creation: BP documents reference it.
		const updated = await db
			.update(tempat_kegiatan_usaha)
			.set(detail)
			.where(
				and(eq(tempat_kegiatan_usaha.id, input.id), eq(tempat_kegiatan_usaha.wajib_pajak, wp.id))
			)
			.returning({ id: tempat_kegiatan_usaha.id });
		if (updated.length === 0) invalid('Cabang tidak ditemukan pada akun Anda.');
		return { message: `Cabang ${input.nama} diperbarui.` };
	}

	if (!/^\d{22}$/.test(input.nitku)) invalid(issue.nitku('NITKU harus 22 digit angka'));
	if (!/^\d{16}$/.test(owner)) {
		invalid('NPWP akun bukan 16 digit sehingga NITKU tidak dapat dibuat.');
	}
	if (!input.nitku.startsWith(owner)) {
		invalid(issue.nitku(`NITKU harus diawali NPWP akun Anda (${owner})`));
	}

	const [exists] = await db
		.select({ id: tempat_kegiatan_usaha.id })
		.from(tempat_kegiatan_usaha)
		.where(eq(tempat_kegiatan_usaha.nitku, input.nitku))
		.limit(1);
	if (exists) invalid(issue.nitku('NITKU sudah terdaftar'));

	let duplicate = false;
	try {
		await db
			.insert(tempat_kegiatan_usaha)
			.values({ ...detail, nitku: input.nitku, wajib_pajak: wp.id });
	} catch {
		// Lost a race on the unique NITKU; re-check instead of reporting a false success.
		const [raced] = await db
			.select({ id: tempat_kegiatan_usaha.id })
			.from(tempat_kegiatan_usaha)
			.where(eq(tempat_kegiatan_usaha.nitku, input.nitku))
			.limit(1);
		if (!raced) throw new Error('Gagal menyimpan cabang');
		duplicate = true;
	}
	if (duplicate) invalid(issue.nitku('NITKU sudah terdaftar'));
	return { message: `Cabang ${input.nama} (${input.nitku}) ditambahkan.` };
});

export const hapusCabang = form(v.object({ id: v.pipe(v.string(), v.nonEmpty()) }), async ({ id }) => {
	const owner = requireOwner();

	const [branch] = await db
		.select({ id: tempat_kegiatan_usaha.id, nitku: tempat_kegiatan_usaha.nitku })
		.from(tempat_kegiatan_usaha)
		.innerJoin(wajib_pajak, eq(tempat_kegiatan_usaha.wajib_pajak, wajib_pajak.id))
		.where(and(eq(tempat_kegiatan_usaha.id, id), eq(wajib_pajak.npwp, owner)))
		.limit(1);
	if (!branch) invalid('Cabang tidak ditemukan pada akun Anda.');

	const [used21] = await db
		.select({ id: bukti_potong_bp21.id })
		.from(bukti_potong_bp21)
		.where(
			or(
				eq(bukti_potong_bp21.nitkuPemotong, branch.nitku),
				eq(bukti_potong_bp21.nitkuPenerima, branch.nitku)
			)
		)
		.limit(1);
	const [used26] = await db
		.select({ id: bukti_potong_bp26.id })
		.from(bukti_potong_bp26)
		.where(eq(bukti_potong_bp26.nitkuPemotong, branch.nitku))
		.limit(1);
	if (used21 || used26) {
		invalid('Cabang sudah dipakai pada bukti potong sehingga tidak dapat dihapus.');
	}

	await db.delete(tempat_kegiatan_usaha).where(eq(tempat_kegiatan_usaha.id, branch.id));
	return { message: `Cabang ${branch.nitku} dihapus.` };
});

// ---------------------------------------------------------------- Profil penerima

const SaveProfilSchema = v.object({
	nomorIdentitasWp: identitas,
	nama: teks('Nama', 120),
	jenisWp: v.picklist(jenisWpProfilPenerimaValues, 'Jenis WP harus dipilih'),
	statusPtkp: v.optional(v.union([v.literal(''), v.picklist(ptkpEbupotValues)]), '')
});

export const simpanProfil = form(SaveProfilSchema, async (input, issue) => {
	const owner = requireOwner();

	if (input.jenisWp !== 'luar_negeri' && !/^\d{15,16}$/.test(input.nomorIdentitasWp)) {
		invalid(issue.nomorIdentitasWp('NPWP/NIK harus 15 atau 16 digit angka'));
	}
	if (input.statusPtkp && input.jenisWp !== 'orang_pribadi') {
		invalid(issue.statusPtkp('Status PTKP hanya untuk Orang Pribadi'));
	}

	const values = {
		nama: input.nama,
		jenisWp: input.jenisWp,
		statusPtkp: input.statusPtkp || null
	};
	await db
		.insert(ebupot_profil_penerima)
		.values({ npwpPemotong: owner, nomorIdentitasWp: input.nomorIdentitasWp, ...values })
		.onConflictDoUpdate({
			target: [ebupot_profil_penerima.npwpPemotong, ebupot_profil_penerima.nomorIdentitasWp],
			set: values
		});
	return { message: `Profil penerima ${input.nomorIdentitasWp} disimpan (simulasi lokal).` };
});

export const hapusProfil = form(v.object({ id: v.pipe(v.string(), v.nonEmpty()) }), async ({ id }) => {
	const owner = requireOwner();
	const deleted = await db
		.delete(ebupot_profil_penerima)
		.where(and(eq(ebupot_profil_penerima.id, id), eq(ebupot_profil_penerima.npwpPemotong, owner)))
		.returning({ id: ebupot_profil_penerima.id });
	if (deleted.length === 0) invalid('Profil tidak ditemukan pada akun Anda.');
	return { message: 'Profil penerima dihapus.' };
});

// ---------------------------------------------------------------- Sertifikat fasilitas

const SaveSertifikatSchema = v.pipe(
	v.object({
		id: idOpsional,
		nomorIdentitasWp: identitas,
		fasilitasKode: v.picklist(fasilitasSertifikatLokalValues, 'Fasilitas harus 4, 8, atau 10'),
		nomorSertifikat: teks('Nomor sertifikat', 64),
		berlakuDari: tanggal('Berlaku dari'),
		berlakuSampai: tanggal('Berlaku sampai')
	}),
	v.forward(
		v.partialCheck(
			[['berlakuDari'], ['berlakuSampai']],
			(i) => i.berlakuDari <= i.berlakuSampai,
			'Berlaku sampai tidak boleh sebelum berlaku dari'
		),
		['berlakuSampai']
	)
);

export const simpanSertifikat = form(SaveSertifikatSchema, async (input) => {
	const owner = requireOwner();
	const values = {
		nomorIdentitasWp: input.nomorIdentitasWp,
		fasilitasKode: input.fasilitasKode,
		nomorSertifikat: input.nomorSertifikat,
		berlakuDari: input.berlakuDari,
		berlakuSampai: input.berlakuSampai
	};

	if (input.id) {
		const updated = await db
			.update(ebupot_sertifikat_lokal)
			.set(values)
			.where(
				and(eq(ebupot_sertifikat_lokal.id, input.id), eq(ebupot_sertifikat_lokal.npwpPemotong, owner))
			)
			.returning({ id: ebupot_sertifikat_lokal.id });
		if (updated.length === 0) invalid('Sertifikat tidak ditemukan pada akun Anda.');
		return { message: 'Sertifikat diperbarui (simulasi lokal).' };
	}

	await db.insert(ebupot_sertifikat_lokal).values({ ...values, npwpPemotong: owner });
	return { message: 'Sertifikat ditambahkan (simulasi lokal).' };
});

const StatusSchema = v.object({
	id: v.pipe(v.string(), v.nonEmpty()),
	aktif: v.picklist(['1', '0'])
});

export const ubahStatusSertifikat = form(StatusSchema, async ({ id, aktif }) => {
	const owner = requireOwner();
	const updated = await db
		.update(ebupot_sertifikat_lokal)
		.set({ aktif: aktif === '1' })
		.where(and(eq(ebupot_sertifikat_lokal.id, id), eq(ebupot_sertifikat_lokal.npwpPemotong, owner)))
		.returning({ id: ebupot_sertifikat_lokal.id });
	if (updated.length === 0) invalid('Sertifikat tidak ditemukan pada akun Anda.');
	return { message: aktif === '1' ? 'Sertifikat diaktifkan.' : 'Sertifikat dinonaktifkan.' };
});

// ---------------------------------------------------------------- Receipt SKD lokal

const SaveReceiptSchema = v.pipe(
	v.object({
		id: idOpsional,
		nomorReceipt: v.pipe(
			v.string(),
			v.trim(),
			v.toUpperCase(),
			v.regex(
				/^SIM-SKD-[A-Z0-9][A-Z0-9-]{0,39}$/,
				`Nomor receipt harus diawali ${RECEIPT_PREFIX} (huruf besar/angka/tanda hubung)`
			)
		),
		nomorIdentitasWp: identitas,
		nama: teks('Nama', 120),
		alamat: teks('Alamat', 255),
		negaraAsalId: teks('Negara asal', 64),
		berlakuDari: tanggal('Berlaku dari'),
		berlakuSampai: tanggal('Berlaku sampai')
	}),
	v.forward(
		v.partialCheck(
			[['berlakuDari'], ['berlakuSampai']],
			(i) => i.berlakuDari <= i.berlakuSampai,
			'Berlaku sampai tidak boleh sebelum berlaku dari'
		),
		['berlakuSampai']
	)
);

export const simpanReceipt = form(SaveReceiptSchema, async (input, issue) => {
	const owner = requireOwner();

	const [negara] = await db
		.select({ id: negara_spt_pph_badan.id })
		.from(negara_spt_pph_badan)
		.where(and(eq(negara_spt_pph_badan.id, input.negaraAsalId), eq(negara_spt_pph_badan.aktif, true)))
		.limit(1);
	if (!negara) invalid(issue.negaraAsalId('Negara asal tidak ditemukan atau tidak aktif'));

	const values = {
		nomorIdentitasWp: input.nomorIdentitasWp,
		nama: input.nama,
		alamat: input.alamat,
		negaraAsalId: input.negaraAsalId,
		berlakuDari: input.berlakuDari,
		berlakuSampai: input.berlakuSampai
	};

	if (input.id) {
		const [current] = await db
			.select({ nomorReceipt: ebupot_receipt_skd_lokal.nomorReceipt })
			.from(ebupot_receipt_skd_lokal)
			.where(
				and(
					eq(ebupot_receipt_skd_lokal.id, input.id),
					eq(ebupot_receipt_skd_lokal.npwpPemotong, owner)
				)
			)
			.limit(1);
		if (!current) invalid('Receipt tidak ditemukan pada akun Anda.');
		// The number is the key BP26 documents refer to, so it cannot change.
		if (current.nomorReceipt !== input.nomorReceipt) {
			invalid(issue.nomorReceipt('Nomor receipt tidak dapat diubah'));
		}
		await db
			.update(ebupot_receipt_skd_lokal)
			.set(values)
			.where(
				and(
					eq(ebupot_receipt_skd_lokal.id, input.id),
					eq(ebupot_receipt_skd_lokal.npwpPemotong, owner)
				)
			);
		return { message: 'Receipt diperbarui (SIMULASI, bukan verifikasi DJP).' };
	}

	const [duplicate] = await db
		.select({ id: ebupot_receipt_skd_lokal.id })
		.from(ebupot_receipt_skd_lokal)
		.where(
			and(
				eq(ebupot_receipt_skd_lokal.npwpPemotong, owner),
				eq(ebupot_receipt_skd_lokal.nomorReceipt, input.nomorReceipt)
			)
		)
		.limit(1);
	if (duplicate) invalid(issue.nomorReceipt('Nomor receipt sudah terdaftar'));

	let raced = false;
	try {
		await db
			.insert(ebupot_receipt_skd_lokal)
			.values({ ...values, npwpPemotong: owner, nomorReceipt: input.nomorReceipt });
	} catch {
		const [now] = await db
			.select({ id: ebupot_receipt_skd_lokal.id })
			.from(ebupot_receipt_skd_lokal)
			.where(
				and(
					eq(ebupot_receipt_skd_lokal.npwpPemotong, owner),
					eq(ebupot_receipt_skd_lokal.nomorReceipt, input.nomorReceipt)
				)
			)
			.limit(1);
		if (!now) throw new Error('Gagal menyimpan receipt');
		raced = true;
	}
	if (raced) invalid(issue.nomorReceipt('Nomor receipt sudah terdaftar'));
	return { message: `Receipt ${input.nomorReceipt} ditambahkan (SIMULASI, bukan verifikasi DJP).` };
});

export const ubahStatusReceipt = form(StatusSchema, async ({ id, aktif }) => {
	const owner = requireOwner();
	const updated = await db
		.update(ebupot_receipt_skd_lokal)
		.set({ aktif: aktif === '1' })
		.where(
			and(eq(ebupot_receipt_skd_lokal.id, id), eq(ebupot_receipt_skd_lokal.npwpPemotong, owner))
		)
		.returning({ id: ebupot_receipt_skd_lokal.id });
	if (updated.length === 0) invalid('Receipt tidak ditemukan pada akun Anda.');
	return { message: aktif === '1' ? 'Receipt diaktifkan.' : 'Receipt dinonaktifkan.' };
});

// ---------------------------------------------------------------- Pengaturan

export const simpanPengaturan = form(
	v.object({ instansiPemerintah: v.optional(v.boolean(), false) }),
	async ({ instansiPemerintah }) => {
		const owner = requireOwner();
		await db
			.insert(ebupot_pengaturan_lokal)
			.values({ npwpPemotong: owner, instansiPemerintah })
			.onConflictDoUpdate({
				target: ebupot_pengaturan_lokal.npwpPemotong,
				set: { instansiPemerintah }
			});
		return {
			message: instansiPemerintah
				? 'Pemotong ditandai instansi pemerintah (simulasi).'
				: 'Pemotong bukan instansi pemerintah.'
		};
	}
);
