# L-3C and L-3D

> **Provenance: bundle, not UI.** Everything here was read from
> `827.1117977ff84ffcd9.js` (see `../../../coretax-api/README.md`), because
> neither lampiran was ever reachable on the captured account — their gates had
> never been answered. Nothing below has been seen rendered. Field names, types,
> validators, headings and totals are quoted from the source and are reliable;
> anything marked *inferred* is not.
>
> Reference-list contents come from the public reference endpoint and are checked
> in at `../../../coretax-api/reference-data-1770.json`.
>
> **Re-verified 2026-08-19** against the same chunk hash, which is still live, so
> the build has not moved. That pass resolved the row-grouping question below,
> confirmed the three asset-list assignments, and found the per-grid validator
> differences that this document previously flattened into one table.

## Gates

Both were mis-modelled as permanently disabled until 2026-08-19; see
`GATING.md` and `../spt-1770-induk/HEADER-FIELDS.md`.

| Lampiran | Induk gate | Coretax |
|---|---|---|
| **L-3C** | **14.e** = Ya, which is only answerable when **1.b.3 = Tidak** (menyelenggarakan pembukuan) | `ShowPitrL3CForm = chkI5`; `emittedEventB1B3`: `t.value === No.code ? chkI5.enable() : chkI5.disable()` |
| **L-3D** | **14.f** = Ya, which is only answerable when **1.b.1 = Ya** | `ShowPitrL3DForm = chkI6`; `filledDisableSubForm(t)` → `updateChkI6(t)`: `0 == t ? (patchValue({chkI6:0}), chkI6.disable()) : chkI6.enable()` |

**Neither feeds any Induk figure.** Coretax only persists and validates them —
`chkI5 && patchValue({L3CForm: …})`, `chkI6 && patchValue({L3DForm: …})`, plus
`runValidate` and `checkFormValidityL3CForm` — and never patches a `valueXX` from
either. They are declaration attachments, so building them changes no computed
row.

---

## L-3C — DAFTAR PENYUSUTAN DAN AMORTISASI FISKAL

Three grids, each with a row dialog and `Tambah` / `Hapus` / `Hapus Semua`.
Section headings, in order, from the component's own string table:

| Grid | Heading | Row grouping | Footer totals |
|---|---|---|---|
| 1 | **HARTA BERWUJUD** | KELOMPOK 1, 2, 3, 4, KELOMPOK LAINNYA | JUMLAH PENYUSUTAN FISKAL / JUMLAH PENYUSUTAN KOMERSIAL / SELISIH PENYUSUTAN |
| 2 | **BANGUNAN** | PERMANEN, TIDAK PERMANEN | same three |
| 3 | **HARTA TIDAK BERWUJUD** | KELOMPOK 1, 2, 3, 4, KELOMPOK LAINNYA | JUMLAH AMORTISASI FISKAL / JUMLAH AMORTISASI KOMERSIAL / SELISIH AMORTISASI |

The two computation functions are `calculateTotalFiscalAndDifferenceDepreciation`
and `calculateDifferenceAmortization`. There is also an `Impor data` control, as
on other lampiran.

### Columns (identical across all three grids)

| Header | Field | Type |
|---|---|---|
| TINDAKAN | — | button |
| KODE HARTA | `GroupAssetType` | text |
| KELOMPOK/JENIS HARTA | `GroupAssetType` | dropdown, list differs per grid |
| BULAN/TAHUN PEROLEHAN | `MonthYearAcquisition` | date, month-year format |
| HARGA PEROLEHAN | `CostOfAcquisition` | number, fraction 0 |
| NILAI SISA BUKU FISKAL AWAL TAHUN | `FiscalBookValueBeginningYear` | number, fraction 0 |
| METODE PENYUSUTAN/AMORTISASI → KOMERSIAL | `CommercialMethodAsset` | dropdown |
| METODE PENYUSUTAN/AMORTISASI → FISKAL | `FiscalMethodAsset` | dropdown |
| PENYUSUTAN/AMORTISASI FISKAL TAHUN INI | `FiscalValueThisYear` | number, fraction 0 |
| KETERANGAN | `Notes` | text |

METODE PENYUSUTAN/AMORTISASI is a two-level header: one parent cell with
`colspan: 2` over the KOMERSIAL and FISKAL children.

### Row dialog

Endpoint `l3c-grid`. Controls, with Coretax's own validators:

