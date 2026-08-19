# Runtime behaviour, measured by filling a grid with junk data

Tested 2026-08-17 on L-1 Section A sub-table 1 (KAS DAN SETARA KAS) in the
maximal-state draft. One row was created with deliberately hostile values, then
the derived chain was traced through to Induk. Screenshots in `behavior/`.

The junk row was left in place; the draft is disposable.

## 1. Validation fires on Simpan, for every field at once

Clicking `Simpan` on an empty modal does **not** submit. It marks every required
field simultaneously with `Kolom ini wajib diisi!` in a pink band under the
control, and disables the `Simpan` button. Errors are not staged one at a time.

Two things confirmed here:

- **`Keterangan` errors despite having no asterisk.** This reproduces the
  2026-08-15 finding. The asterisk is decorative, not the requiredness contract.
- **`Kode` does *not* error despite having an asterisk**, because it is disabled
  and system-derived. So the rule is roughly "required unless disabled", and the
  asterisk tracks neither.

The error bands push subsequent fields down, shifting click targets, so any
automation that hardcodes coordinates breaks after the first validation pass.

## 2. Kode comes from reference data, and is *not* positional

Selecting the first dropdown immediately fills the disabled Kode field. Measured
on A1, this looked purely positional:

| Deskripsi option | Position | Kode |
|------------------|----------|------|
| Uang Tunai/Bank Note/Koin | 1 | `0101` |
| Deposito | 4 | `0104` |
| Wessel | 7 | `0107` |
| Setara Kas Lainnya | 9 | `0109` |

**A light spot-check across the other grids on 2026-08-17 disproved the
positional reading.** Each option carries its own code from reference data; the
harta lists merely happen to be stored in code order, so position coincides.

| Grid | Option picked | Kode | Positional? |
|------|---------------|------|-------------|
| A2 Piutang | 2 | `0202` | matches |
| A3 Investasi | 2 | `0302` | matches |
| A4 Harta Bergerak (via `Tipe`) | 2 | `0402` | matches |
| A5 Harta Tidak Bergerak | 2 | `0502` | matches |
| A6 Aset Lain-Lain | 2 | `0602` | matches |
| **B Utang** | 2 | `102` | **3 digits, own series** |
| L-3A-4 B | 2 | `302` | matches shape |
| L-5 B | 1, 5 | `501`, `505` | matches |
| **L-5 C** | 1, 2 | `601`, **`603`** | **gap at 602** |
| **L-2 B** | 1, 2, 5 | `303`, `401`, `404` | **no relation to position** |
| **L-2 A** | 1, 2 | `21-100-27`, `21-100-28` | **real DJP object code** |

Three clear breaks: L-2 A uses the real DJP object-code format
(`<pasal>-<objek>-<sub>`), L-2 B's codes jump series mid-list, and L-5 C skips
602 — a retired or hidden entry. L-1 B Utang uses a 3-digit series rather than
the harta grids' 4-digit one.

**So Kode is a stored attribute of each reference option, not a computed index.**
Any mirror of these lists must carry the code alongside the label; deriving it
from row order would be wrong for at least four grids.

~~We deliberately do not implement this derivation at all.~~ **Superseded
2026-08-19.** That decision rested on not having the codes; the reference-data
endpoint supplies them, so we now derive Kode from Deskripsi exactly as Coretax
does. 19 of the 20 lists carry codes in seed 016; L-2 C is the exception and its
Kode stays blank. The observation above -- that Kode is a stored attribute of the
option, not a positional index -- is what makes the derivation correct, and it
still holds.

## 3. Input coercion, silent in both directions

Typed with real keystrokes, not synthetic events, so these are genuine:

| Field | Typed | Result | Behaviour |
|-------|-------|--------|-----------|
| Nomor Akun | `JUNK-!!!-000111` | unchanged | free text, no mask |
| Atas Nama | `PT. Angstrom & Co <test>` | unchanged | `<` `>` **not** escaped or stripped |
| Nama Bank/Institusi | `Bank ZZZ ~!@#$%^&*()` | unchanged | all punctuation accepted |
| Tahun Perolehan | `abcd` | *empty* | letters silently dropped, numeric-only |
| Tahun Perolehan | `9999` | **`2026`** | **silently clamped to the current year** |
| Saldo | `99999999999999` | `99.999.999.999.999` | live `.` thousand separators |

### Date fields cannot be typed into

Measured on L-1 E and L-2 C, 2026-08-17. Typing `15-06-2025` into a
`dd-mm-yyyy` field leaves it **empty** — the keystrokes are discarded and the
row cannot be saved. The value only sets by clicking a day in the calendar
popup. Two further notes:

