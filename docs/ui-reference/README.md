# UI Reference

## How to read these notes (added 2026-08-19)

Everything here is **UI observation from a single test account**. That makes it
authoritative about appearance — layout, field order, labels, which cells render
grey — and unreliable about logic.

Three claims in this corpus were confidently wrong, and all three were of one
kind: a negative conclusion drawn from what the account happened to show
(L-3A-4 Bagian A "not capturable", 14e/14f "permanently disabled", L-4 Section B
"confirmed exact, no rounding"). None was a wrong measurement. All were wrong
*therefores*.

So, when reading or adding to these files:

- **Separate the observation from the inference.** "Row 6 displayed 538.527.000"
  is evidence. "Therefore there is no rounding" is a hypothesis, and needs the
  alternatives it rules out spelled out, or it should not be written.
- **Negative claims are the dangerous ones.** A wrong measurement fails a check
  the moment code touches it. A wrong "this cannot be done" stops the work that
  would have tested it, so it never fails — it just quietly costs a feature.
  Prefer "not observed on this account" over "not possible".
- **For anything behavioural, the bundle beats this corpus.** The deployed
  Coretax JavaScript is the logic actually running; see
  `docs/bundle-diff-1770.md` for how to fetch it and what it can and cannot
  settle. Where the two disagree, the bundle wins.
- **Absence of evidence is usually an unexercised gate**, not an absent feature.
  Every "no entry path" puzzle in these notes turned out to be a gate that had
  never been answered.

Claims below that have since been checked against the bundle are marked
**[bundle-confirmed]**, **[bundle-corrected]** or **[bundle-explained]**.

Captured states of the real DJP tax forms, kept as reference while building the
equivalent screens in this app. Nothing here is used at runtime, it is
documentation only.

## Why this exists

Re-Edutax reimplements SPT forms (Induk, L1-L13) for training purposes. Getting
field names, conditional visibility and validation rules right is easier from
the real UI than from prose. These captures are the source we check against.

## Which file answers which question

Audited 2026-08-17. Each file owns one question; if you find yourself
duplicating another file's content, cross-reference it instead.

| Question | File |
|----------|------|
| What hint does Induk row X show for Ya / Tidak? | `coretax/spt-1770-induk/HINTS.md` — **complete matrix, all 23 rows, both answers** |
| What states can an Induk control occupy? | `coretax/spt-1770-induk/STATES.md` |
| What are the Induk combobox options? | `coretax/spt-1770-induk/OPTIONS.md` |
| Which lampiran tabs exist, and which grids accept rows? | `coretax/spt-1770-lampiran/GATING.md` |
| What columns does grid X have? | `coretax/spt-1770-lampiran/NOTES.md` |
| What fields does grid X's row editor have? | `coretax/spt-1770-lampiran/MODAL-FIELDS.md` |
| What options are in dropdown Y? | `coretax/spt-1770-lampiran/REFERENCE-LISTS.txt` |
| How does the form behave when filled and saved? | `coretax/spt-1770-lampiran/BEHAVIOR.md` |
| How is the tax actually computed (PTKP, tariff, rounding)? | `coretax/spt-1770-induk/COMPUTATION.md` |
| What is L-3B, and why can't I select Norma? | `coretax/spt-1770-lampiran/L3B.md` |
| What is L-4 (own-calc PPh Pasal 25 installment)? | `coretax/spt-1770-lampiran/L4.md` |
| Which sektor usaha maps to which L-3A-N, and what accounts does it have? | `coretax/spt-1770-lampiran/L3A.md` |
| What do the HEADER fields do (Status, Metode, Sumber Penghasilan)? | `coretax/spt-1770-induk/HEADER-FIELDS.md` |
| How do add / edit / delete behave on a grid row? | `coretax/spt-1770-lampiran/GRID-ROW-ACTIONS.md` |
| How does L-5 work (carryforward, pengurang neto, pengurang PPh)? | `coretax/spt-1770-lampiran/L5A.md` |
| What does the whole page look like? | `fullpage-*.jpg` in each flow directory |
| Exact DOM/field names and flags | `coretax/spt-1770-induk/a11y-maximal-state.txt` |

**Check the table above before investigating anything.** This has now gone
wrong three times:

- 2026-08-16, the `1.c` → L-3A-4 routing was "discovered" and written up twice,
  when `HINTS.md` had recorded it on 2026-08-15.
- 2026-08-17, L-5 B/C's modal fields, titles and the `Please Select` /
  `Income Tax Deduction` strings were re-derived and reported as new, when
  `MODAL-FIELDS.md` already had all of it.

The pattern is always the same: a *new* question (here, the KODE↔JENIS values)
sits next to an *already-answered* one, and the whole area gets re-explored.
Before opening a modal, grep for its grid name across the docs.

## What goes in here

- Screenshots of a form state, as `.jpg`
- A markdown note per flow describing the fields, their labels, and the
  conditions under which each state appears

## What is tracked in git, and what is not

Changed 2026-08-17. `docs/` was previously ignored wholesale. Now:

| | Tracked? |
|---|---|
| `.md` / `.txt` notes | **yes** — PII-free, and history makes stale claims visible as diffs |
| screenshots (`.jpg`, `.png`, …) | **no** — they carry dependant PII |
| `a11y-*.txt` raw dumps | **no** — verbatim DOM, contains dependants' names and NIKs |