| Control | State |
|---|---|
| `AssetCode` (Kode Harta) | **disabled** — the only read-only visible field. Set by `onAssetTypeChange(t){this.form.controls.AssetCode.setValue(t.value)}`, i.e. derived from the Jenis Harta selection, exactly like the Kode fields on the other lampiran |
| `GroupAssetType` (Jenis Harta) | required |
| `MonthYearAcquisition` | **differs per grid — see below** |
| `CostOfAcquisition` (Biaya Perolehan) | required, **greaterThan(0)** |
| `FiscalBookValueBeginningYear` | required, **min(0)** |
| `CommercialMethodAsset` | required |
| `FiscalMethodAsset` | required |
| `FiscalValueThisYear` | required, min(0) |
| `Notes` (Keterangan) | **optional** — the only one |

#### The three dialogs are not identical

Read from each `rshshr-pitr-l3c-gridN-edit` component:

| | grid 1 Berwujud | grid 2 Bangunan | grid 3 Tidak Berwujud |
|---|---|---|---|
| `MonthYearAcquisition` | `required` | no validator | no validator |
| `maxDate` | `new Date(new Date().getFullYear(), 11, 31)` | `new Date(this.taxYear, 11, 30)` | `new Date(new Date().getFullYear(), 11, 31)` |

Grids 1 and 3 bound the acquisition date by the **current calendar year**, not the
tax year, so filing a 2025 return during 2026 accepts a 2026 acquisition date.
That is almost certainly a DJP bug, but it is what runs; mirror it rather than
quietly correcting it, and revisit if the bundle changes.

Hidden context: `RecordId` and `ReturnSheetRecordId` (both disabled),
`TableIndex` (greaterThan(0)), `PeriodCode`, `PeriodYear`,
`TaxpayerAggregateIdentifier`.

Note the dialog declares its controls with a different Angular alias (`a.NI`) than
the other lampiran (`a.p4`) — irrelevant to behaviour, but it defeats a naive grep
for form groups.

### Reference lists

| Column | List | Options |
|---|---|---|
| KELOMPOK/JENIS HARTA, grid 1 | `TANGIBLE_ASSET` | 20 |
| KELOMPOK/JENIS HARTA, grid 2 | `GROUP_OF_BUILDINGS` | 5 |
| KELOMPOK/JENIS HARTA, grid 3 | `INTANGIBLE_ASSET` | 11 |
| METODE … KOMERSIAL | `COMMERCIAL_METHOD` | 7 — GL, SM, SMG, JAT, JJJ, JSP, ML |
| METODE … FISKAL | `FISCAL_METHOD` | 3 — GL (Garis Lurus), SM (Saldo Menurun), JSP (Jumlah Satuan Produksi) |

~~The three asset lists are *inferred*.~~ **Confirmed 2026-08-19** on two
independent grounds: each grid's edit component names its own enum
(`RshTangibleAssetEnum`, `RshGroupOfBuildingsEnum`, `RshIntangibleAssetEnum`),
and the fetched contents match by code range — 04xx/07xx movables, 05xx
buildings, 06xx intangibles. The minified alias chain still was not resolved, per
the pitfall note in `../../../coretax-api/README.md`; the confirmation rests on
names and contents, which is the method that note recommends.

---

## L-3D — daftar nominatif

Three grids, each with a row dialog. Headings:
`A. DAFTAR NOMINATIF BIAYA ENTERTAINMENT` and
`B. DAFTAR NOMINATIF BIAYA PROMOSI SERTA PENGGANTIAN ATAU IMBALAN DALAM BENTUK
NATURA DAN/ATAU KENIKMATAN`, plus a piutang grid.

**No read-only visible fields anywhere in L-3D**, and every visible control is
required. Amounts all carry `greaterThanEquals(0)`. `RecordId` and
`ReturnSheetRecordId` are disabled hidden context in each dialog.

### Entertainment (dialog title `Daftar Nominatif Biaya Hiburan`)

Controls: `EntertainmentDate`, `Location` (Nama Tempat), `Address`, `Type` (Jenis),
`Amount` (Jumlah Pemberian, `greaterThanEquals(0)`), `Name` (Nama Relasi),
`Position` (Posisi/Jabatan), `CompanyName`, `BusinessType` (Jenis Usaha Relasi),
`Notes` — all required.

### Piutang yang nyata-nyata tidak dapat ditagih

