import { form, getRequestEvent, query } from '$app/server';
import { db } from '$lib/server/db';
import {
	bukti_potong_bp21,
	bukti_potong_bp26,
	tempat_kegiatan_usaha,
	wajib_pajak
} from '$lib/server/db/schema';
import { error, invalid } from '@sveltejs/kit';
import { and, asc, eq, or } from 'drizzle-orm';
import * as v from 'valibot';

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

const findWajibPajak = async (npwp: string) => {
	const [wp] = await db
		.select({ id: wajib_pajak.id })
		.from(wajib_pajak)
		.where(eq(wajib_pajak.npwp, npwp))
		.limit(1);
	return wp;
};

export const getTempatKegiatanUsaha = query(async () => {
	const owner = requireOwner();
	const wp = await findWajibPajak(owner);

	const rows = wp
		? await db
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
		: [];

	return { owner, hasTaxpayer: Boolean(wp), rows };
});

const SaveSchema = v.object({
	id: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(64)), ''),
	nitku: v.optional(v.pipe(v.string(), v.trim()), ''),
	nama: teks('Nama TKU', 120),
	email: teksOpsional('Email', 120),
	nomorTelepon: teksOpsional('Nomor telepon', 32),
	alamat: teksOpsional('Alamat', 255),
	kodePos: teksOpsional('Kode pos', 10)
});

export const simpanTempatKegiatanUsaha = form(SaveSchema, async (input, issue) => {
	const owner = requireOwner();

	const wp = await findWajibPajak(owner);
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
		if (updated.length === 0) invalid('Tempat kegiatan usaha tidak ditemukan pada akun Anda.');
		return { message: `Tempat kegiatan usaha ${input.nama} diperbarui.` };
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
		if (!raced) throw new Error('Gagal menyimpan tempat kegiatan usaha');
		duplicate = true;
	}
	if (duplicate) invalid(issue.nitku('NITKU sudah terdaftar'));
	return { message: `Tempat kegiatan usaha ${input.nama} (${input.nitku}) ditambahkan.` };
});

export const hapusTempatKegiatanUsaha = form(
	v.object({ id: v.pipe(v.string(), v.nonEmpty()) }),
	async ({ id }) => {
		const owner = requireOwner();

		const [tku] = await db
			.select({ id: tempat_kegiatan_usaha.id, nitku: tempat_kegiatan_usaha.nitku })
			.from(tempat_kegiatan_usaha)
			.innerJoin(wajib_pajak, eq(tempat_kegiatan_usaha.wajib_pajak, wajib_pajak.id))
			.where(and(eq(tempat_kegiatan_usaha.id, id), eq(wajib_pajak.npwp, owner)))
			.limit(1);
		if (!tku) invalid('Tempat kegiatan usaha tidak ditemukan pada akun Anda.');

		const [used21] = await db
			.select({ id: bukti_potong_bp21.id })
			.from(bukti_potong_bp21)
			.where(
				or(
					eq(bukti_potong_bp21.nitkuPemotong, tku.nitku),
					eq(bukti_potong_bp21.nitkuPenerima, tku.nitku)
				)
			)
			.limit(1);
		const [used26] = await db
			.select({ id: bukti_potong_bp26.id })
			.from(bukti_potong_bp26)
			.where(eq(bukti_potong_bp26.nitkuPemotong, tku.nitku))
			.limit(1);
		if (used21 || used26) {
			invalid('Tempat kegiatan usaha sudah dipakai pada bukti potong sehingga tidak dapat dihapus.');
		}

		await db.delete(tempat_kegiatan_usaha).where(eq(tempat_kegiatan_usaha.id, tku.id));
		return { message: `Tempat kegiatan usaha ${tku.nitku} dihapus.` };
	}
);
