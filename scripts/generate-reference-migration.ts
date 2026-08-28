import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import process from 'node:process';

// Wraps generate-reference-sql.ts with the bookkeeping a reference-data
// change otherwise needs by hand: picking the next migration number, writing
// the drizzle/meta journal entry, and copying the snapshot forward with a
// fresh id/prevId chain (this is a data-only migration, so the schema
// snapshot itself never changes -- only the chain linking it to the previous
// one does). Run this against a local D1 that's already fully migrated
// (`npm run db:migrate`); the generator seeds reference batches for real
// against whatever's already there, so starting from a stale or partially
// migrated DB bakes bad ids into the output.

const journalPath = 'drizzle/meta/_journal.json';
const journal = JSON.parse(readFileSync(journalPath, 'utf8'));

const maxIdx = Math.max(...journal.entries.map((e: { idx: number }) => e.idx));
const nextIdx = maxIdx + 1;
const paddedIdx = String(nextIdx).padStart(4, '0');
const paddedPrevIdx = String(maxIdx).padStart(4, '0');
const tag = `${paddedIdx}_reference_data`;
const sqlPath = `drizzle/${tag}.sql`;
const snapshotPath = `drizzle/meta/${paddedIdx}_snapshot.json`;
const prevSnapshotPath = `drizzle/meta/${paddedPrevIdx}_snapshot.json`;

if (existsSync(sqlPath)) {
	console.error(`${sqlPath} already exists -- refusing to overwrite`);
	process.exit(1);
}

console.log(`Generating ${sqlPath}...`);
execFileSync('npx', ['tsx', 'src/lib/server/db/seed/generate-reference-sql.ts', sqlPath], {
	stdio: 'inherit'
});

journal.entries.push({ idx: nextIdx, version: '6', when: Date.now(), tag, breakpoints: true });
writeFileSync(journalPath, JSON.stringify(journal, null, 2) + '\n');
console.log(`Added journal entry for ${tag}`);

const prevSnapshot = JSON.parse(readFileSync(prevSnapshotPath, 'utf8'));
const snapshot = { ...prevSnapshot, id: randomUUID(), prevId: prevSnapshot.id };
writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2) + '\n');
console.log(`Wrote ${snapshotPath}`);

console.log(`\nDone. Next steps:`);
console.log(`  1. Review ${sqlPath}`);
console.log(`  2. rm -rf .wrangler && npm run db:migrate   # verify against a fresh local D1`);
console.log(`  3. Commit and push`);