| Header | Field | Type |
|---|---|---|
| NOMOR IDENTITAS DEBITUR | `TIN` | text |
| NAMA DEBITUR | `Name` | text |
| ALAMAT DEBITUR | `Address` | text |
| JUMLAH PLAFON PIUTANG | `DebtAmount` | number, fraction 0 |
| JUMLAH PIUTANG YANG NYATA-NYATA TIDAK DAPAT DITAGIH | `BadAmount` | number, fraction 0 |
| METODE PEMBEBANAN | `DeductionMethod` | dropdown → `DEDUCTION_METHOD` (2: Beban Langsung, Beban Cadangan) |
| JENIS DOKUMEN PEMBUKTIAN PEMENUHAN PERSYARATAN | `TypeOfFulfillment` | dropdown → `TYPE_OF_FULFILLMENT` (4: Penyerahan Perkara, Perjanjian Tertulis, Publikasi Penerbitan, Pengakuan Debitur) |

### Promosi / natura (dialog title `Daftar Nominatif Biaya Promosi`)

| Header | Field | Type |
|---|---|---|
| NOMOR IDENTITAS PENERIMA | `TIN` | text |
| NAMA PENERIMA | `Name` | text |
| ALAMAT PENERIMA | `Address` | text |
| TANGGAL | `RecipientDate` | date |
| BENTUK DAN JENIS BIAYA | `TypeOfCost` | dropdown → `TYPE_OF_PROMOTION_COST` (5) |
| NILAI | `Amount` | number |
| KETERANGAN | `Notes` | text |
| JUMLAH PEMOTONGAN/PEMUNGUTAN PPh | `WithholdingAmount` | number |
| NOMOR BUKTI POTONG | `WithholdingNumber` | text |

`TYPE_OF_PROMOTION_COST`: `ADVERTISING` (periklanan), `EXHIBITION` (pameran
produk), `INTRODUCTION` (pengenalan produk baru), `SPONSORSHIP`, `BENEFIT`
(penggantian atau imbalan dalam bentuk natura atau kenikmatan).

---

## Built

Both lampiran were implemented on 2026-08-19 from this document plus a second
bundle read. Where the two disagreed the bundle won, and this document was
corrected rather than the code bent to match it.

- L-3C: `components/L-3C/`, twelve sub-grids from one `Grid.svelte` keyed by
  `tableIndex`, stored flat in `spt_pph_orang_pribadi_lampiran_3c_baris`. The
  flatten/regroup pair lives in `perTabel.ts` with assertions in
  `perTabel.check.ts`, so the page and the loader cannot drift.
- L-3D: `components/L-3D/`, three independent grids, no totals.
- Reference lists are seeded as eight new `l3c_*`/`l3d_*` `daftar` keys with
  codes, so KODE HARTA and the L-3D codes derive from their descriptions the way
  Coretax's `onAssetTypeChange` does.
- Migration `0015`. Neither lampiran feeds an Induk figure, so no computed row
  changed and the 69 Induk assertions were unaffected.

**Display order of the eight new lists is unverified.** They were never captured
from the UI, so the seed uses the endpoint's own order, which for every list we
could check is *not* the order Coretax renders.

## Not yet known

- Whether any cross-grid validation exists (the other lampiran have some). What
  the bundle does show is a per-table minimum: both lampiran set
  `customMessage.required` — "Tabel ini harus berisi minimal satu baris data!"
  on L-3C, the English equivalent on L-3D — so an enabled table with no rows is
  rejected on submit. **Not implemented here**, since our validation fires per
  row on Simpan rather than per table on submit.
- The `Impor data` template format, skipped everywhere in this corpus.
- ~~How rows are assigned to the KELOMPOK 1–4 sub-groups.~~ **Resolved
  2026-08-19, and neither hypothesis was right.** The sub-group is not a field at
  all: it is structural. `tableIndex` is an `@Input` on the grid component and
  takes literal values **1 through 12** — 5 for L-3C grid 1 (KELOMPOK 1–4 plus
  KELOMPOK LAINNYA), 2 for grid 2 (PERMANEN, TIDAK PERMANEN), 5 for grid 3. Each
  sub-group is its own grid instance with its own `GridId`
  (`{ReturnSheetRecordId, TableIndex, PeriodYear}`), and the dialog stamps
  `t.TableIndex = this.tableIndex` on submit. The taxpayer chooses the group by
  choosing which grid to add a row to. The edit components carry
  `this.group = "KELOMPOK"` and `this.otherGroup = "KELOMPOK LAINNYA"` for the
  labels (grid 3 spells the latter `othergroup`, lowercase g).
