# Coretax internals: bundle and reference data

Two ways to learn what the live DJP Coretax forms actually do, both of which beat
clicking through the UI. Recorded 2026-08-19; see `../bundle-diff-1770.md` for
what the first one produced and `../ui-reference/README.md` for how these relate
to the hand-captured UI notes.

## 1. The deployed JavaScript bundle is the spec

The compiled Angular bundle is the logic actually running in the form, so there
is no gap between what you read and what taxpayers get. Fetch it with
`curl --compressed` — the origin serves brotli, and without that flag you get
bytes that look like a corrupt file:

```sh
# get the current chunk names from an open returnsheet page:
#   performance.getEntriesByType('resource').map(r => r.name).filter(n => n.endsWith('.js'))
curl -sS --compressed -o main.js \
  https://coretaxdjp.pajak.go.id/returnsheets-portal/id-ID/main.<hash>.js
curl -sS --compressed -o pit.js \
  https://coretaxdjp.pajak.go.id/returnsheets-portal/id-ID/827.<hash>.js
```

`main.*.js` is the app shell and shared enums; the SPT PPh OP form (Induk plus
every lampiran) is a lazy chunk, `827.1117977ff84ffcd9.js` at time of writing.
The hash is the build fingerprint, so re-check it before trusting an older
extraction.

**What the bundle cannot tell you:** whatever DJP's backend does on submit (a
separate implementation, never seen), and the contents of any reference list —
for which see below.

## 2. The reference-data endpoint is public

Every dropdown's contents, with the `Code` that the UI hides:

```
GET https://coretaxdjp.pajak.go.id/referencedata/api/currentreferencedata/{lang}/{TYPE1,TYPE2,...}
Content-Type: application/json
```

No authentication. The portal's own HTTP interceptor explicitly skips this URL
when attaching auth headers:

```js
ot && !qe.url.includes("/connect/") && !qe.url.includes("/referencedata/api/currentreferencedata")
```

so nothing here touches a taxpayer account. Response shape:

```json
{ "IsSuccessful": true,
  "Payload": [ { "ReferenceDataType": "DOMESTIC_INCOME",
                 "Details": [ { "Code": "402", "CodeName": "402",
                                "CodeDescription": "Hibah",
                                "ParameterData": "{}" } ] } ] }
```

Use `./fetch-reference-data.mjs`:

```sh
node docs/coretax-api/fetch-reference-data.mjs               # the 27 lists SPT 1770 needs
node docs/coretax-api/fetch-reference-data.mjs --all         # all 425 known types
node docs/coretax-api/fetch-reference-data.mjs --types PIT_TAX_RATE --out /tmp/rates.json
```

### Why this matters

It replaces opening each dropdown in the UI and transcribing the option panel —
how `../ui-reference/coretax/spt-1770-lampiran/REFERENCE-LISTS.txt` was built, at
20 lists over one session. More importantly it yields the **Code alongside the
CodeDescription**, which the UI never shows: Coretax fills the disabled `Kode`
cells by deriving them from the selected description. That mapping is what
`MODAL-FIELDS.md` recorded as unavailable, and having it retired the
plain-text-`Kode` workaround — seed batch 016 now stores code/description pairs
for 19 of the 20 lampiran lists and the app derives `Kode` as Coretax does.

Reconciling the hand-captured lists against the endpoint also **repaired 78
descriptions** that had been transcribed from a clipped option panel and stored
truncated mid-word. Match options by description, case-insensitively and
tolerating a truncated prefix; never match by position, because the endpoint
returns each list in its own order, unrelated to display order.

Two cautions this produced:

- `COUNTRY_CODE` contains **genuine duplicate descriptions** — "Angola" appears
  as both `AGO` and `AIA` (which is really Anguilla), "Jersey" as `JEY` and
  `JE`. This is DJP's own data error, faithfully reflected in the UI capture. A
  description→code map necessarily collapses these; it does not matter today
  because no `Kode` cell derives from the negara list, but do not "clean it up".
- L-2 C's 29-option list (penghasilan luar negeri) **matches no reference type**.
  A sweep of all 416 populated types found nothing that covers it and nothing
  even close to its size, so this is a checked negative, not an unfinished
  search.

`PIT_TAX_RATE` is fetchable this way too. Its `ParameterData` carries the Induk
income-tax bands (`Min`, `Max`, `Rate`, `Minus`) that `../bundle-diff-1770.md`
records as never observed — the Induk tariff is data-driven, not hardcoded.

### Getting the type names

`main.*.js` of any portal contains the literal assignments:

```sh
grep -oE '\w+\.ReferenceDataTypeName="[A-Z0-9_]+"' main.js | grep -oE '"[A-Z0-9_]+"' | tr -d '"' | sort -u
```

425 distinct names, saved here as `reference-type-names.txt`.

> **Pitfall — do not resolve the minified aliases.** Call sites read
> `r.GOc.ReferenceDataTypeName`, and it is tempting to chase `GOc` back to a
> literal. The export maps are truncated re-exports (`GOc:()=>wt.GO`), and the
> short symbol names are reused across webpack modules, so a naive lookup returns
> a confident, wrong answer — during this work it mapped eight different lists to
> `REINVESTMENT_TYPE`. Identify a list by its **contents**, or by field-name
> correspondence (`DeductionMethod` → `DEDUCTION_METHOD`), and say so when the
> match is inferred rather than proven.

### Volume

416 of the 425 types return rows: **292,380 options** in total. Nearly all of that
is two lists the app itself excludes from its cache — `BLACKLIST_EMAIL_DOMAIN`
(161,656) and `SUBDISTRICT` (83,841). The 406 lists with 400 options or fewer hold
5,365 rows between them, so a full dump is only worth keeping out of git.

## Files here

| File | What it is |
|---|---|
| `fetch-reference-data.mjs` | the fetcher, no dependencies, plain `node` |
| `reference-type-names.txt` | 425 type names extracted from `main.js` |
| `reference-data-1770.json` | the 27 lists SPT 1770 uses, 658 options, checked in |
