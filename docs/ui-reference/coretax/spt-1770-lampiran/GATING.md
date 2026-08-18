# Induk answers gate the lampiran, both tabs and row entry

- Source: `coretaxdjp.pajak.go.id/returnsheets-portal/id-ID/personal-income-tax-return`
- Draft: `1bf62247-…/08987510-…/ICT_PIT/78121a5b-…`
- Captured: 2026-08-16
- State: Tahun Pajak 2025, Status Pembetulan, Metode Pencatatan,
  Sumber Penghasilan `Pekerjaan`, `Posting SPT` never run

This resolves the two open puzzles left in `NOTES.md` on 2026-08-15. Both were
state artifacts, not quirks of the UI.

## Two levels of gating

**1. Which lampiran tabs exist at all.** On 2026-08-15 the tab bar showed
`Induk | L-1 | L-2 | L-3A-4 | L-5`. On 2026-08-16, same draft, it shows only
`Induk | L-1 | L-5`. Nothing was captured on 15 Aug that recorded which Induk
answers produced the wider tab set, which is why this was missed.

**2. Whether a grid can accept rows.** A lampiran section can be present but
have no `Tambah` button, and that tracks the Induk answer that routes to it.

## The correlation, measured

Counted 9 `Tambah` buttons in the DOM; the document-order table map assigns
exactly those 9 to the grids below, so the mapping is complete, not sampled.

| Induk | Answer | Routing hint shown | Grid | `Tambah`? |
|-------|--------|--------------------|------|-----------|
| 1.a | **Ya** | "Ya, silahkan mengisi lampiran I Bagian D" | L-1 D | yes |
| 3 | **Tidak** | "Tidak, silahkan lanjut pertanyaan berikutnya" | L-5 B | **no** |
| 8 | **Ya** | "Ya, silahkan mengisi lampiran 5 Bagian C" | L-5 C | yes |
| 14b | **Tidak** | "Tidak, lanjutkan ke pertanyaan berikutnya" | L-1 B (Utang) | **no** |
| 14c | **Tidak** | — | L-2 A | tab absent |
| 14d | **Tidak** | — | L-2 B | tab absent |
| 1.d | **Tidak** | — | L-2 C | tab absent |

Every row matches. A `Ya` yields an editable grid, a `Tidak` yields a grid that
is present but read-only, or no tab at all.

## What this corrects in NOTES.md

The 2026-08-15 "Not every grid is user-editable" table was a snapshot of one
answer set, not a property of the form. Two entries invert under today's answers:

| Grid | 15 Aug | 16 Aug | Driver |
|------|--------|--------|--------|
| L-1 B, Utang | has `Tambah` | **no** `Tambah` | Induk 14b flipped to Tidak |
| L-1 D, Penghasilan neto pekerjaan | no `Tambah`, "populated by Posting SPT" | **has** `Tambah` | Induk 1.a = Ya |

So L-1 D is **not** purely Posting-populated, as previously recorded. The
"populated by `Posting SPT`" reasoning still stands for L-1 C, which has no
`Tambah` in either capture.

The two puzzles are closed:

- **L-5 B has no way to add a row** — because Induk 3 = Tidak. Set it to Ya and
  the grid should become editable.
- **L-2 C has no entry path** — because Induk 1.d = Tidak, which also removes
  the L-2 tab entirely in this state.

## Which question routes where

**The routing map already exists: `../spt-1770-induk/HINTS.md`**, captured
2026-08-15, with the full Ya *and* Tidak hint text for all 23 rows. Do not
duplicate it here, and read it before assuming anything about routing.

An earlier draft of this file guessed the `1.b` family gated `L-3A-4` and then
announced `1.c` as a discovery. Both were wasted effort: HINTS.md already
recorded `1.c` → "Ya, silahkan mengisi lampiran 3A-4 Bagian B", and the
2026-08-15 lampiran NOTES.md said L-3A-4 "is the lampiran reached from Induk
1.c". The lesson is to check the existing notes first.

What this file adds beyond HINTS.md is the **gating behaviour** the hints do not
state:

