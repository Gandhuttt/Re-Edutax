# Lampiran 3B, rekapitulasi peredaran bruto

Captured 2026-08-17 on the Pembetulan/Pencatatan draft. This tab was recorded in
earlier notes as "referenced but no tab in any state". It is reachable, the gate
was simply never exercised.

Source: `.../personal-income-tax-return/1bf62247-.../ICT_PIT/78121a5b-...`

## Gate

L-3B appears when Induk **`1.b.2`** is answered with either "Ya" option. It is
**not** gated on `1.b.3`.

`1.b.2` is a three-option combobox, not Ya/Tidak:

| Option | Effect |
|--------|--------|
| `Tidak, lanjutkan ke pertanyaan selanjutnya` | no L-3B, continue to `1.b.3` |
| `Ya, saya termasuk Wajib Pajak Orang Pribadi yang memiliki peredaran bruto tertentu yang dikenai pajak bersifat final.` | **L-3B appears** (PP 55/2022, final 0,5%) |
| `Ya, saya termasuk orang pribadi pengusaha tertentu` | **L-3B appears**, hint `Ya, saya termasuk Wajib Pajak OPPT (Isi Lampiran 3B Bagian B)` |

`1.b.1` must be `Ya` for `1.b.2` to be enabled at all.

`1.b.2`'s hint when the PP-55 option is chosen states the routing outright:

> Ya, saya menerima penghasilan usaha yang dikenakan Pajak Final PP 23/PP 55.
> (Isi Lampiran 3B Bagian A)

## Page structure

```
REKAPITULASI PEREDARAN BRUTO
  HEADER                              Tahun Pajak, NPWP (both read-only)
  DAFTAR TEMPAT KEGIATAN USAHA (TKU)  read-only registry, drives every section
  A. ... PEREDARAN BRUTO TERTENTU ... FINAL
  B. ... ORANG PRIBADI PENGUSAHA TERTENTU (OPPT)
  C. ... PENGGUNA NORMA PENGHITUNGAN PENGHASILAN NETO (NPPN)
```

### DAFTAR TKU

Columns: `ID TKU`, `NAMA`, `ALAMAT`, `KELURAHAN/DESA`, `KECAMATAN`,
`KOTA/KABUPATEN`, `PROVINSI`. Pre-filled from DJP records, read-only, with
per-column filter inputs. The `ID TKU` is the NPWP plus a six digit branch
suffix, e.g. `<npwp>000000` for the primary place of business.

### Rows are seeded from the TKU list, not added by hand

**This is the key structural difference from every other lampiran.** The other
grids use a `Tambah` button plus a row-editor modal to insert rows. L-3B has no
`Tambah` anywhere. Each section is pre-populated with **one row per registered
TKU**, and the only action is a pencil (edit) on the gated section. There is no
add and no delete.

For our rebuild that means L-3B rows are derived from a TKU/tempat-usaha table,
not user-created.

## Sections

All three are a TKU by month matrix, twelve monthly columns plus `JUMLAH`.

| Section | Regime | Columns beyond the 12 months + JUMLAH |
|---------|--------|----------------------------------------|
| A | peredaran bruto tertentu, final (PP 55/2022) | `TINDAKAN`, `NAMA TKU` |
| B | OPPT | `NAMA TKU`, `METODE PEMBUKUAN` |
| C | pengguna NPPN (Norma) | `NAMA TKU`, `JENIS USAHA/PEKERJAAN BEBAS` |

All three render their TKU rows regardless of which gate is on. Only the gated
section gets a `TINDAKAN` column with a working editor, matching the established
rule that a lampiran grid is editable only when its own gate is on.

Section B carries a legend above the grid:

> Kotak metode pembukuan diisi dengan angka 1 atau 2 sesuai daftar di bawah ini:
> METODE PEMBUKUAN: 1. PENCATATAN, 2. PEMBUKUAN STELSEL KAS ATAU PEMBUKUAN
> STELSEL AKRUAL

so `METODE PEMBUKUAN` is a 1/2 integer code, not a dropdown. It showed `1`,
matching the header's `Pencatatan`.

Footers: B and C both end with `JUMLAH PEREDARAN BRUTO` and `JUMLAH PPh`.
Section A is much richer, see below.

