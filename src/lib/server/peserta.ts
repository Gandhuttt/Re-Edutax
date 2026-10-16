import { and, eq } from 'drizzle-orm';
import { auth } from './auth';
import { db } from './db';
import { account, npwp_terbit, user, wajib_pajak } from './db/schema';

export type NewPeserta = {
	npwp: string;
	/**
	 * Peserta number within the batch, or the serial within the lone population. Null for a
	 * `nik` batch, where the NPWP is the peserta's own NIK and no number is issued.
	 */
	urut: number | null;
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
	// A NIK is the peserta's own identity, not a number we issue, so it never enters the
	// ledger: retiring it after a failure would lock that person out of registering again.
	if (urut !== null) {
		const [sudahTerbit] = await db
			.select({ npwp: npwp_terbit.npwp })
			.from(npwp_terbit)
			.where(eq(npwp_terbit.npwp, npwp))
			.limit(1);

		if (sudahTerbit) {
			return { npwp, nama, ok: false, message: `NPWP ${npwp} sudah pernah diterbitkan` };
		}
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

	if (urut !== null) {
		await db.insert(npwp_terbit).values({ npwp, urut, namaPertama: nama, batchId });
	}

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

export type AkunPeserta = {
	npwp: string;
	nama: string;
	email: string;
	password: string;
	batchId: string;
	nomorTelepon: string;
};

/**
 * Public self-registration path: guarantees the login and wajib_pajak profile exist, and is
 * safe to run again after a partial failure.
 *
 * There is no admin session to forward, so the login is written through Better Auth's internal
 * adapter (the same two calls the admin endpoint makes). Only callers that have already vetted
 * the registrant (Turnstile on /daftar) may use it.
 *
 * Idempotency is what makes the registration recoverable: a login already owned by this NPWP
 * *and* this email is the same registration's earlier attempt and is reused; anything else is a
 * genuine conflict and throws.
 *
 * Reuse still checks that the credential (the password) exists. A user row can be left without
 * one: the Worker can be interrupted between createUser and linkAccount, or the compensating
 * deleteUser below can itself fail. Such a user can never sign in, so treating it as complete
 * would mark the registration `selesai` with a login that does not work.
 */
export const ensurePesertaAccount = async ({ npwp, nama, email, password, batchId, nomorTelepon }: AkunPeserta) => {
	const emailKecil = email.toLowerCase();
	const context = await auth.$context;
	const [pemilikNpwp] = await db
		.select({ id: user.id, email: user.email })
		.from(user)
		.where(eq(user.username, npwp))
		.limit(1);

	if (pemilikNpwp && pemilikNpwp.email !== emailKecil) {
		throw new Error(`NPWP ${npwp} sudah dipakai akun lain`);
	}

	let userId = pemilikNpwp?.id;
	const userBaru = !pemilikNpwp;

	if (!userId) {
		const [pemilikEmail] = await db.select({ id: user.id }).from(user).where(eq(user.email, emailKecil)).limit(1);

		if (pemilikEmail) {
			throw new Error(`Email ${email} sudah dipakai akun lain`);
		}

		const dibuat = await context.internalAdapter.createUser({
			name: nama,
			email: emailKecil,
			role: 'user',
			username: npwp,
			displayUsername: npwp
		});

		if (!dibuat) throw new Error('Gagal membuat akun');

		userId = dibuat.id;
	}

	const [kredensial] = await db
		.select({ id: account.id })
		.from(account)
		.where(and(eq(account.userId, userId), eq(account.providerId, 'credential')))
		.limit(1);

	if (!kredensial) {
		try {
			await context.internalAdapter.linkAccount({
				accountId: userId,
				providerId: 'credential',
				password: await context.password.hash(password),
				userId
			});
		} catch (error) {
			// Undo only a user created by this call. If the undo fails too, the next attempt takes the
			// reuse path above and links the missing credential, so the failure is logged, not fatal.
			if (userBaru) {
				await context.internalAdapter.deleteUser(userId).catch((hapusError) => {
					console.error(`Gagal membatalkan user ${userId} tanpa kredensial`, hapusError);
				});
			}

			throw error;
		}
	}

	await db
		.insert(wajib_pajak)
		.values({ npwp, nama, email: emailKecil, batchId, nomor_telepon: nomorTelepon })
		.onConflictDoUpdate({
			target: wajib_pajak.npwp,
			set: { nama, email: emailKecil, batchId, nomor_telepon: nomorTelepon }
		});
};
