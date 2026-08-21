import { writeFileSync } from 'node:fs';
import process from 'node:process';
import { getPlatformProxy } from 'wrangler';

/**
 * Dumps a seeded reference table out of the local D1 as idempotent upserts, so
 * it can be pushed to prod with:
 *
 *   wrangler d1 execute DB --remote --file <out.sql>
 *
 * `npm run db:seed` goes through getPlatformProxy, which only ever reaches the
 * local D1 — there is no seed path to the remote database. Reference tables
 * therefore have to travel as SQL, and this is that step made repeatable.
 *
 * The SQL is written straight to <out.sql> rather than to stdout: getPlatformProxy
 * prints its own banner ("Using secrets defined in .env") to stdout, and a shell
 * redirect drops that line at the top of the file, where D1 rejects the entire
 * batch with `near "Using": syntax error`.
 *
 * Seed ids are deterministic (sektor-namespaced and index-based), so the
 * ON CONFLICT clause makes re-running an export safe: a second apply updates
 * rows in place rather than colliding or duplicating.
 */
const quote = (value: unknown): string => {
	if (value === null || value === undefined) return 'NULL';
	if (typeof value === 'number') return String(value);
	return `'${String(value).replaceAll("'", "''")}'`;
};

const main = async () => {
	const [table, outPath] = process.argv.slice(2);

	if (!table || !outPath) {
		console.error('usage: tsx scripts/export-reference-table.ts <table_name> <out.sql>');
		process.exit(1);
	}

	if (!/^[a-z0-9_]+$/.test(table)) {
		throw new Error(`refusing to interpolate a non-identifier table name: ${table}`);
	}

	const { env, dispose } = await getPlatformProxy<{ DB: D1Database }>();

	try {
		const { results } = await env.DB.prepare(`SELECT * FROM ${table}`).all();

		if (results.length === 0) {
			throw new Error(`${table} is empty in the local D1 — run npm run db:seed first`);
		}

		const columns = Object.keys(results[0]);
		const assignments = columns
			.filter((column) => column !== 'id')
			.map((column) => `${column} = excluded.${column}`)
			.join(', ');

		const lines = results.map((row) => {
			const values = columns.map((column) => quote((row as Record<string, unknown>)[column]));

			return (
				`INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')}) ` +
				`ON CONFLICT(id) DO UPDATE SET ${assignments};`
			);
		});

		const header = `-- ${table}: ${results.length} rows exported from the local D1`;
		writeFileSync(outPath, `${header}\n${lines.join('\n')}\n`);

		console.log(`Wrote ${results.length} rows to ${outPath}`);
	} finally {
		await dispose();
	}
};

await main();
