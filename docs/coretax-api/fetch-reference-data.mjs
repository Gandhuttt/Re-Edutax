// Fetch Coretax reference-data lists (the contents of every dropdown in the
// live forms) straight from DJP's reference endpoint.
//
//   node docs/coretax-api/fetch-reference-data.mjs                  # the 1770 subset
//   node docs/coretax-api/fetch-reference-data.mjs --all            # all 425 known types
//   node docs/coretax-api/fetch-reference-data.mjs --types A,B,C    # named types
//   node docs/coretax-api/fetch-reference-data.mjs --all --out x.json --lang en-US
//
// No authentication is involved. The portal's own HTTP interceptor explicitly
// skips this URL when attaching auth headers:
//
//   ot && !qe.url.includes("/connect/") && !qe.url.includes("/referencedata/api/currentreferencedata")
//
// so the endpoint is public and nothing here touches a taxpayer account. It
// replaces opening each dropdown in the UI and reading the option panel by hand,
// and unlike UI capture it yields the Code alongside the CodeDescription — the
// mapping Coretax itself uses to fill the disabled `Kode` cells.
//
// See ./README.md for how the type names were obtained and the pitfalls.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const BASE = 'https://coretaxdjp.pajak.go.id/referencedata/api/currentreferencedata';

// Types the SPT 1770 forms actually use. Everything else is available via --all.
const SUBSET_1770 = [
	// L-1 harta / utang
	'ASSET_CASH', 'ASSET_RECEIVEABLE', 'ASSET_INVESTMENTS', 'ASSET_MOVEABLE',
	'ASSET_NONMOVEABLE', 'ASSET_OTHER',
	// L-3A-4 Bagian B
	'DOMESTIC_INCOME',
	// L-3C penyusutan / amortisasi fiskal
	'TANGIBLE_ASSET', 'GROUP_OF_BUILDINGS', 'INTANGIBLE_ASSET',
	'COMMERCIAL_METHOD', 'FISCAL_METHOD',
	// L-3D daftar nominatif
	'DEDUCTION_METHOD', 'TYPE_OF_FULFILLMENT', 'TYPE_OF_PROMOTION_COST'
];

const argv = process.argv.slice(2);
const flag = (name) => {
	const i = argv.indexOf(name);
	return i >= 0 ? (argv[i + 1] ?? true) : undefined;
};

const lang = flag('--lang') ?? 'id-ID';
const outPath = flag('--out') ?? join(HERE, argv.includes('--all') ? 'reference-data-all.json' : 'reference-data-1770.json');

let types;
if (argv.includes('--all')) {
	types = readFileSync(join(HERE, 'reference-type-names.txt'), 'utf8').trim().split('\n').filter(Boolean);
} else if (flag('--types')) {
	types = String(flag('--types')).split(',').map((t) => t.trim()).filter(Boolean);
} else {
	types = SUBSET_1770;
}

// 20 per request keeps the URL well short of any limit and the load light.
const BATCH = 20;
const PAUSE_MS = 300;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const out = {};
const failures = [];

for (let i = 0; i < types.length; i += BATCH) {
	const chunk = types.slice(i, i + BATCH);
	const url = `${BASE}/${lang}/${chunk.join(',')}`;
	try {
		const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
		if (!res.ok) {
			failures.push(`${chunk.join(',')} -> HTTP ${res.status}`);
		} else {
			const body = await res.json();
			for (const entry of body.Payload ?? []) {
				const rows = (entry.Details ?? []).map((d) => ({
					Code: d.Code,
					CodeName: d.CodeName,
					CodeDescription: d.CodeDescription,
					// ParameterData carries structured extras on some lists — the
					// income-tax bands on PIT_TAX_RATE, for instance.
					...(d.ParameterData && d.ParameterData !== '{}' ? { ParameterData: d.ParameterData } : {})
				}));
				if (rows.length) out[entry.ReferenceDataType] = rows;
			}
		}
	} catch (err) {
		failures.push(`${chunk.join(',')} -> ${err.message}`);
	}
	process.stderr.write(`\r${Math.min(i + BATCH, types.length)}/${types.length} requested, ${Object.keys(out).length} lists`);
	if (i + BATCH < types.length) await sleep(PAUSE_MS);
}

writeFileSync(outPath, JSON.stringify(out, null, 1) + '\n');

const options = Object.values(out).reduce((sum, rows) => sum + rows.length, 0);
process.stderr.write(`\n\n${Object.keys(out).length} lists, ${options} options -> ${outPath}\n`);
if (failures.length) {
	process.stderr.write(`${failures.length} failed batches:\n  ${failures.slice(0, 10).join('\n  ')}\n`);
	process.exitCode = 1;
}
