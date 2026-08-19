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
| `AssetCode` (Kode Harta) | **disabled** — the only read-only visible field |
| `GroupAssetType` (Jenis Harta) | required |
| `MonthYearAcquisition` | required; `maxDate = new Date(taxYear, 11, 30)` |
| `CostOfAcquisition` (Biaya Perolehan) | required, **greaterThan(0)** |
| `FiscalBookValueBeginningYear` | required, **min(0)** |
| `CommercialMethodAsset` | required |
| `FiscalMethodAsset` | required |
| `FiscalValueThisYear` | required, min(0) |
| `Notes` (Keterangan) | **optional** — the only one |

Hidden context: `RecordId` and `ReturnSheetRecordId` (both disabled),
`TableIndex` (greaterThan(0)), `PeriodCode`, `PeriodYear`,
`TaxpayerAggregateIdentifier`.

Note the dialog declares its controls with a different Angular alias (`a.NI`) than
the other lampiran (`a.p4`) — irrelevant to behaviour, but it defeats a naive grep
for form groups.

### Reference lists

| Column | List | Options |
|---|---|---|
| KELOMPOK/JENIS HARTA, grid 1 | `TANGIBLE_ASSET` *(inferred)* | 20 |
| KELOMPOK/JENIS HARTA, grid 2 | `GROUP_OF_BUILDINGS` *(inferred)* | 5 |
| KELOMPOK/JENIS HARTA, grid 3 | `INTANGIBLE_ASSET` *(inferred)* | 11 |
| METODE … KOMERSIAL | `COMMERCIAL_METHOD` | 7 — GL, SM, SMG, JAT, JJJ, JSP, ML |
| METODE … FISKAL | `FISCAL_METHOD` | 3 — GL (Garis Lurus), SM (Saldo Menurun), JSP (Jumlah Satuan Produksi) |

The three asset lists are *inferred*: each list's contents match its grid's
heading (non-building tangibles / buildings / intangibles) and the count of lists
matches the count of grids, but the alias chain was not resolved — see the pitfall
note in `../../../coretax-api/README.md`. Confirm before relying on the
assignment.

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

## Not yet known

- Whether any cross-grid validation exists (the other lampiran have some).
- The `Impor data` template format, skipped everywhere in this corpus.
- How rows are assigned to the KELOMPOK 1–4 sub-groups: whether the taxpayer picks
  the group directly through KELOMPOK/JENIS HARTA, or it is derived from the
  selected asset code. The single `GroupAssetType` field backing both the KODE
  HARTA and KELOMPOK/JENIS HARTA columns suggests the former, but this is
  unverified.