- The calendar renders its month/day names in **English** ("August 2026"),
  another localisation gap.
- **It does not restrict to the tax year.** On a Tahun Pajak **2025** return,
  every day of August **2026** was selectable, and a bukti potong dated
  `15-08-2026` saved without complaint. So the date carries no tax-year
  validation at all.

The two silent behaviours matter most. A year beyond the current one is
**rewritten without any message**, so a user typing 9999 sees 2026 appear and
gets no explanation. And free-text fields accept angle brackets unescaped, which
survive into the grid, so our own implementation must escape on render.

## 4. Saving: server-side insert, then server-side recompute

`Simpan` fires three POSTs in order:

```
POST /returnsheetportal/api/loadpit/l1-table-a1-grid/insert   200
POST /returnsheetportal/api/loadpit/l1-table-a1-grid/footer   200
POST /returnsheetportal/api/loadpit/l1-table-a1-grid          200
```

Plus 8 calls to `/referencedata/api/maintenancereferencedata/list` for the
dropdown lists. Two conclusions:

- Endpoints are **per grid**, named after the grid (`l1-table-a1-grid`), with
  `/insert` and `/footer` as sub-resources.
- **The footer total is computed server-side**, as its own round trip, not in the
  browser. Reference data lives in a separate `referencedata` service from the
  returnsheet service.

## 5. The derived chain is live, crosses tabs, and is four levels deep

Two chains were traced. Both propagate with no save action on Induk, no reload
and no `Simpan Konsep`.

### Chain A, harta. Saved one A1 row with Saldo `99.999.999.999.999`

| Level | Field | Value |
|-------|-------|-------|
| A1 grid footer | `JUMLAH TABEL 1` | 99.999.999.999.999 |
| A7 rollup | `JUMLAH HARTA PADA AKHIR TAHUN PAJAK` | 99.999.999.999.999 (both columns) |
| **Induk 14a** | `Harta pada akhir Tahun Pajak` | **99.999.999.999.999** |

14a's label names its own source: *"(Isi Lampiran 1 Bagian A, lalu ke pertanyaan
selanjutnya)"*. It is the only Induk field whose label does this. Note the A7
rollup has **two** columns (Harga Perolehan, Nilai Saat Ini) while A1 has a
single `SALDO`, and that one value populated **both**.

Caveat: only A1 was populated, so A2–A6's contribution to the A7 rollup is
assumed from the label, not measured.

### Chain B, penghasilan. Saved one L-1 D row, Bruto 1.000.000 − Pengurang 250.000

| Level | Field | Value | Kind |
|-------|-------|-------|------|
| Modal | `Penghasilan Neto` | 750.000 | arithmetic, **on blur** not per keystroke |
| D grid footer | `JUMLAH BAGIAN D` | 750.000 | the *Neto*, not the Bruto |
| **Induk 1.a** | penghasilan dari pekerjaan | **750.000** | fed from the lampiran |
| **Induk 2** | `Penghasilan neto setahun (1a+1b+1c+1d)` | **750.000** | **Induk's own formula, recomputed** |

Chain B is the important one: it shows the feedback is **general**, not a
special case for 14a, and that a **fourth** level exists — Induk's internal
arithmetic re-runs off the value the lampiran fed it. The modal's own
Bruto − Pengurang also confirmed, and it fires on blur.

### The feed map, ten verified

> **Not complete.** Corrected 2026-08-17 by a consistency check. Two amendments:
>
> - **An eleventh feed exists**: Induk **`1.b.5`** ← L-3A `4800 NILAI FISKAL`,
>   measured at 350.000.000 and again at 9.350.000.000. It is missing below
>   because the `1.b` family had not been answered when this table was built.
>   See `L3A.md`.
> - **Row 3 has two sources, not one.** Below it shows only L-5 B because L-5 A
>   was empty at the time. It is actually
>   `JUMLAH PENGURANG PENGHASILAN NETO` = L-5 A's *tahun pajak ini* column +
>   L-5 B. Confirmed at 30.000.000 from A alone. See `L5A.md`.
>
> The ten rows below were each measured and remain correct as far as they go.

Every editable grid was given one row with a distinct traceable amount, then
Induk was read in a single pass. **All ten feeds work.** Measured 2026-08-17.

