# Lampiran 5 Bagian A, kompensasi kerugian fiskal

Captured 2026-08-17. Tahun pajak of this draft is **2025**.

## Gate

Induk row **3** (*"Apakah terdapat pengurang penghasilan neto seperti kompensasi
kerugian atau zakat/sumbangan keagamaan ..."*).

| Row 3 | Effect |
|-------|--------|
| `Tidak` | L-5 A renders but is **entirely read-only**: no pencils, no inputs. L-5 B shows `Tidak ada data untuk ditampilkan` with no `Tambah`. |
| `Ya` | L-5 A gains **one pencil per year row**, L-5 B and C gain `Tambah`. Hint becomes `Ya, silahkan mengisi lampiran 5 Bagian A dan/atau B`. |

Note the L-5 tab exists either way, only editability changes. This matches the
general gating rule, but it is worth stating because the read-only A section
still displays populated figures and can be mistaken for "already filled in".

## Grid shape: loss year × compensation year

A fixed matrix, no `Tambah` and no delete. Rows are **the ten tahun pajak
2016..2025**, i.e. current year and the nine before it.

Columns:

| Column group | Columns |
|--------------|---------|
| — | `NO.` |
| `LABA/RUGI NETO FISKAL` | `Tahun Pajak/Bagian Tahun Pajak`, `NILAI (RUPIAH)` |
| `JUMLAH KOMPENSASI KERUGIAN FISKAL` | `TAHUN 2021`, `TAHUN 2022`, `TAHUN 2023`, `TAHUN 2024`, `TAHUN 2025`, `TAHUN 2026` |

The last two carry sub-labels: **`TAHUN 2025` is `TAHUN PAJAK INI`** and
**`TAHUN 2026` is `TAHUN PAJAK BERJALAN`**.

So the compensation columns span `tahun pajak − 4` through `tahun pajak + 1`,
the five-year carryforward window plus the following year. In our
implementation these column headings must be **derived from the tahun pajak**,
not hardcoded.

Footer row `JUMLAH BAGIAN A` totals each year column.

## Row editor

Pencil opens `PENGHITUNGAN KOMPENSASI KERUGIAN FISKAL`:

| Field | State |
|-------|-------|
| `Tahun Pajak` | read-only, the row's year |
| `Laba/Rugi Penghasilan Fiskal` | editable, **required** (`*`) |
| `Jumlah Kompensasi Kerugian Fiskal` → `Tahun 2021`..`Tahun 2026` | editable, **except the loss year's own column** |

**Negative amounts are accepted**, typed with a leading `-`. Entering
`-100000000` in `Laba/Rugi Penghasilan Fiskal` displayed as `-100.000.000`.
This is the only field found so far in the whole form that takes a negative.

### A loss cannot be compensated in its own year

Editing the **2021** row, the `Tahun 2021` compensation cell was **disabled**
while `Tahun 2022`..`Tahun 2026` were enabled. So for loss year `N`, the cell
for year `N` is locked and only `N+1` onward can be used.

Not verified for every row, but it is the obvious rule and it held on the row
tested. Worth re-checking on an early row (2016) where *all* compensation
columns are later years.

## The math is entirely manual

Nothing is derived. The user types the loss **and** how much of it is used in
each subsequent year. There is no check that the compensations sum to the loss,
no automatic allocation, and no expiry enforcement visible.

This mirrors SPT Badan L7, recorded in memory as
`spt_pph_badan_l6_l7_status`: *"L7 carryforward math is deliberately manual"*.
The same decision applies here.

## Only the current-year column feeds Induk

Measured with a single loss row (2021, `-100.000.000`):

| Entered | `JUMLAH BAGIAN A` | Footer `JUMLAH KOMPENSASI KERUGIAN FISKAL` |
|---------|-------------------|--------------------------------------------|
| Tahun 2022 = 40.000.000 | 40.000.000 under 2022 | **0,00** |
| then Tahun 2025 = 30.000.000 | 30.000.000 under 2025 | **30.000.000,00** |

**Only the `TAHUN PAJAK INI` column (2025) is picked up.** The other year
columns are historical record for the matrix only and do not affect this
return. That is the single most important rule in this section.

Two page-level footers sit below section B:

```
JUMLAH KOMPENSASI KERUGIAN FISKAL   30.000.000,00   (from A, tahun pajak ini)
JUMLAH PENGURANG PENGHASILAN NETO   30.000.000,00   (= above + section B)
```

Section B was empty, so the two matched. `JUMLAH PENGURANG PENGHASILAN NETO` is
what reaches Induk.

### Chain to Induk, confirmed

```
L-5 A, tahun 2025 column        30.000.000
JUMLAH PENGURANG PENGHASILAN NETO  30.000.000
Induk 3                         30.000.000
Induk 2                        600.000.000
Induk 4  = 2 − 3               570.000.000
Induk 6                        570.000.000   (PTKP unset)
Induk 7                        115.000.000
```

Row 7 re-derives exactly: `3.000.000 + 28.500.000 + 62.500.000 + 30% ×
70.000.000 = 115.000.000`. Fifth independent confirmation of the tariff table.

## Unexplained

Row 10 (**2025**, the current year) showed `LABA/RUGI NETO FISKAL` =
**76.380.000** on arrival, before anything was entered in L-5. It does not
correspond to Induk row 2 (600.000.000) or to any L-3A figure at the time. It
may be prefilled from the SPT being amended, since this draft is a Pembetulan.
**Not resolved.** Worth checking against the original SPT before assuming the
current year's row is user-entered like the others.

## Section B, pengurang penghasilan neto

Standard `Tambah` grid. Columns `TINDAKAN`, `NO.`, `KODE`, `JENIS PENGURANG
PENGHASILAN NETO`, `JUMLAH PENGURANG PENGHASILAN NETO`.

Modal fields are already documented in `MODAL-FIELDS.md`; do not duplicate them
here. In short: title `PENGURANGAN PENGHASILAN NETO`, three required fields,
`Kode` disabled and derived from `Jenis`.

**The new material below is the KODE ↔ JENIS value mapping**, which
`MODAL-FIELDS.md` does not carry.

### KODE ↔ JENIS, all five, contiguous

| Kode | Jenis |
|------|-------|
| 501 | Zakat (Sesuai PP Nomor 60 Tahun 2010) |
| 502 | Sumbangan keagamaan (Sesuai PP Nomor 60 Tahun 2010) |
| 503 | Fasilitas pengurang penghasilan Neto (Tax allowance) |
| 504 | Fasilitas keringanan pajak lainnya (Tax reliefs) |
| 505 | Pengurang penghasilan neto lainnya |

Read by selecting each option and reading the derived `Kode`.

## Section C, pengurang PPh terutang

Same grid shape. Modal title is **`Income Tax Deduction`**, fields `Kode`,
`Jenis Pengurang PPh Terutang`, `Jumlah Pengurang PPh Terutang`.

| Kode | Jenis |
|------|-------|
| 601 | Fasilitas pembebasan atau pengurangan PPh (Tax holiday) |
| 603 | Pengurang PPh Lainnya |

**`602` does not exist** in the OP form's list. This corroborates the earlier
observation recorded in `BEHAVIOR.md` that C's codes are 601/603 with a gap.
Do not renumber to close it.

Section C feeds Induk row **8** (`Apakah terdapat pengurang PPh Terutang?`),
section B feeds Induk row **3** together with section A.

## Untranslated strings

Already recorded in `MODAL-FIELDS.md`, which lists every affected grid, not just
L-5: `Please Select` appears on L-1 A6, L-1 B, L-1 E, L-2 A/B/C, L-3A-4 B and
L-5 B/C, and `Income Tax Deduction` is L-5 C's title. Do not copy them.

## Not captured

- Whether `Laba/Rugi Penghasilan Fiskal` for the current year (row 10) is
  editable or derived
- Any validation tying compensations to the loss amount
- Whether an early loss year (2016) exposes all six compensation columns
- Saving a B or C row and confirming the feed to Induk 3 / 8 numerically
  (the lists were read by cycling the dropdown, no row was saved)