- which questions produce a *tab*, versus only a hint (`14g` = Ya gives a
  compliance reminder, "Pastikan Anda sudah menyampaikan laporan realisasi
  investasi secara terpisah", and routes nowhere);
- that a tab tracks the **OR of its gates** — L-2 appears when any of
  14c / 14d / 1.d is Ya, and all three of its grids appear together regardless
  of which one triggered it;
- that removing the **last** gate removes the tab and deletes its rows
  server-side (see below, and `../spt-1770-induk/NOTES.md` where the opposite
  was concluded from a confounded test).

## Maximal vs minimal state

Two full-page captures now bracket the space, `fullpage-*-minimal.jpg` and
`fullpage-*-maximal.jpg`, with matching `a11y-*.txt` dumps.

| | minimal (baseline) | maximal (as measured 2026-08-16) |
|---|---|---|
| tabs | Induk, L-1, L-5 | Induk, L-1, L-2, L-3A-4, L-5 |
| grids | 14 | 19 |
| editable | 9 | 15 |

> **The "maximal" column above is not the real maximum.** Corrected
> 2026-08-17. The `1.b` family was never answered when this was captured. With
> `1.b.1`=Ya, `1.b.2`=OPPT, `1.b.3`=pembukuan, `1.b.4`=Dagang and `1.c`=Ya, the
> tab bar shows **seven**:
>
> `Induk | L-1 | L-2 | L-3A-1 | L-3A-4 | L-3B | L-5`
>
> Note **L-3A-1 and L-3A-4 coexist**, which confirms L-3A-4 is gated on `1.c`
> and is *not* a fourth sektor variant of the `1.b.4` series. Only one of
> L-3A-1/2/3 can exist at a time, so seven is the ceiling. Grid and editable
> counts were not re-taken in that state.

**Read-only in *both* states**, so genuinely not user-editable rather than merely
gated: L-1 A7 Ikhtisar (rollup of A1-A6), L-1 C Anggota Keluarga
(system-populated), L-3A-4 A (has the Lampiran 3B instruction line), and the
L-5 A year matrix.

## Turning a gate on creates a row; turning it off deletes

Setting 14b to Ya left L-1 Section B showing "Menampilkan 1 sampai 1 dari 1
entri", a blank row the server created. Setting 14c back to Tidak fired
`POST /returnsheetportal/api/loadpit/l2-table-a-grid/delete-tax-object`.

**There is no unsaved-changes buffer.** Radio answers persist immediately,
without `Simpan Konsep`. Flipping a gate off destroys that section's rows. Treat
any answer flip on a real return as a data-changing operation.

## Still unexplained

> **Superseded 2026-08-17.** Both items below were resolved or disproved. Kept
> for the record because the *reasoning* was wrong in an instructive way.

~~`14e` and `14f` did not accept Ya ... possibly Metode Pembukuan~~

**Metode Pembukuan does not gate `14e`/`14f`.** Measured under both `Pencatatan`
and `Pembukuan stelsel akrual` with everything else held constant: identical. By
2026-08-17 `14e` was **enabled** and `14f` still disabled, and `14f` later became
enabled for reasons that could not be isolated. Full write-up in
`../spt-1770-induk/HEADER-FIELDS.md`. Do not rely on the Metode hypothesis.

> **[bundle-confirmed] 2026-08-19 — the gates are 1.b.3 and 1.b.1.** Both controls
> are declared `disabled` in Coretax's form group and enabled only by an earlier
> answer:
>
> ```js
> // 14e -> chkI5 -> lampiran L-3C, in emittedEventB1B3 (the 1.b.3 handler)
> t.value === No.code ? chkI5.enable() : chkI5.disable()
>
> // 14f -> chkI6 -> lampiran L-3D, in filledDisableSubForm (the 1.b.1 handler)
> updateChkI6(t) { 0 == t ? (patchValue({chkI6: 0}), chkI6.disable()) : chkI6.enable() }
> ```
>
> So `14e` needs **1.b.3 = Tidak** (a bookkeeper reports fiscal depreciation; a
> Norma user does not) and `14f` needs **1.b.1 = Ya**. That also explains the
> "sticky" enable: 1.b.1 was answered Ya in order to reach 1.b.4, and it stayed Ya.
> The Metode Pembukuan hypothesis was one field away — right instinct, wrong
> control.

~~Lampiran 3B ... has no tab in any state reached so far~~

**Lampiran 3B is reachable.** It is gated on Induk **`1.b.2`**, which had never
been answered when this file was written. Captured in full on 2026-08-17, see
`L3B.md`. The `1.b` family was simply never exercised.

## Consequence for our implementation

Grid editability is derived state, not a per-grid config. The Induk answer set
has to drive both which lampiran render and whether each grid accepts rows,
which is a stronger coupling than the Badan side currently models.

## Confirmed unchanged

L-1 C (Daftar Anggota Keluarga) is populated with 3 dependent rows even though
`Posting SPT` reports "Posting belum pernah dilakukan", so that grid is filled
from DJP records independently of the Posting action.

Column sets for all 14 grids were re-read from the DOM and match the
2026-08-15 tables in `NOTES.md` exactly. No column corrections needed.