Section C is where a Norma filer's peredaran bruto goes, and `JENIS
USAHA/PEKERJAAN BEBAS` carries the norma classification. The norma
**percentage** is still not observed and cannot be, see the block below.

## Section A row editor

Modal titled `REKAPITULASI PEREDARAN BRUTO TERTENTU`, subtitled with the TKU's
`ALAMAT` (not its name). Twelve labelled amount inputs `Januari`..`Desember`
plus a read-only `JUMLAH`. Buttons `Tutup` / `Simpan`. That is the entire modal,
the simplest one in the form.

Input quirk: the month fields start at `0` and typing **inserts at the cursor
rather than replacing**, so typing `300000000` into a field showing `0` yields
`3.000.000.000`. Clear the field first.

## Section A computation, measured

Filled Januari and Februari with 3.000.000.000 each, everything else 0.

| Row | Jan | Feb | Mar–Des | JUMLAH |
|-----|-----|-----|---------|--------|
| (TKU row, input) | 3.000.000.000 | 3.000.000.000 | 0 | 6.000.000.000 |
| a. JUMLAH PEREDARAN BRUTO | 3.000.000.000 | 3.000.000.000 | 0 | 6.000.000.000 |
| b. AKUMULASI PEREDARAN BRUTO | 3.000.000.000 | 6.000.000.000 | 6.000.000.000 | *(blank)* |
| c. PEREDARAN BRUTO TIDAK KENA PAJAK | — merged single cell, 500.000.000 — | | | 500.000.000 |
| d. PEREDARAN BRUTO KENA PAJAK | 2.500.000.000 | 3.000.000.000 | 0 | 5.500.000.000 |
| e. JUMLAH PPh FINAL TERUTANG | 12.500.000 | 15.000.000 | 0 | 27.500.000 |
| f. PPh FINAL YANG DISETOR SENDIRI | 0 | 0 | 0 | 0 |
| g. JUMLAH PPh FINAL YANG DIPOTONG/DIPUNGUT PIHAK LAIN | 0 | 0 | 0 | 0 |
| h. SELISIH (e-f-g) | 12.500.000 | 15.000.000 | 0 | 27.500.000 |

Rules confirmed by these numbers:

- **`AKUMULASI` is a running cumulative** that carries flat through months with
  no turnover (Mar–Des all show 6.000.000.000). Its `JUMLAH` cell is
  deliberately blank, a cumulative has no meaningful total.
- **The 500.000.000 exemption is consumed as early as possible**, against the
  accumulation, not spread across months and not applied per month. January
  alone already exceeded it, so the whole exemption was absorbed in January:
  `3.000.000.000 − 500.000.000 = 2.500.000.000`, and February was taxed in full.
- Per month: `kena_pajak = max(0, min(bruto_bulan, akumulasi_bulan − 500.000.000))`
  Jan: `min(3.000.000.000, 2.500.000.000) = 2.500.000.000`. ✓
  Feb: `min(3.000.000.000, 5.500.000.000) = 3.000.000.000`. ✓
- **Tariff is a flat 0,5%** on `d`. `0,5% × 2.500.000.000 = 12.500.000` ✓ and
  `0,5% × 3.000.000.000 = 15.000.000` ✓.
- `g` is the only user-editable footer row. `e`, `d`, `b`, `a`, `h` are derived,
  `f` was derived/read-only in this state.
- The row letters `e`, `f`, `g` are not printed as labels, they are inferred
  from the `SELISIH (e-f-g)` caption counting `a`..`h` down the footer.

## Feeds: L-3B does **not** enter the progressive chain

Verified simultaneously with the amounts above:

- Induk `1.b.5` (penghasilan neto dari usaha) stayed **0**.
- Induk row 2 stayed **600.750.000**, i.e. the pekerjaan income only.

This is correct in substance, PP-55 turnover is final-taxed and is excluded from
penghasilan neto. **L-3B section A is a self-contained final-tax computation
parallel to the Induk chain, not an input to it.**

What it does create is a linked row in **L-2 Bagian A**, auto-inserted when
`1.b.2` was answered:

| Field | Value |
|-------|-------|
| NPWP PEMOTONG/PEMUNGUT | the WP's own NPWP |
| NAMA PEMOTONG/PEMUNGUT | the WP's own name |
| KODE OBJEK PAJAK | `28-423-99` |
| JENIS PENGHASILAN | `Penghasilan yang dikenakan pajak bersifat final sesuai Peraturan Pemerintah Nomor 23/55 (Disetor Sendiri)` |
| DASAR PENGENAAN PAJAK | 0 |
| PPh TERUTANG | 0 |

The amounts are 0, not the 5.500.000.000 / 27.500.000 from L-3B. That is
consistent rather than broken: L-2 A records final tax **actually paid or
withheld**, and L-3B row `f` (*disetor sendiri*) was 0 because nothing was
recorded as paid. L-3B row `h` (`SELISIH`) of 27.500.000 is the amount still
owed. Whether L-2 A's amounts sync from L-3B `f` on `Simpan Konsep` was not
tested, that button is off limits on this draft.

Note the self-referential `NPWP PEMOTONG` — for *disetor sendiri* final tax the
taxpayer is their own withholding agent.

## Section B, OPPT, measured

Switching `1.b.2` to the OPPT option moves the editor from section A to section
B. Section A **keeps its data but loses its `TINDAKAN` column**, becoming
read-only with the full computation still displayed.

Note the asymmetry with L-2 A: switching the gate off **deleted** the
auto-created `28-423-99` row there, but only **froze** the L-3B section A rows.
Grid rows created by a gate are removed on teardown; rows seeded from the TKU
registry are not.

Section B's row editor is titled `PEREDARAN BRUTO WAJIB PAJAK ORANG PRIBADI
PENGUSAHA TERTENTU (OPPT)` and subtitled with `<ID TKU> - <NAMA>`, unlike
section A which is subtitled with the TKU's `ALAMAT`. Fields:

| Field | Editable |
|-------|----------|
| `Metode Pembukuan/Pencatatan` | **no**, inherited from the header (showed `1` = Pencatatan) |
| `Januari`..`Desember` | yes |
| `JUMLAH` | no, derived |

Entering `400.000.000` in Januari gave `JUMLAH PEREDARAN BRUTO` = 400.000.000
and **`JUMLAH PPh` = 0**. The OPPT 0,75% angsuran is *not* computed in L-3B, it
is an Induk `13c` matter (`angsuran PPh Pasal 25 saya adalah 0.75% dari
penghasilan bruto setiap bulan dari masing-masing tempat usaha`).

Section C mirrored section B's 400.000.000 exactly while section A kept its own
3.000.000.000. So B and C appear to read the same underlying turnover figure per
TKU while A has its own, which fits, PP-55 is a separate final regime whereas
OPPT and Norma both derive neto from the same gross turnover. Not proven, only
one edit was made, but worth assuming until contradicted.

Induk was unaffected: `1.b.5` stayed 0 and row 2 stayed 600.750.000 under OPPT
too. `1.b.2` selects the **turnover tax regime**, `1.b.3`/`1.b.4` select **how
neto is derived**, and `1.b.5` is the resulting neto.

## Input quirk, both sections

Month fields prefill with `0` and typing **inserts at the cursor**. Typing
`300000000` into a field showing `0` yields `3.000.000.000`. `triple_click` to
select the existing content first, which was verified to replace cleanly.

## `Sumber Penghasilan` is derived

The HEADER's `Sumber Penghasilan` changed on its own from `Pekerjaan` to
`Pekerjaan, Kegiatan Usaha` once `1.b.1` was set to `Ya`. It is a computed
summary of the answered income-source questions, not an independent input.

## The Norma option is blocked server-side

Induk `1.b.3` option 3, `Ya, saya berhak menggunakan Norma Penghitungan
Penghasilan Neto.`, **cannot be selected on this account**. Selecting it fires

```
POST /returnsheetportal/api/PrefillReturnSheet/facility-register-validation-fiscal-year
```

which returns 200, after which the app silently clears `1.b.3` back to
`Silakan Pilih` and removes any dependent row. Reproduced three times.

This is an eligibility check, not a bug and not a UI glitch:

- The other two `1.b.3` options apply instantly with no such request.
- The field goes from a *valid selected value* back to empty, which only the
  application can do.
- `1.b.2`'s PP-55 option is accepted, so the gate is specific to NPPN.

Using Norma requires a *pemberitahuan penggunaan NPPN* registered with DJP for
the fiscal year. This taxpayer has none, so Coretax refuses the answer. **The
Norma branch cannot be captured from this account at all**, regardless of how
much more probing is done. Capturing it needs an account with an NPPN
registration on file.

For our implementation this is worth mirroring in spirit but not in mechanism:
peserta are training users with no DJP facility register, so Norma should be a
freely selectable option in Re-Edutax rather than a server-validated one.

## `1.b.3` and the conditional `1.b.4`

| `1.b.3` answer | Hint | `1.b.4` |
|----------------|------|---------|
| `Tidak, saya menyelenggarakan pembukuan.` | `Tidak, saya menyusun laporan keuangan/laporan keuangan berbasis kas. (Lanjutkan ke pertanyaan berikutnya)` | **appears**: `Anda menyelenggarakan pembukuan. Sebutkan sektor usaha yang Anda lakukan?` |
| `Tidak, saya hanya menerima penghasilan dari usaha yang dikenakan pajak bersifat final dan tidak menyelenggarakan pembukuan.` | not captured | not captured |
| `Tidak, saya hanya menerima penghasilan dari usaha yang dikenakan pajak bersifat final dan tidak menyelenggarakan pembukuan.` | `Tidak, saya hanya menerima penghasilan yang dikenakan Pajak Final PP 23/PP 55. (Lanjutkan ke pertanyaan berikutnya)` | absent |
| `Ya, saya berhak menggunakan Norma Penghitungan Penghasilan Neto.` | rejected, see above | — |

When `1.b.4` does appear it gates the **L-3A-N** tabs, see `L3A.md`.

`1.b.4` is absent from the row numbering until `1.b.3` is answered, which is why
earlier dumps showed `1.b.1, 1.b.2, 1.b.3, 1.b.5` with a gap.

## Not captured

- The OPPT option on `1.b.2`, and section B in an editable state
- Section C in an editable state, and the norma percentage / neto calculation
  (blocked, see above)
- `1.b.4`'s sektor usaha option list
- `1.b.3` option 2
- Whether L-2 A's amounts sync from L-3B on `Simpan Konsep`
- Behaviour with more than one TKU registered, only one exists on this account

## Note on interaction technique

PrimeNG dropdowns here do not respond to a JS `.click()` on `.p-dropdown`, the
panel never opens. They must be driven with real mouse events. Once the panel is
open, either clicking the option or `ArrowDown`xN + `Return` works. Reading state
via JS is fine and is how every value above was verified.
