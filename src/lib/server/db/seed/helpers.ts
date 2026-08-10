import { readFileSync } from 'node:fs';
import { eq } from 'drizzle-orm';
import type { BatchItem } from 'drizzle-orm/batch';
import { user, wajib_pajak } from '../schema';
import type { SeedContext, TaxpayerSeedAccount } from './context';

/**
 * D1 pays a full network round-trip per statement, so awaiting inserts one by one in a loop
 * is unusably slow for large reference tables. This groups statements into db.batch() calls,
 * which execute as a single request.
 */
export const batchInsert = async <T extends BatchItem<'sqlite'>>(
	db: SeedContext['db'],
	statements: T[],
	chunkSize = 50
): Promise<void> => {
	for (let i = 0; i < statements.length; i += chunkSize) {
		const chunk = statements.slice(i, i + chunkSize);
		if (chunk.length === 1) {
			await chunk[0];
		} else if (chunk.length > 1) {
			await db.batch(chunk as [T, ...T[]]);
		}
	}
};

/**
 * Parses a CSV file with a header row into an array of column->value records.
 * Supports RFC4180-style double-quoted fields (for values containing commas).
 */
export const readCsv = (path: string): Record<string, string>[] => {
	const content = readFileSync(path, 'utf-8').trim();
	const [headerLine, ...lines] = content.split(/\r?\n/);
	const headers = parseCsvLine(headerLine);

	return lines.map((line) => {
		const values = parseCsvLine(line);
		return Object.fromEntries(headers.map((header, i) => [header, values[i] ?? '']));
	});
};

const parseCsvLine = (line: string): string[] => {
	const fields: string[] = [];
	let field = '';
	let inQuotes = false;

	for (let i = 0; i < line.length; i++) {
		const char = line[i];

		if (inQuotes) {
			if (char === '"' && line[i + 1] === '"') {
				field += '"';
				i++;
			} else if (char === '"') {
				inQuotes = false;
			} else {
				field += char;
			}
		} else if (char === '"') {
			inQuotes = true;
		} else if (char === ',') {
			fields.push(field);
			field = '';
		} else {
			field += char;
		}
	}

	fields.push(field);
	return fields;
};

export const seedTaxpayerAccounts = async (
	{ auth, db }: SeedContext,
	accounts: TaxpayerSeedAccount[]
) => {
	for (const account of accounts) {
		const existingUser = await db
			.select({ id: user.id })
			.from(user)
			.where(eq(user.username, account.npwp))
			.limit(1);

		if (existingUser.length === 0) {
			await auth.api.signUpEmail({
				body: {
					name: account.nama,
					email: account.email,
					password: account.password,
					username: account.npwp,
					displayUsername: account.npwp
				}
			});

			console.log(`Created auth user: ${account.nama}`);
		} else {
			console.log(`Auth user exists: ${account.nama}`);
		}

		await db
			.insert(wajib_pajak)
			.values({
				npwp: account.npwp,
				nama: account.nama,
				email: account.email
			})
			.onConflictDoUpdate({
				target: wajib_pajak.npwp,
				set: {
					nama: account.nama,
					email: account.email
				}
			});
	}
};
