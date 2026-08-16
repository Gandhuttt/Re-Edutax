import { eq } from 'drizzle-orm';
import { auth } from './auth';
import { db } from './db';
import { npwp_terbit, user, wajib_pajak } from './db/schema';

export type NewPeserta = {
	npwp: string;
	/** Peserta number within the batch, or the serial within the lone population. */
	urut: number;
	nama: string;
	email: string;
	password: string;
	/** Null creates a lone peserta, numbered outside the reserved batch digits. */
	batchId: string | null;
};

export type CreatePesertaResult = { npwp: string; nama: string } & (
	| { ok: true }
	| { ok: false; message: string }
);

/**
 * Creates the Better Auth login and the matching wajib_pajak profile — the same pair the seed
 * batches produce, so accounts made from the dashboard are indistinguishable from seeded ones.
 * `headers` must carry the admin session; the admin endpoint re-checks it.
 *
 * The number is written to the npwp_terbit ledger *before* the account, so a failure halfway
 * through retires the number rather than letting it be handed to somebody else later.
 */
export const createPesertaAccount = async (
	headers: Headers,
	{ npwp, urut, nama, email, password, batchId }: NewPeserta
): Promise<CreatePesertaResult> => {
	const [sudahTerbit] = await db
		.select({ npwp: npwp_terbit.npwp })
		.from(npwp_terbit)
		.where(eq(npwp_terbit.npwp, npwp))
		.limit(1);

	if (sudahTerbit) {
		return { npwp, nama, ok: false, message: `NPWP ${npwp} sudah pernah diterbitkan` };
	}

	const [existingUsername] = await db
		.select({ id: user.id })
		.from(user)
		.where(eq(user.username, npwp))
		.limit(1);

	if (existingUsername) {
		return { npwp, nama, ok: false, message: `NPWP ${npwp} sudah terdaftar` };
	}

	const [existingEmail] = await db
		.select({ id: user.id })
		.from(user)
		.where(eq(user.email, email.toLowerCase()))
		.limit(1);

	if (existingEmail) {
		return { npwp, nama, ok: false, message: `Email ${email} sudah dipakai akun lain` };
	}

	await db.insert(npwp_terbit).values({ npwp, urut, namaPertama: nama, batchId });

	try {
		await auth.api.createUser({
			headers,
			body: {
				name: nama,
				email,
				password,
				role: 'user',
				data: {
					username: npwp,
					displayUsername: npwp
				}
			}
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Gagal membuat akun';
		return { npwp, nama, ok: false, message };
	}

	await db
		.insert(wajib_pajak)
		.values({ npwp, nama, email, batchId })
		.onConflictDoUpdate({
			target: wajib_pajak.npwp,
			set: { nama, email, batchId }
		});

	return { npwp, nama, ok: true };
};