| Induk row | Fed from | Value |
|-----------|----------|-------|
| 1.a | L-1 D, `JUMLAH BAGIAN D` | 750.000 |
| 1.c | L-3A-4 B | 111.111 |
| 1.d | L-2 C, `JUMLAH PENGHASILAN NETO` | 888.888 |
| 3 | L-5 B | 222.222 |
| 8 | L-5 C | 333.333 |
| 10a | L-1 E, `JUMLAH BAGIAN E` | 77.865 — **see below** |
| 14a | L-1 A7 rollup | 99.999.999.999.999 |
| 14b | L-1 B | 555.555 |
| 14c | L-2 A | 666.666 |
| 14d | L-2 B | 444.444 |

So the feedback is **universal**, not a special case. Two details that only
appear when every grid is populated at once:

**14c takes the DPP, not the tax.** L-2 A row was DPP 666.666 with PPh Terutang
66.666. Induk 14c shows **666.666**. It is the income figure that propagates.

**10a aggregates two lampiran, and one lampiran feeds another.** I entered
77.777 into L-1 E but Induk 10a reads 77.865. The extra 88 is the *Kredit Pajak
yang Dapat Diperhitungkan* from **L-2 C**:

| L-1 E footer row | Value | Source |
|------------------|-------|--------|
| `JUMLAH` | 77.777 | L-1 E's own rows |
| `KREDIT PAJAK ATAS PENGHASILAN LUAR NEGERI` | **88** | **imported from L-2 C** |
| `JUMLAH BAGIAN E` | 77.865 | the sum, and what Induk 10a reads |

**Feeds are not one-to-one, and lampiran depend on each other.** This would
never surface from testing grids in isolation, and it means our dependency graph
has lampiran-to-lampiran edges, not just lampiran-to-Induk.

### Induk's own arithmetic, verified end to end

| Row | Formula | Expected | Actual |
|-----|---------|----------|--------|
| 2 | 1a+1b+1c+1d | 750.000 + 0 + 111.111 + 888.888 = 1.749.999 | **1.749.999** |
| 4 | 2 − 3 | 1.749.999 − 222.222 = 1.527.777 | **1.527.777** |
| 6 | 4 − 5 (PTKP unset) | 1.527.777 | **1.527.000** |
| 11a / 11c / 12b | kurang/lebih bayar chain | — | 77.865 |

**Row 6 rounds down to the nearest 1.000** — 1.527.777 becomes 1.527.000. That
is the Indonesian *pembulatan ke bawah ribuan penuh* rule on Penghasilan Kena
Pajak, implemented in the form. Our implementation must round the same way or
every downstream figure drifts.

### Routing hints are still not evidence of data flow

The nine "Ya, silahkan mengisi lampiran X" hints route the **user**. They happen
to correlate with a real feed in all ten cases here, but 10a proves the mapping
is not one hint to one source. Read the footer labels, not the hints, to work
out what actually aggregates.

## Implications for our implementation

1. **Requiredness must be its own metadata.** It cannot be read off the asterisk
   in either direction. Transcribing labels will get `Keterangan` and `Kode`
   wrong.
2. **The lampiran-to-Induk chain is a real dependency**, not a display nicety,
   and it is **four levels deep**: row arithmetic → section footer → Induk field
   → Induk formula. Any row change has to invalidate all four. Two chains are
   proven (harta → 14a, pekerjaan → 1.a → 2); the other eight feeds are
   presumed to work the same way but are unverified, so treat the list above as
   a test plan rather than a specification.
3. **Escape on render.** Coretax stores and redisplays `<test>` verbatim.
4. Prefer explicit validation messages over silent coercion. The year clamp is
   the kind of behaviour that confuses a peserta in a training context, since
   nothing tells them their input was changed.
5. Server-side footer recomputation is a design choice we do not have to copy;
   with D1 we can derive totals in a query. Worth knowing their split, though,
   since it explains the request pattern if we ever mirror the API shape.

## Not tested

- Editing an existing row (the pencil), `Hapus` on a populated row, duplicate-row
  rules, and cross-field validation. Only the insert path was exercised.
- A2–A6's contribution to the A7 rollup. Only A1 was populated, though A7's
  label states it rolls up A1–A6.
- Induk rows 5 (PTKP), 7, 9, 10b, 10c, 12a and 13x, which stayed 0 because no
  PTKP was selected and no tariff therefore applied. The **rounding rule at row
  6 is confirmed**, but the tariff calculation at row 7 is not.
- Whether other cross-lampiran edges exist beyond L-2 C → L-1 E. That one was
  found by accident; there was no systematic search.
- Sections 1 to 4 (validation, Kode derivation, input coercion, save calls) were
  measured on **one grid**, L-1 A1, plus a light Kode-only check across the
  others. They are not established for every grid.