The owner's decision to leave dependant PII (spouse and two minor children in
L-1 Section C) unredacted was **conditional on `docs/` not being tracked**. That
condition is preserved by keeping images and a11y dumps out of git. If you ever
need to track one of those, re-raise the redaction question first.

## What does not go in here

- Credentials, session tokens, or anything that would let someone else into the
  Coretax account.
- Data belonging to anyone other than the repo owner. Captures come from the
  owner's own Coretax account, so **the owner's own** identity fields (NIK/NPWP,
  nama, telepon, email) are left unredacted by choice. That decision does not
  extend to any other taxpayer's return, and does not extend to dependants in
  tracked files.

Note that tracked notes reach whoever the repo reaches. If this repo is ever
made public or shared with peserta, the owner's own identity fields go with it.

## Layout

```
docs/ui-reference/
  README.md
  coretax/
    <flow>/
      NOTES.md            field list, validation rules, state conditions
      01-<state>.jpg      screenshots, numbered in the order they occur
```

`<flow>` is the form area, for example `spt-1771-induk` or `spt-1771-l1a`.

## Naming

Screenshots are numbered in the order a user encounters them, with a short
kebab-case state name:

```
01-empty.jpg
02-sektor-manufaktur-selected.jpg
03-validation-error-missing-dpp.jpg
```

The number is the position in the flow, not a global counter. Restart at `01`
in each flow directory.

## Capture conventions

- Record the source URL and capture date at the top of each `NOTES.md`, the DJP
  forms change between tahun pajak.
- **Save the accessibility tree as `a11y-<tabs>.txt`, do not just read it.** This
  is the primary artifact, screenshots are secondary. Field names and
  required/disabled flags in text form beat pixels for building the Svelte forms.
  On 2026-08-15 the tree was read but never saved, so only the prose
  transcription survived and anything the prose omitted was unrecoverable.
  **These dumps stay local and are gitignored** (they are verbatim DOM and carry
  dependant PII) — save them, work from them, but write the conclusions into a
  tracked `.md` so the knowledge survives without the raw data.
- **Screenshots are viewport-sized, and both axes clip.** A raw capture is
  ~1566x785 against a 2133x1068 viewport, so a 4400px form arrives as arbitrary
  scroll slices, and the widest L-1 grid needs 2531px against 1909 visible, which
  silently drops `KETERANGAN` off the right of every grid. Never treat a raw
  screenshot as a complete record.
- **Full-page stitching works, if you do it in this order.** Verified 2026-08-16.
  `stitch.mjs` in this directory is the working implementation: it takes a JSON
  spec of `{dir, vh, docH, out, slices:[{f,y}]}`, checks every slice has matching
  dimensions, prints a per-seam alignment score, and writes the composite.
  1. Neutralize sticky/fixed chrome, otherwise the nav repeats in every slice:
     hide `position: fixed` (out of flow, safe) and set `position: sticky` to
     `static` (in flow, so hiding would reflow).
  2. For grids, inject a stylesheet with `overflow: visible !important` on
     `.p-datatable-wrapper` and friends plus `width: max-content` on the table,
     then set `documentElement.style.zoom` so the widest table fits the viewport
     (0.62 worked for L-1). Inline styles do **not** survive, Angular re-renders
     and wipes them, so it must be an injected `<style>`.
  3. Scroll the whole page twice and confirm `scrollHeight` is identical both
     times before capturing. It does move while content lazily renders (4633 to
     4406 on Induk), but it settles, and that was the reason an earlier attempt
     was wrongly abandoned.
  4. Capture one slice per call with a settle wait, and record the **actual**
     `scrollY` returned by the page, never the value you asked for. Batching
     scroll+screenshot with no wait races the paint and yields white bands.
  5. Stitch by compositing each slice at `round(actualY * (imgH / vh))`. Later
     slices overwrite earlier ones in overlaps, so no crop math is needed.
  6. **Verify, do not assume**: pixel-diff the overlapping band between
     consecutive slices. Mean absolute difference under ~6 means aligned. Induk
     scored 0.93 and L-1 1.11. Slices that abut exactly (`dy` equal to slice
     height) have no overlap to check, so confirm one seam by eye too.
- **Check dumps for truncation.** `read_page` defaults to 50000 chars and cuts at
  a line boundary with a note. The Induk tree is ~68KB, so the default silently
  lost 27% of it. Pass a large `max_chars` and grep the result for `truncated at`
  before trusting it.
- **Record the Induk answer set with any lampiran capture.** Which lampiran tabs
  exist, and whether each grid accepts rows, is derived from the Induk answers,
  see `coretax/spt-1770-lampiran/GATING.md`. A lampiran capture without its
  answer set cannot be interpreted later.
- The DOM carries every tab at once, so one dump taken on any tab covers all of
  them. There is no need to click through tabs to capture them.
- Record the draft URL, including its ids. The bare returnsheets path 404s, so a
  capture without the id cannot be revisited.
- Dismiss decorative overlays (announcement splashes, banners) before capturing.
  Do not accept consent or terms dialogs to get a cleaner shot.
- Strip the portal nav and sidebar from saved dumps. It carries `Akun Perwakilan`
  entries for other taxpayers, which fall outside the owner's no-redaction
  decision. The returnsheet `<main>` subtree is the part worth keeping.

## A note on size

These are binary files in git history. Keep captures to the states that actually
inform an implementation decision, rather than every screen in a flow.

Text dumps are cheap and complete; screenshots are expensive and partial. When in
doubt, save the dump and skip the screenshot.
