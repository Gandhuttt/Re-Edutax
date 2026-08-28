import process from 'node:process';
import { writeFileSync } from 'node:fs';
import { getPlatformProxy } from 'wrangler';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../schema';
import { seedRegistry } from './batches/registry';
import type { SeedContext } from './context';

// Generates the exact SQL that seed-reference.ts's batches run, by executing
// them for real against the local D1 emulation (so batches that read back
// their own earlier writes -- e.g. 005-lampiran-1-akun looking up a
// sektor_usaha id seeded by 003 earlier in the same run -- see correct data,
// unlike a fully-faked driver) while a logging proxy captures every
// prepare/bind call. A Node script can't get a live binding to production's
// real D1 the way a deployed Worker can, so the output is meant to be handed
// to `wrangler d1 execute DB --remote --file=...` instead.

type Captured = { sql: string; params: unknown[] };

function wrapWithLogger(real: D1Database): { d1: D1Database; captured: Captured[] } {
	const captured: Captured[] = [];

	const d1 = {
		prepare: (sql: string) => {
			const realStmt = real.prepare(sql);
			return {
				bind: (...params: unknown[]) => {
					captured.push({ sql, params });
					return realStmt.bind(...params);
				},
				run: () => realStmt.run(),
				all: () => realStmt.all(),
				first: (col?: string) => (col === undefined ? realStmt.first() : realStmt.first(col)),
				raw: () => realStmt.raw()
			};
		},
		batch: (statements: unknown[]) => real.batch(statements as Parameters<D1Database['batch']>[0]),
		exec: (sql: string) => real.exec(sql),
		dump: () => real.dump()
	} as unknown as D1Database;

	return { d1, captured };
}

function inlineSql({ sql, params }: Captured): string {
	let i = 0;
	const inlined = sql.replace(/\?/g, () => {
		const value = params[i++];
		if (value === null || value === undefined) return 'NULL';
		if (typeof value === 'number') return String(value);
		if (typeof value === 'boolean') return value ? '1' : '0';
		return `'${String(value).replace(/'/g, "''")}'`;
	});
	return `${inlined};`;
}

const outputPath = process.argv[2];
if (!outputPath) {
	console.error('Usage: tsx generate-reference-sql.ts <output.sql>');
	process.exit(1);
}

const run = async () => {
	const { env, dispose } = await getPlatformProxy<{ DB: D1Database }>();
	const { d1, captured } = wrapWithLogger(env.DB);
	const db = drizzle(d1, { schema });
	const context = { db } as unknown as SeedContext;

	try {
		for (const { batch, kind } of seedRegistry) {
			if (kind !== 'reference') continue;
			console.log(`Generating SQL for: ${batch.name}`);
			await batch.run(context);
		}
	} finally {
		await dispose();
	}

	// Batches like 005-lampiran-1-akun issue read-back SELECTs (e.g. looking up
	// a sektor_usaha id seeded earlier in the same run) that also pass through
	// prepare/bind -- drop those so the output file is a clean write-only
	// script, safe to hand to `wrangler d1 execute --remote --file=...`.
	const writes = captured.filter((entry) => /^\s*(insert|update|delete)\b/i.test(entry.sql));
	const sqlText = writes.map(inlineSql).join('\n');
	writeFileSync(outputPath, sqlText);
	console.log(`\nWrote ${writes.length} statements to ${outputPath}`);
};

run().catch((error) => {
	console.error('Failed to generate reference SQL:', error);
	process.exit(1);
});
