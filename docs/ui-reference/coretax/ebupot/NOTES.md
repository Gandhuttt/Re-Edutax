# eBupot (Withholding Slips) — Coretax ground truth

Captured live from `https://coretaxdjp.pajak.go.id/withholding-slips-portal/id-ID/*`
on 2026-08-29, impersonating a real registered WP Badan (PT MALIAWAN MULIA
MEDICATAMA). Per [[feedback_coretax_parity]] precedent from the SPT PPh OP
effort: treat this as directly observed ground truth, not `docs/` hearsay —
but it is a first pass, not the same rigor level as the OP work (single
observation per field, not isolated before/after for every interaction).

## Module map (sidebar → URL slug)

| Sidebar label | URL slug | Notes |
|---|---|---|
| Bukti Potong Saya | `my-withholding-slips` | Slips issued *to* this WP by others |
| BPPU | `ebupotbpu` | "Bukti Pemotongan/Pemungutan Unifikasi Standar" — general PPh 23/26/4(2)/22 etc |
| BPNR | `ebupotbpnr` | Withholding from non-resident WP (separate from BP26?) |
| Penyetoran Sendiri | `ebupotsp` | Self-remitted tax (no counterparty withholding) |
| Pemotongan Secara Digunggung | `ebupotcy` | Lumped/collective withholding (many payees, one slip) |
| Dokumen yang Dipersamakan dengan Bukti Potong | `documentupload` | Upload equivalent-document evidence |
| BP21 – Bukti Pemotongan Selain Pegawai Tetap | `ebupotbp21` | PPh 21 for non-permanent-employee recipients (final & non-final) |
| BP26 – Bukti Pemotongan WP Luar Negeri | `ebupotbp26` | PPh 26, non-resident recipients |
| BPA1 – Bukti Pemotongan A1 Masa Pajak | `ebupotbpa1` | Annual/period-end recap for permanent employees (1721-A1 equivalent) |
| BPA2 – Bukti Pemotongan A2 Masa Pajak | `ebupotbpa2` | Same as A1 but for PNS/TNI/Polri/pejabat negara |
| Bukti Pemotongan Bulanan Pegawai Tetap | `ebupotmp` | Monthly running withholding for permanent employees |

List pages require clicking the reload/refresh icon (circular arrow, top-left
of the grid toolbar) to populate — the grid does not auto-load on navigation.

Each list page has tabs: **Belum Terbit** (draft/not yet issued) / **Telah
Terbit** (issued) / **Tidak Valid**. Create buttons live in Belum Terbit.

## Common validation

- Recipient "Nomor Identitas WP" (NPWP/NIK) is rejected server-side if it
  equals the withholder's own TIN ("Can not input your TIN, please use
  another one").
- For BP21/BPU/MP, entering a valid NIK/NPWP auto-populates **Nama** and, for
  BP21/MP, **Status PTKP** from the DJP taxpayer master (read-only derived
  fields, not typed).
- For BP26, Nama is a plain typed field (non-resident, not in DJP master).

## Object-code reference catalog (shared pattern)

BP21, BPU, BP26, and MP all drive their tax-calc fields off a single combobox,
**Nama Objek Pajak**, which is a reference lookup keyed to a catalog of rows
shaped like:

```
{ nama_objek_pajak, jenis_pajak, kode_objek_pajak, sifat_pajak_penghasilan,
  dpp_percent, tarif_percent, kap_kjs }
```

Selecting a name auto-fills Jenis Pajak / Kode Objek Pajak / Sifat / DPP% /
Tarif% / KAP-KJS as read-only derived fields — none of those are user input.
This is the same pattern as `kode_transaksi_faktur_pajak` etc. already in the
schema (`src/lib/server/db/schema/references/faktur/...`) — a
`kode_objek_pajak_pph` reference table is the right shape, likely with a
`jenis_pajak` discriminator (Pasal 21 / Pasal 23 / Pasal 4(2) / Pasal 26 /
Pasal 22) since one combobox spans multiple withholding articles.

Confirmed live sample (BP21, "Imbalan yang Diterima oleh Olahragawan"):
`jenis_pajak=Pasal 21, kode_objek_pajak=21-100-34, sifat=Tidak Final,
dpp%=50.00, tarif%=5.00, kap_kjs=411121-100`.

**Formula confirmed live (BP21):**
`Pajak Penghasilan (Rp) = Penghasilan Bruto (Rp) × DPP(%) × Tarif(%)`
(100,000,000 × 50% × 5% = 2,500,000, exact match).

BPU and BP26 use "Dasar Pengenaan Pajak (Rp)" directly (no separate DPP%
column — presumably DPP% is baked in or DPP is manually entered) and a plain
`KAP` (not `KAP-KJS`) field — needs live confirmation of BPU's formula, not
yet done this pass.

## BP21 create form — full field list

**Informasi Umum**
- Masa Pajak* (select, month/year)
- Status* (readonly, "NORMAL" — presumably NORMAL/PEMBETULAN)
- Nomor Identitas WP* (text — recipient NIK/NPWP)
- Nama* (readonly, derived from Nomor Identitas WP)
- NITKU/Nomor Identitas Subunit Organisasi Penerima Penghasilan* (select)

**Pajak Penghasilan (Rp)**
- Status PTKP* (select — but observed auto-filled to "K/0" from taxpayer
  master once NIK entered; unclear if user can override)
- Fasilitas Pajak yang Dimiliki oleh Penerima Penghasilan* (select, default
  "Tanpa Fasilitas")
- Nama Objek Pajak* (select — reference catalog, see above)
- Jenis Pajak* (readonly, derived)
- Kode Objek Pajak* (readonly, derived)
- Sifat Pajak Penghasilan* (readonly, derived)
- "Pendapatan Bruto yang Telah Dibayar Sebelumnya (Khusus untuk Kode Objek
  Pajak 21-401-01 dan 21-401-02)" → Jumlah (readonly, conditional on object
  code — only relevant for cumulative/2-year-period objects)
- Penghasilan Bruto (Rp)* (numeric input)
- DPP (%)* (readonly, derived)
- Tarif (%)* (readonly, derived)
- Pajak Penghasilan (Rp)* (readonly, computed — see formula above)
- KAP-KJS* (readonly, derived)

**Dokumen Referensi**
- Jenis Dokumen* (select)
- Nomor Dokumen* (text)
- Tanggal Dokumen* (date)
- NITKU/Nomor Identitas Sub Unit Organisasi* (select — withholder's own
  sub-unit, separate combobox from the recipient one above)

Buttons: Submit / Simpan Konsep (save draft) / "Go to search" (cancel/back).

## BPU (BPPU) create form — full field list

**Informasi Umum** — same 5 fields as BP21 (Masa Pajak, Status, Nomor
Identitas WP, Nama, NITKU penerima).

**Pajak Penghasilan (Rp)**
- Fasilitas Pajak yang Dimiliki oleh Penerima Penghasilan* (select)
- Nama Objek Pajak* (select — same catalog as above, presumably filtered to
  non-21 object codes)
- Jenis Pajak* / Kode Objek Pajak* / Sifat Pajak Penghasilan* (readonly,
  derived)
- Dasar Pengenaan Pajak (Rp)* (numeric input — no separate Penghasilan
  Bruto/DPP% split, unlike BP21)
- Tarif (%)* (readonly, derived)
- Pajak Penghasilan (Rp)* (readonly, computed)
- KAP* (readonly, derived — single field, not KAP-KJS)

**Dokumen Referensi** — same shape as BP21.

No Status PTKP field (not employment income).

## BP26 create form — full field list

**Informasi Umum**
- Masa Pajak* / Status* (same)

**Penghitungan Pajak Penghasilan** (note: different section name than BP21/BPU)
- Nama Fasilitas* (select, default "Tanpa Fasilitas" — appears *before* the
  recipient identity fields, unlike BP21/BPU ordering)
- Nomor Identitas WP* (text)
- Nama* (**plain text input**, not derived — non-resident, not in DJP master)
- Nama Objek Pajak* (select)
- Jenis Pajak* / Kode Objek Pajak* / Sifat Pajak Penghasilan* (readonly,
  derived)
- Penghasilan Bruto (Rp)* (numeric)
- DPP (%)* / Tarif (%)* (readonly, derived)
- Pajak Penghasilan (Rp)* (readonly, computed)
- KAP* (readonly — single field, like BPU)

**Dokumen Referensi** — same 4 fields as BP21, *except* no recipient-side
NITKU (makes sense: non-resident, no Indonesian sub-unit).

No tax-treaty/SKD/country-of-residence fields were visible in this pass —
worth a follow-up check (they may live in a section that only appears after
selecting a treaty-eligible Nama Fasilitas, not observed this session).

## MP (Bukti Pemotongan Bulanan Pegawai Tetap) create form — full field list

**Informasi Umum**
- Masa Pajak* / Status*
- Pegawai Asing* (select, Ya/Tidak presumably)
- Nomor Identitas WP* → Nama* (readonly, derived)
- Status PTKP* (select)
- Jabatan* (text — job title)

**Fasilitas Perpajakan**
- Fasilitas Pajak yang Dimiliki oleh Penerima Penghasilan* (select)
- Nama Objek Pajak* (select — same catalog)
- Jenis Pajak* / Kode Objek Pajak* (readonly, derived)
- Penghasilan Bruto (Rp)* (numeric)
- Tarif (%)* (readonly — **no DPP% field shown**, unlike BP21; likely because
  MP's effective rate already folds in the running-PTKP progressive
  calculation done server-side/behind the derived Tarif%)
- Pajak Penghasilan yang Dipotong (Rp)* (readonly, computed — note field name
  differs from BP21's "Pajak Penghasilan (Rp)")
- KAP-KJS* (readonly, derived)
- NITKU/Nomor Identitas Sub Unit Organisasi* (select)

**No Dokumen Referensi section** — MP doesn't require an underlying source
document reference, unlike BP21/BPU/BP26.

**Build status (2026-08-30)**: MP shipped locally this session. Ground truth
came entirely from the already-fetched `reference-data-ebupot.json` (per
"always refer to the build artifact") plus this section's earlier live-
verified field list — no fresh Coretax login needed this pass, since
`EBUPOTMP_TAX_OBJECT`'s `ParameterData` confirmed MP's tax mechanism is TER
(Tarif Efektif Rata-rata, PMK 168/2023): the exact same band shape
(`TaxExemptionStatus`-keyed `Rates`) BP21 already resolves for its own
permanent-employee-monthly-wage objects. `resolveBp21()` is reused directly
as MP's resolver (no separate `resolveMp.ts`) — MP's `ItemList` shape (TER
bands + one manual-facility entry, no cumulative bracket) is a strict subset
of what it already handles; `brutoSebelumnya` is always passed as `0`.
Reuses BP21's 12-value PTKP enum (`ptkp-ebupot.ts`) since the TER bands are
keyed to the identical K/TK/HB codes.

Two things needed fixing in the reference data before it was usable:
1. `kode_objek_pajak_pph`'s seed data had no `'mp'` rows at all (unlike
   `bpnr`/`cy`/`sp`, which were seeded even though unbuilt) — added the 3
   canonical MP object codes (`21-100-01/02/32`) to
   `seed/data/ebupot/kode_objek_pajak_pph.ts` and added `'mp'` to
   `jenisBuktiPotongValues`.
2. MP's `ParameterData` in the reference-data pull has no top-level
   `IncomeTaxStatus` field at all (every other bukti type's does) — filled
   in as `'Tidak Final'` to satisfy the schema type, consistent with the
   same `21-100-XX` objects under BPA1. The 2 legacy codes (`9999`/`9998`)
   were dropped entirely — their `ParameterData` came back with a
   completely different flat shape (no `ItemList` wrapper), and "legacy
   pre-TER" is semantically incoherent anyway since TER didn't exist before
   PMK 168/2023.

Fasilitas Pajak scope (`4`/`8`/`9`) is derived from the `ItemList`'s
`TaxCertificateCodes`, not live-UI-confirmed this pass — flagged in
`fasilitasPajak.remote.ts`'s comment in case a future session finds a 4th
option live.

Smoke-tested end-to-end (Bruto 10,000,000, PTKP K/0, object `21-100-01`,
Tanpa Fasilitas) through Simpan Konsep → Submit → Terbitkan: Tarif 2%,
Pajak Penghasilan yang Dipotong 200,000 — matches the TER band
[9,650,001–10,050,000] exactly, same table structure already live-verified
for BP21.

## BPA1 (annual permanent-employee recap) create form — full field list

Much larger form than the others — this is the annual 1721-A1-equivalent.

**Informasi Umum**
- Bekerja di Lebih dari Satu Pemberi Kerja* (select, Ya/Tidak)
- Masa Pajak Awal* / Masa Pajak Akhir* (period range, not a single month)
- Status*
- Pegawai Asing* (select)
- Nomor Identitas WP* → Nama* (readonly, derived)
- Status PTKP* (select)
- Jabatan* (text)
- Nama Objek Pajak* → Jenis Pajak* / Kode Objek Pajak* (readonly, derived)
- Jenis Pemotongan* (select — e.g. normal/berhenti/masih bekerja per akhir
  tahun; exact option list not yet captured)

**Penghasilan Bruto**
- Gaji/Pensiun atau THT/JHT*
- Penghitungan Gross Up (checkbox)
- Tunjangan PPh*
- Tunjangan Lainnya, Uang Lembur dan Sebagainya
- Honorarium dan Imbalan Lain Sejenisnya
- Premi Asuransi yang Dibayar Pemberi Kerja
- Penerimaan Dalam bentuk Natura dan Kenikmatan Lainnya yang Dikenakan
  Pemotongan PPh Pasal 21
- Tantiem, Bonus, Gratifikasi, Jasa Produksi dan THR
- Jumlah Penghasilan Bruto (readonly, sum of the above)

**Pengurang**
- Biaya Jabatan / Biaya Pensiun*
- Iuran terkait Pensiun atau Hari Tua*
- Zakat atau Sumbangan Keagamaan yang Bersifat Wajib yang Dibayarkan melalui
  Pemberi Kerja*
- Jumlah Pengurangan (readonly, sum)

**Penghitungan PPh Pasal 21**
- Jumlah Penghasilan Neto* (readonly, Bruto − Pengurang)
- Nomor Bukti Pemotongan BPA1 dari Pemberi Kerja Sebelumnya (Apabila ada) +
  "Get data" button (pulls prior-employer BPA1 to prefill "Penghasilan Neto
  dari Pemotongan Sebelumnya")
- Penghasilan Neto dari Pemotongan Sebelumnya (readonly, pulled via Get data)
- Jumlah Penghasilan Neto untuk Perhitungan PPh Pasal 21
  (Setahun/Disetahunkan)* (readonly)
- Penghasilan Tidak Kena Pajak* (readonly — PTKP amount from Status PTKP)
- Penghasilan Kena Pajak Setahun / Disetahunkan (readonly)
- PPh Pasal 21 atas Penghasilan Kena Pajak Setahun/Disetahunkan* (readonly —
  progressive-bracket tax)
- PPh Pasal 21 Terutang (readonly)
- PPh Pasal 21 Dipotong dari Bukti Pemotongan Sebelumnya* (readonly)
- PPh Pasal 21 Terutang pada Bukti Pemotongan Ini (Dapat Dikreditkan Pada SPT
  Tahunan)* (readonly)
- PPh Pasal 21 yang Dipotong/Ditanggung Pemerintah* (readonly)
- PPh Pasal 21 Kurang (Lebih) Dipotong pada Masa Pajak Desember / Masa Pajak
  Terakhir* (readonly)
- Jenis Fasilitas pada Masa Pajak Desember/Masa Pajak Terakhir* (select)
- KAP-KJS* (readonly)
- NITKU/Nomor Identitas Sub Unit Organisasi* (select)

## BPA1 — live-verified mechanics and build status (2026-08-30)

- **Status PTKP dropdown offers exactly 8 codes**: TK/0-3, K/0-3 — no HB
  variants (unlike BP21's 12-option list). See `ptkp-bpa1.ts`.
- **PTKP amounts** = the standard PMK 101/2016 table (TK/0=54,000,000,
  K/0=58,500,000, each subsequent step +4,500,000 up to K/3=72,000,000/
  TK/3=67,500,000). Confirmed exact via 2 live data points (K/0, TK/0);
  not embedded in the bundle's `ParameterData` — this is backend-computed
  from `Status PTKP`, so the full 8-value table is taken from the
  government-mandated, stable PMK 101/2016 schedule rather than
  independently re-verified point by point.
- **Biaya Jabatan / Biaya Pensiun** = `min(5% × Jumlah Penghasilan Bruto,
  500,000 × monthCount)`, where `monthCount` is the actual number of months
  in the Masa Pajak Awal..Akhir range (NOT always 12 — this is a period
  range, not a single Masa Pajak). Live-verified exact: an 8-month period
  (Jan–Aug) with 200,000,000 bruto → cap = 4,000,000 (5% = 10,000,000 >
  cap), not the 6,000,000 a naive 12-month assumption would give.
- **Progressive Pasal 17 bracket tax** — identical `tax(x) = x×Rate/100 −
  Minus` cumulative-bracket mechanism as BP21's pesangon objects. Live-
  verified exact: PKP 137,500,000 → PPh 14,625,000 (Tarif 15%).
- **Jenis Pemotongan** — 3 options: `Kurang dari Setahun`, `Kurang dari
  setahun yang penghasilannya disetahunkan`, `Setahun Penuh`. **Both**
  "Setahun Penuh" and plain "Kurang dari Setahun" are now live-verified
  identical (same 8-month period, K/0, 200,000,000 bruto → PPh 14,625,000
  both times) — neither annualizes; `penghasilanNetoSetahunDisetahunkan`
  correctly passes the combined Neto straight through for both. Only the
  "disetahunkan" variant's actual annualize/de-annualize formula
  (`× 12 / monthCount` then de-annualize the resulting tax back by
  `× monthCount / 12`) remains **not** independently live-verified — it's
  implemented per standard Indonesian payroll technique, not confirmed.
- **Jenis Fasilitas** (BPA1's own facility field, distinct from other
  bukti types' Fasilitas Pajak) — 3 options mapping to `EBUPOT_TAX_
  CERTIFICATE` codes: `8` (Fasilitas Lainnya), `9` (Tanpa Fasilitas), `11`
  (PPh Pasal 21 Ditanggung Pemerintah/DTP — a Pasal-21-specific DTP code,
  distinct from BPU's general code `4`).
- **Nomor Identitas WP → Nama lookup** confirmed live (same DJP
  taxpayer-master pattern as BP21): NIK `3273010101900001` →
  "INDRA SANJAYA".
- Prior-employer "Get data" pull (auto-fetching `Penghasilan Neto dari
  Pemotongan Sebelumnya`) requires DJP registry access this app doesn't
  have — implemented as plain manual-entry fields
  (`nomorBuktiSebelumnya`, `penghasilanNetoSebelumnya`,
  `pphPasal21DipotongSebelumnya`) instead, consistent with the established
  "not doable" precedent from BPU/BP21.
- Gross Up checkbox exists on the live form but was deliberately scoped
  out of this build (deferred, not implemented).
- **"PPh Pasal 21 Kurang (Lebih) Dipotong pada Masa Pajak Desember" is
  NOT always 0** — corrected after live testing. Live Coretax: with no
  prior monthly Bukti Pemotongan Bulanan Pegawai Tetap recorded, this
  field equals `PPh Terutang pada Bukti Ini − PPh Ditanggung Pemerintah`
  (live-verified exact: 14,625,000 − 0 = 14,625,000, not 0 as this app
  originally computed). This app still has no monthly-withholding-history
  feature to subtract a "sudah dipotong bulanan" term, so it always
  mirrors the zero-prior-withholding case — a taxpayer with real monthly
  BP Bulanan filings would see a smaller (or "lebih"/negative) figure on
  real Coretax that this app cannot reproduce. Fixed in
  `updateBpa1.remote.ts`; both this field and "PPh Pasal 21 yang
  Dipotong/Ditanggung Pemerintah" were also missing entirely from the
  detail page's display and have been added.
- **BPA1's `Nama Objek Pajak` dropdown legacy entries are period-gated**:
  live Coretax for a 2026 filing showed only 3 objects (`21-100-01`,
  `21-100-02`, `21-100-32`) — the `9999`/`9998` legacy pre-2022-bracket
  codes seen in the public reference-data pull did not appear, consistent
  with them being retained only for older/amended filing periods rather
  than being true duplicates. See the `EBUPOTBPA1_TAX_OBJECT` reference
  data: codes `1`/`9999` share `TaxObjectCode: "21-100-01"` but carry
  different bracket schedules (current 5-bracket UU HPP table vs. the old
  4-bracket pre-2022 table with a 50,000,000 first breakpoint instead of
  60,000,000).

**Build status**: BPA1 shipped locally this session (schema, resolver,
full CRUD, detail form, nav link, "Bukti Potong Saya" recap union) and
smoke-tested end-to-end against the exact live-verified numbers above
(biaya jabatan cap 4,000,000, PTKP 58,500,000, PKP 137,500,000, PPh
14,625,000 — all matched exactly through Simpan Konsep → Submit →
Terbitkan). Two real bugs were found and fixed during the smoke test,
not just browser-automation flakiness:
1. `nama` was missing entirely from `UpdateBpa1Schema` and the update
   handler's `.set({...})` — the field rendered and even auto-filled via
   "Cari NPWP" client-side, but was silently dropped on every save.
2. The optional-rupiah fields (`tunjanganPph`, `honorarium`, etc.) used
   `v.optional(rupiahString(field), '0')`, but `formatRupiah(0)` renders
   an untouched editable field as `""` by design (see `rupiahInput.ts`) —
   so an unfilled field submits `""`, and `v.optional`'s fallback only
   fires on a genuinely missing key, not `""`. Fixed with a `''`→`'0'`
   union branch, mirroring `booleanRadio`'s already-documented pattern in
   `valibot-schema.ts` for the same "'' vs undefined" trap. Other bukti
   types with `v.optional(rupiahString(...))` on truly-optional amount
   fields (e.g. BP21/BPU's `pendapatanBrutoSebelumnya`) may carry the same
   latent bug — not re-audited this pass, flagged here for future
   reference.

## Reference-data pull (2026-08-29) — the real spec

Pulled the `withholding-slips-portal` bundle
(`main.03469c0b8e38345f.js`, 648KB — this portal is NOT code-split the way
the SPT PPh OP returnsheets-portal is; the whole app including every eBupot
form lives in one `main.*.js`) and grepped it for
`.ReferenceDataTypeName="..."` per [[coretax-reference-data-api]]. Found 16
eBupot-specific types and fetched them all with the existing
`docs/coretax-api/fetch-reference-data.mjs --types ...` script — no changes
needed to the script, it's fully generic. Saved as
`docs/coretax-api/reference-data-ebupot.json` (15 populated lists, 483
options total — `EBUPOTBPUBPNR_TAX_OBJECT` came back empty).

| ReferenceDataType | Rows | Used by |
|---|---|---|
| `EBUPOTBP21_TAX_OBJECT` | 36 | BP21 Nama Objek Pajak |
| `EBUPOTBPU_TAX_OBJECT` | 206 | BPU Nama Objek Pajak |
| `EBUPOTBPNR_TAX_OBJECT` | 44 | BPNR |
| `EBUPOTSP_TAX_OBJECT` | 104 | Penyetoran Sendiri |
| `EBUPOTCY_TAX_OBJECT` | 34 | Pemotongan Secara Digunggung |
| `EBUPOTBP26_TAX_OBJECT` | 1 | BP26 (suspiciously small — likely BP26 actually draws from `EBUPOTBPNR_TAX_OBJECT` live; needs live re-check, this may be a near-dead type) |
| `EBUPOTBPA1_TAX_OBJECT` | 5 | BPA1 |
| `EBUPOTBPA2_TAX_OBJECT` | 4 | BPA2 |
| `EBUPOTBPA_TAX_OBJECT` | 3 | shared BPA (?) |
| `EBUPOTBPA_STATUS` | 3 | BPA1/BPA2 status |
| `EBUPOTMP_TAX_OBJECT` | 5 | MP Nama Objek Pajak |
| `EBUPOT_DOCUMENT_TYPE` | 14 | Dokumen Referensi → Jenis Dokumen (all forms) |
| `EBUPOT_PAYMENT_METHOD` | 2 | |
| `EBUPOT_STATUS` | 11 | overall status enum (NORMAL/PEMBETULAN/... + issued-state values) |
| `EBUPOT_TAX_CERTIFICATE` | 11 | "TaxCertificateCode"/"TaxCertificateCodes" referenced inside `ParameterData` below — this is the Fasilitas Pajak (SKB/DTP/ditanggung pemerintah/dst.) dimension |

**No dedicated reference type exists for Status PTKP or NITKU** — grepped the
full 327-type list from this bundle, neither PTKP nor FACILITY nor NITKU
appear. PTKP is almost certainly a fixed 12-value enum client-side
(`TK0,TK1,TK2,TK3,K0,K1,K2,K3,HB0,HB1,HB2,HB3` — confirmed as literal values
inside the TER bracket data below), not reference-data-driven. NITKU is
presumably resolved from the WP's own registered sub-unit list via a
different (authenticated) endpoint, not `currentreferencedata`.

### The big finding: `ParameterData` carries the full TER bracket schedule, not a flat rate

Each `EBUPOTBP21_TAX_OBJECT` row's `ParameterData` (JSON-encoded string) is
far richer than the 5 flat scalars the UI showed (DPP%, Tarif%, Sifat,
KAP-KJS): it's the **complete TER (Tarif Efektif Rata-rata, PMK 168/2023)
progressive bracket table**, split into three PTKP categories (A:
TK0/TK1/K0/HB0/HB1, B: TK2/TK3/K1/K2/HB2/HB3, C: K3), each with ~40
`{Min, Max, Rate}` bands, PLUS separate `ItemList` entries per
`TaxCertificateCode` (facility type) with their own flat/manual rate
overrides. Example shape (object `21-100-27`, "Upah Pegawai Tidak Tetap..."):

```json
{
  "IncomeTaxStatus": "Final",
  "ItemList": [
    { "TaxCertificateCodes": ["9","4"], "DeemedRate": 100,
      "Rates": [ { "Min":0, "Max":5400000, "Rate":0, "TaxExemptionStatus":["TK0","TK1","K0","HB0","HB1"] }, ... ~120 more bands across 3 PTKP groups ... ] },
    { "TaxCertificateCodes": ["10"], "DeemedRate": 100, "Rates": [] },
    { "TaxCertificateCodes": ["8"], "ManualTaxRate":"TRUE", "ManualIncomeTaxWithheld":"TRUE", "Rates": [] }
  ],
  "RevenueCode": "411121-100",
  "TaxArticle": "Pasal 21",
  "TaxObjectCode": "21-100-27"
}
```

For BP21's *live* "Imbalan yang Diterima oleh Olahragawan" (`21-100-34`) the
UI showed a flat `DPP%=50, Tarif%=5` — meaning **not every BP21 object uses
TER**; some use the older flat DPP×Tarif method (Pasal 17 non-final
articles) and some (the "Upah/Bulanan" wage-earner objects, `21-1xx` codes
with `TaxExemptionStatus` bands) use TER. **The BP21 form's DPP%/Tarif%
fields are therefore only the resolved-for-this-recipient values, not the
data model** — the reference row can encode either shape, and the client
picks the applicable `ItemList` entry by facility/certificate code and then
(for TER objects) the applicable band by PTKP status × bruto amount.

BPU's `ParameterData` (checked: `24-101-01` "Dividen") is simpler — just a
flat `Rate` per `TaxCertificateCode`, no bracket table:

```json
{ "IncomeTaxStatus":"Tidak Final",
  "ItemList": [
    {"TaxCertificateCode":"9","Rate":15}, {"TaxCertificateCode":"8","Rate":15,"ManualTaxRate":"TRUE"},
    {"TaxCertificateCode":"4","Rate":15}, {"TaxCertificateCode":"2","Rate":0}
  ],
  "RevenueCode":"411124-100", "TaxArticle":"Pasal 23", "TaxObjectCode":"24-101-01" }
```

confirming the live BPU form's simpler "Dasar Pengenaan Pajak × Tarif%, no
DPP% column" shape from the UI pass above — BPU objects don't need a
DPP-percentage step at all, `Rate` applies straight to DPP.

**Schema implication:** don't flatten the reference catalog to
`{dpp%, tarif%}` scalar columns. Store `ParameterData` close to verbatim
(jsonb/text column) per object code, keyed by
`(ReferenceDataType, Code/TaxObjectCode)`, and compute DPP/Tarif/Pajak at
entry time by evaluating `ItemList`/`Rates` against the selected facility +
(for TER objects) PTKP status + bruto amount — same shape as how
`kode_transaksi_faktur_pajak` stores reference rows in this codebase, but
the "logic" here is meaningfully more complex than a lookup and needs an
actual small TER-evaluation function, not just a join.

## Post-"Simpan Konsep" behavior — live-verified 2026-08-29 (BPU)

Filled a full BPU draft live (NPWP `3273010101900001` "INDRA SANJAYA",
Tanpa Fasilitas, Dividen, DPP 20,000,000, both NITKU fields, full Dokumen
Referensi) and clicked **Simpan Konsep** for real (never Submit/Terbitkan).

- **Client-side required-field validation still blocks the save.** Leaving
  NITKU (or any `*` field) empty and clicking Simpan Konsep does NOT
  navigate away — it stays on the form and shows an inline red "Kolom ini
  wajib diisi!" under the empty field. This matches the same validation we
  saw earlier on BP21.
- **Once every visible required field is filled, the save succeeds
  unconditionally**: a "Success — Save data successfully!" toast appears
  and the page redirects to the list (Belum Terbit tab) — no confirmation
  dialog, no second step.
- **But the saved row's Status always comes back `SAVEDINVALID`** ("Disimpan
  Tidak Valid" — this exact string is in our seeded `EBUPOT_STATUS` table),
  even with every field filled correctly and zero field-level errors on
  re-opening. Reproduced twice with identical, fully-filled data.

  **Resolved** (not a data bug): per a third-party writeup
  ([doyanduit.com](https://doyanduit.com/news/solusi-error-e-bupot-saved-invalid-di-coretax-saat-membuat-bukti-potong/)),
  `SAVEDINVALID` is simply Coretax's status label for *any* draft saved via
  Simpan Konsep that hasn't gone through **Submit** yet — it does not mean
  something is wrong with the data. Submit is a distinct, earlier step from
  **Terbitkan** (publish/issue): Submit runs server-side validation
  (format, masa-pajak compatibility, billing alignment) and finalizes the
  draft's data; Terbitkan is the actual irreversible issuance that assigns
  the official document number and electronic signature. The real flow is
  Simpan Konsep → **Submit** → Terbitkan → tanda tangan elektronik, not
  Simpan Konsep → Terbitkan directly. Un-submitted drafts sitting at
  `SAVEDINVALID` are normal and expected, not evidence of a bad save.
- `SAVEDINVALID` and post-Submit statuses both stay in the same **Belum
  Terbit** tab until Terbitkan — no separate "invalid drafts" list. The row
  is still fully editable (pencil icon) and deletable (checkbox + Hapus)
  either way.

**Gap in our app:** `updateBpu.remote.ts` has no equivalent two-step
save/submit distinction — Simpan Konsep is our only persistence action, with
no separate Submit step that performs Coretax-style server-side validation
before a draft can be issued. Whether to model this (a `SUBMITTED` status
distinct from a plain saved draft) is an open design question for when this
module gets closer to supporting real issuance, not an urgent fix.

## BPU: Fasilitas Pajak and manual-rate objects — live + bundle-verified 2026-08-29

Two follow-ups from the initial pass, both confirmed live and (for the second)
grounded directly in `main.03469c0b8e38345f.js` source, not just UI clicking.

**Fasilitas Pajak dropdown always shows only 3 of the 11
`EBUPOT_TAX_CERTIFICATE` codes**, reproduced across two separate sessions/
accounts: **Tanpa Fasilitas** (code 9, `NoCertificate`), **PPh Ditanggung
Pemerintah/DTP** (code 4, `IncomeTaxBorneByGovernment`), **Fasilitas Lainnya**
(code 8, `OtherCertificate`) — regardless of which Nama Objek Pajak is
selected, or even before one is selected. The other 8 codes (SKB Pasal 21/22/
23, SKD, Peredaran Bruto Tertentu, etc.) are never offered in BPU's UI at all.
Confirmed in the bundle that the field's `referenceDataType` really is the
full `EBUPOT_TAX_CERTIFICATE` list (`EBUPOTTAXCERTIFICATE` resolves to the
same `_l.ReferenceDataTypeName = "EBUPOT_TAX_CERTIFICATE"` as everywhere
else), so the reduction to 3 must happen via a client-side filter applied
specifically in BPU's form init — the exact filter expression wasn't located
in the minified source in a reasonable search, but the *effect* is solid
(two live sessions, consistent both times).

**Field order is Fasilitas Pajak → Nama Objek Pajak, not the other way
around.** Nama Objek Pajak stays empty ("Tidak ada opsi tersedia") until a
Fasilitas is picked first — the reverse of what the original NOTES pass
assumed.

**Manual-rate objects — mechanism now confirmed in source.** Selected
Dividen + Fasilitas Lainnya (the `ManualTaxRate: "TRUE"` entry in that
object's `ParameterData.ItemList`): Tarif (%) changed from a greyed-out
derived field to an editable input, pre-filled with the object's default
rate (15.00). Typed `7,50`, it was accepted; with DPP = 10,000,000 the
computed Pajak Penghasilan came out to 750,000 (10,000,000 × 7.5%) — same
formula, just fed a user-supplied rate.

Grounded directly in the bundle — this exact line appears ~16 times across
different eBupot form modules, always the same shape:

```js
// find the ItemList entry matching the selected TaxCertificateCode, then:
this.form.setDisabled(t.XUk.TaxRate.name, "TRUE" != upperCase(T.ManualTaxRate)),
this.form.setDisabled(t.XUk.DeemedNetIncome.name, "TRUE" != upperCase(T.ManualDeemedRate)),
this.form.setDisabled(t.XUk.IncomeTax.name, "TRUE" != upperCase(T.ManualIncomeTaxWithheld))
```

So the rule is exactly `ManualTaxRate/ManualDeemedRate/ManualIncomeTaxWithheld
== "TRUE"` on the matching `ItemList` entry ⇒ that specific field
(Tarif/DPP%/Pajak Penghasilan respectively) unlocks for manual entry instead
of staying derived-and-readonly. **This is broader than just Tarif** — the
same mechanism can unlock DPP% (`DeemedNetIncome`) or even the final tax
amount itself (`IncomeTax`/`IncomeTaxWithheld`) on other object/facility
combinations, not tested live this pass but present in the same code path.

**Bonus, unrelated to the above:** typing a NIK Coretax doesn't recognize
triggers a confirmation dialog — "TIN {x} saat ini belum terdaftar dalam
sistem. Sistem akan otomatis menggunakan TIN 9990000000999000 sebagai TIN
penerima penghasilan..." — and on confirming, Nomor Identitas WP becomes the
literal placeholder `9990000000999000` and Nama becomes
`PENERIMA PENGHASILAN#{original typed NIK}`. This is Coretax's defined
fallback for an unregistered recipient; our app has no equivalent (see gap
list — no DJP registry access at all, this shows what the real system does
instead of just accepting anything typed).

**App gap this closes/updates:** `resolveTarif` (`src/lib/server/ebupot/
resolveTarif.ts`) rejects any `ManualTaxRate: "TRUE"` case outright. The real
behavior isn't "no rate exists" — it's "let the preparer type one," pre-filled
with the same default the non-manual case would have used. Fixed alongside
this doc update: `fasilitasPajak.remote.ts` now scopes BPU's facility list to
codes 8/9/4, and the BPU form makes Tarif editable when Fasilitas Lainnya is
selected instead of erroring server-side.

## BP21: TER, flat, and cumulative-bracket formulas -- live-verified 2026-08-29

Re-verified live before implementing BP21 (not just relying on the notes
above from the first pass). NIK `3273010101900001` ("INDRA SANJAYA") on the
BP21 create form: entering it auto-fills Nama (read-only, grey) AND Status
PTKP (editable, white background + clear button, defaulted to `K/0`) --
confirms Status PTKP is a derived-but-overridable field, not purely manual
and not purely locked.

**TER formula** -- selected object `21-100-35` ("Upah Pegawai Tidak Tetap
yang Dibayarkan secara Bulanan"). Bruto 10,000,000 + PTKP `K/0` -> Tarif
2.00%, PPh 200,000. Same bruto, switched PTKP to `K/3` -> Tarif 1.50%, PPh
150,000. Both match `ParameterData.ItemList[].Rates[]` exactly: filter bands
by `TaxExemptionStatus` containing the PTKP code, then find the band whose
`[Min,Max]` contains the bruto. `PPh = bruto x DeemedRate% x band.Rate%`.

**Flat formula** -- object `21-402-02` ("Honor... PNS Golongan III..."): DPP
100.00%, Tarif 5.00% regardless of PTKP or bruto -- matches a plain
`Rate: 5` on the `ItemList` entry, no bracket table.

**Cumulative/`Minus`-bracket formula** (only `21-401-01`/`21-401-02`,
pesangon/pensiun sekaligus) -- these show an extra "Pendapatan Bruto yang
Telah Dibayar Sebelumnya" field. Set previous=60,000,000, current bruto=
50,000,000 (total=110,000,000) on `21-401-01` -> **Tarif 15.00%, PPh
3,500,000**. Reverse-engineered and confirmed exact: bands carry a `Minus`
subtraction constant (Pasal 17 lump-sum style), `tax(x) = x * band(x).Rate/100
- band(x).Minus`; `taxOnTotal = tax(110,000,000) = 110,000,000*15% -
12,500,000 = 4,000,000`; `taxOnPrevious = tax(60,000,000) = 60,000,000*5% -
2,500,000 = 500,000`; `PPh = taxOnTotal - taxOnPrevious = 3,500,000`. Tarif
shown is the bracket-of-total's `Rate`.

**A fourth, plain bruto-only bracket shape also exists** -- found by
exhaustively running every one of the 36 objects' `ItemList` entries through
`resolveBp21.ts`'s classification logic (all facility codes x all 12 PTKP
codes x a spread of bruto amounts): `21-100-24` and `21-100-29` (both "Upah
Pegawai Tidak Tetap...Harian...sampai dengan Rp2.500.000 Sehari", plain and
"Fasilitas Tertentu" variants) carry `Rates` bands with **neither**
`TaxExemptionStatus` **nor** `Minus` -- `{Min,Max,Rate}` only, selected
purely by bruto. The original resolver only recognized TER (`TaxExemptionStatus`)
and cumulative (`Minus`) bands, so it silently fell through to the
exempt/manual branch for these two objects and always returned Tarif=0/no
override, regardless of the real bracket. **Live-verified and fixed**:
`21-100-24`, bruto=1,000,000, Status PTKP left unset -> Tarif 0.50%, PPh
5,000 (bracket `[450001,2500000]=0.5%`); switching Status PTKP to `K/3`
(same bruto) -> **identical** Tarif/PPh, confirming this bracket is genuinely
PTKP-independent. Also confirmed live: entering a bruto above this object's
own max (2,500,000) triggers Coretax's own "Gross Income exceed the maximum
value allowed for this tax object" validation error. `resolveBp21.ts` and
its client-side mirror in `bp21/[id]/+page.svelte` now check for this plain
band shape between the TER and flat branches.

## BP21: bracket ceiling validation -- source-grounded and fixed

Found the exact mechanism in `main.03469c0b8e38345f.js` while investigating
the plain-bracket bug above: `o=Math.max(...bands.map(b=>b.Max))`, then
`form.controls[TaxBase.name].setValidators([required, max(o/(DeemedNetIncome/100))])`.
Coretax caps Penghasilan Bruto at the highest `Max` across the resolved
item's `Rates` bands, scaled by `100/DPP%`. For TER/cumulative objects the
top band runs to `9,999,999,999,999` so this is a no-op; it only bites on
plain-bracket objects like `21-100-24`/`21-100-29` where the real ceiling
(2,500,000) means the object code genuinely doesn't apply above it -- a
different object code exists for ">Rp2.500.000 Sehari".

This mattered more than a missing error message: without the cap, entering
a bruto above an object's ceiling made the resolver's bracket lookup return
no matching band, silently defaulting Tarif=0/PPh=0 -- a wrong-object-code
mistake would produce a valid-looking Rp0 bukti potong instead of being
blocked. Fixed by adding `maxBruto` to `ResolvedBp21` (computed the same way
as Coretax's own validator) and enforcing it server-side in
`updateBp21.remote.ts` (blocks the save with Coretax's own error wording)
plus a client-side inline warning. Live-verified end-to-end: submitting
`21-100-24` with bruto=10,000,000 is rejected with "Penghasilan Bruto
melebihi nilai maksimum untuk objek pajak ini (Rp2.500.000)"; bruto=2,000,000
(within the cap) saves normally (Tarif 0.5%, PPh 10,000).

**Fasilitas Pajak restricted to codes 4/8/9/10** (DTP, Fasilitas Lainnya,
Tanpa Fasilitas, SKB Pasal 21) across all 36 `EBUPOTBP21_TAX_OBJECT` rows --
same restriction mechanism as BPU's 3-code scoping, confirmed live (dropdown
showed exactly these 4 options).

**`ManualDeemedRate` is NOT dead code for BP21** (unlike BPU, where it never
triggers) -- several objects (e.g. `21-100-38`, `21-402-04` facility 8,
`21-401-01`/`02` facility 8) set `ManualDeemedRate: "TRUE"` alongside
`ManualTaxRate`/`ManualIncomeTaxWithheld`, so BP21 needs all three manual
override fields (DPP%, Tarif%, Pajak Penghasilan) wired up, not just two.

**Resolved, source-grounded**: the Fasilitas Pajak dropdown's apparent
lock had nothing to do with Nama Objek Pajak selection order. Confirmed via
DOM inspection (fresh page load, before touching anything: the dropdown
already carries `disabled=""` + `p-disabled`, defaulted to "Tanpa
Fasilitas") and via `main.03469c0b8e38345f.js` source: `validateListFacilityRegister()`
only fires once both `TaxPeriodCode` (Masa Pajak) and `TaxIdentificationNumber`
(recipient NIK/NPWP) are filled, calls
`ebupotHelperService.checkListFacilityRegister(nik, ['AS.19-01'], masaPajak)`
-- a live DJP facility-certificate registry lookup for that specific
recipient+period -- filters `EBUPOTTAXCERTIFICATE` down to whichever
certificates (SKB Pasal 21/22/23 etc.) that recipient is actually
registered for, then only *then* calls
`form.setDisabled(TaxCertificateCode.name, false)` to unlock the field.
This is the same class of gap as NITKU/Nama Penerima real DJP-registry
access (not doable in this app), not an object-selection ordering quirk --
the BP21 form's always-editable `Select` (no restriction beyond the
4/8/9/10 code scoping already confirmed) is the right simplification given
that constraint.

Implemented in `src/lib/server/ebupot/resolveBp21.ts`,
`src/routes/ebupot/bp21/*`. Reference data (`kode_objek_pajak_pph` rows with
`jenisBuktiPotong='bp21'`) was already fully seeded via migration
`0025_reference_data.sql` from earlier session work -- no new reference
migration was needed, only the new `bukti_potong_bp21` schema migration.

## BP26: single object code, flat 20%, non-resident identity fields -- live-verified 2026-08-30

Re-verified live before implementing (the earlier first-pass field list --
see "BP26 create form" above -- was missing several fields entirely). This
pass also settled an old open question from the first pass ("BP26 draws
from BPNR live?" -- no, they're unrelated document types despite both being
Pasal 26).

**One object code only**, confirmed both from `EBUPOTBP26_TAX_OBJECT` (1
row: `27-100-99`) and live (Nama Objek Pajak dropdown showed exactly that
one option). **Flat 20% formula**: Tanpa Fasilitas/DTP -> DPP 100%, Tarif
20% regardless of anything else (`Rates: [{Min:0, Max:1e18, Rate:20}]` --
effectively unbounded). Bruto 100,000,000 -> PPh 20,000,000, live-verified
exact.

**SKD (Surat Keterangan Domisili) / Fasilitas Lainnya unlock manual DPP and
Tarif** (`ManualDeemedRate`/`ManualTaxRate: "TRUE"`) -- live-verified:
selecting SKD flips Tarif from grey/derived to white/editable; typed 100%
computed PPh = bruto x 100% exactly. `ManualIncomeTaxWithheld: "FALSE"` --
Pajak Penghasilan always stays auto-computed from DPP x Tarif, matching the
real-world reasoning that DJP can't pre-encode every bilateral tax treaty's
reduced rate, so it just unlocks manual entry instead.

**Full field list, live-verified** -- Informasi Umum has only Masa
Pajak*/Status* (recipient fields live under "Penghitungan Pajak
Penghasilan" instead, unlike BPU/BP21's "Informasi Umum" placement): Nama
Fasilitas* (before identity fields), Nomor Identitas WP* (foreign TIN, no
format check observed), Nama* (**plain typed when the WP lookup misses** --
see correction below), Alamat*, Negara Asal* (select, full country
reference-data list), Tanggal Lahir/Tempat Lahir/Nomor Paspor/Nomor
KITAS-KITAP (all optional, no asterisk), Nama Objek Pajak*, Jenis
Pajak*/Kode Objek Pajak*/Sifat Pajak Penghasilan* (readonly), Penghasilan
Bruto*, DPP%*, Tarif%*, Pajak Penghasilan*, KAP* (single field like BPU,
not KAP-KJS). Dokumen Referensi same 4 fields as BPU/BP21 but **no
recipient-side NITKU at all** (correct -- non-resident, no Indonesian
sub-unit concept), only the withholder's own NITKU.

**Correction, source-grounded 2026-08-30** (grepped the withholding-slips-
portal bundle directly, not just live UI): Nomor Identitas WP *does*
attempt a DJP taxpayer-master lookup (`getTaxPayerName()` on blur). If it
resolves to a registered -- even previously-deleted -- domestic NPWP,
Address/CountryOfOrigin/DOB/BirthCityCode/PassportNumber/KITASNumber get
hidden+disabled and Name is presumably derived; only on "not found" (the
`else` branch, which shows a "NPWP telah dihapus" warning if the number
was a now-deleted NPWP) does it fall into the manual non-resident branch
this app implements. Since this app has no DJP taxpayer-master access, it
always takes the "not found" branch -- which is the only branch a real
foreign TIN would ever hit anyway -- so no behavior change, just a more
accurate description.

Also source-confirmed in the same pass: **no async DJP-facility-registry
check exists for BP26 at all** -- `checkListFacilityRegister` doesn't
appear anywhere in BP26's bundle chunk (unlike BP21's
`validateListFacilityRegister`). Fasilitas unlocks unconditionally on Masa
Pajak *blur* (`setDisabled(TaxCertificateCode, false)`), not gated on
Nomor Identitas WP as this doc previously assumed from UI timing alone.
And Nama Objek Pajak does **not** reset when Fasilitas changes (confirmed:
`TaxObjectReferenceCode` is only re-enabled on Fasilitas change, never
nulled) -- this app's non-resetting `Select`s are correct as-is.

The `ManualDeemedRate`/`ManualTaxRate`/`ManualIncomeTaxWithheld` -> DPP%/
Tarif%/Pajak-Penghasilan unlock mechanism (already established for
BPU/BP21) is directly present in BP26's own bundle chunk too:
`setDisabled(DeemedNetIncome.name, "TRUE"!=upperCase(T.ManualDeemedRate))`
etc. -- confirms `resolveBp26.ts`'s implementation byte-for-byte, not just
by pattern-carryover from the other two bukti types.

**Country reference list corrected 2026-08-30**: diffed
`negara_spt_pph_badan` (originally 254 active rows, seeded independently
for SPT PPh Badan) against Coretax's live `COUNTRY_CODE` reference-data
type (265 rows, fetched via `docs/coretax-api/fetch-reference-data.mjs
--types COUNTRY_CODE`) and found real drift: ~8 same-country spelling
mismatches (Belarus/Belarusia, Cina/Tiongkok, Grenada/Granada, Guinea
Ekuator/Ekuator Guinea, Kazakhstan/Kazakstan, Kyrgyzstan/Kirgistan,
Lesotho/Lesoto, Pulau Christmas/Pulau Natal -- renamed in place, same
`kode`) plus **Coretax genuinely carrying legacy *and* modern codes as
separate selectable entries** for several countries (Palestine has both
`PSE:PALESTINE` and `PS:Negara Palestina`; similarly Eswatini/Swaziland,
Timor Leste/"Timor Leste Democratic Republic", Perancis/Prancis, four
distinct Korea entries, Slowakia/"Slovak Republic") -- added as new rows
rather than merged, to match Coretax's own duplicate-code behavior exactly.
"Anguilla" existed in the old seed with no Coretax counterpart at all --
deactivated (`aktif=false`) rather than deleted, to preserve any existing
FK. Fixed in `src/lib/server/db/seed/data/spt_pph_badan/negara.csv` (now
264 rows) and `003-spt-pph-badan-reference-master.ts` (explicit
deactivation step, since the CSV-driven upsert only ever sets
`aktif=true`). Post-fix diff against Coretax's live list: 263/263 exact
match, zero remaining discrepancies. This also affects SPT PPh Badan's own
country dropdowns (Lampiran 2/10A/10C), which share the same table.

Implemented in `src/lib/server/ebupot/resolveBp26.ts`,
`src/routes/ebupot/bp26/*`. Negara Asal reuses the country reference table
already seeded for SPT PPh Badan (`negara_spt_pph_badan`) rather than
duplicating it -- it's a generic country list, not actually
SPT-Badan-specific data. Reference data (`kode_objek_pajak_pph`,
`jenisBuktiPotong='bp26'`) was already fully seeded via migration
`0025_reference_data.sql` -- only the new `bukti_potong_bp26` schema
migration was needed.

## BPA2 (PNS/TNI/Polri/pejabat negara A2 recap) — live-verified field list and mechanics (2026-08-30)

Live create form fully walked (`ebupotbpa2/create`), test filled with the
same 8-month period / K/0 / 200,000,000 gaji scenario used for BPA1's
verification, to compare mechanics directly.

**Full field list, differences from BPA1 in bold:**
- Informasi Umum: Bekerja di Lebih dari Satu Pemberi Kerja*, Masa Pajak
  Awal*/Akhir*, Status*, Nomor Identitas WP* → Nama* (derived — DJP
  taxpayer-master lookup confirmed live, same as BPA1/BP21: NIK
  `3273010101900001` → "INDRA SANJAYA"). **No Pegawai Asing field at all**
  (makes sense — PNS/TNI/Polri aren't foreign employees). **New: NIP/NRP*
  and Pangkat/Golongan*** (plain text, no lookup/validation observed).
  Status PTKP* (same 8-option TK/K 0-3 list as BPA1 — shares the
  `EBUPOTBPA_STATUS`... no, shares the PTKP table itself, reuse
  `ptkp-bpa1.ts` directly, no need for a separate `ptkp-bpa2.ts`). **"Jabatan" is renamed "Posisi"** (same plain-text concept). Nama Objek
  Pajak* → Jenis Pajak*/Kode Objek Pajak* (derived) — **only 2 options
  live** (Pegawai Tetap `21-100-01`, Pensiunan `21-100-02`) — no
  "Fasilitas di Daerah Tertentu" variant (`21-100-32`) that BPA1 has.
  Jenis Pemotongan* — same 3 options (`Kurang dari Setahun`, disetahunkan
  variant, `Setahun Penuh`) from the shared `EBUPOTBPA_STATUS` reference
  type — confirmed via reference-data pull these are literally the same
  enum BPA1 uses.
- **Penghasilan Bruto — completely different component breakdown**, PNS
  payroll-structure specific: Gaji Pokok/Pensiun*, Tunjangan Istri,
  Tunjangan Anak, Tunjangan Perbaikan Penghasilan, Tunjangan
  Struktural/Fungsional, Tunjangan Beras, Tunjangan Lain-lain,
  Penghasilan Tetap dan Teratur Lainnya yang Pembayarannya Terpisah dari
  Pembayaran Gaji, Jumlah Penghasilan Bruto (sum). **No Gross Up
  checkbox, no Honorarium/Premi Asuransi/Natura/Tantiem Bonus** (BPA1's
  private-sector-specific components are entirely absent).
- Pengurang — **identical to BPA1**: Biaya Jabatan/Biaya Pensiun* (same
  `min(5%×bruto, 500,000×monthCount)` cap formula, live-verified exact
  match: 4,000,000 for the same 8-month/200,000,000 test case), Iuran
  terkait Pensiun atau Hari Tua*, Zakat*, Jumlah Pengurangan (sum).
- Penghitungan PPh Pasal 21 — **same PTKP amounts, same progressive
  Pasal 17 bracket formula**, live-verified exact match to BPA1's own
  reference case (PKP 137,500,000 → PPh 14,625,000, Tarif 15%) using the
  *same* test inputs. Jumlah Penghasilan Neto*, "Get data" prior-employer
  pull (same not-doable-here pattern as BPA1), Penghasilan Neto dari
  Pemotongan Sebelumnya, Jumlah Penghasilan Neto untuk Perhitungan
  (Setahun/Disetahunkan)*, Penghasilan Tidak Kena Pajak*, Penghasilan
  Kena Pajak*, PPh Pasal 21 atas PKP*, PPh Pasal 21 Terutang, PPh Pasal 21
  Dipotong dari Bukti Sebelumnya*, PPh Pasal 21 Terutang pada Bukti Ini*.
  **No "Jenis Fasilitas pada Masa Pajak Desember" dropdown at all** —
  BPA1's facility/DTP mechanism doesn't exist for BPA2. Instead there's
  **"PPh Pasal 21 yang Telah Dipotong*"**, confirmed live to be a
  disabled/system-computed field (not manually enterable) — defaults to
  0 with no monthly withholding history behind it, presumably auto-pulled
  from Bukti Pemotongan Bulanan Pegawai Tetap records when they exist
  (same monthly-history feature this app lacks for BPA1 too). "PPh Pasal
  21 Kurang (Lebih) Dipotong pada Masa Pajak Desember / Masa Pajak
  Terakhir*" = `PPh Terutang pada Ini − PPh yang Telah Dipotong`,
  live-verified exact (14,625,000 − 0 = 14,625,000) — same structural
  formula as BPA1's fixed version, just without the DTP-facility branch.
  KAP-KJS* (derived, `411121-100`, same). **NITKU/Nomor Identitas Sub
  Unit Organisasi\* is an actual `<select>` here** (not a readonly derived
  field like BPA1) — but live-verified to offer exactly one option (the
  withholder's own single sub-unit), so functionally equivalent; safe to
  implement the same way BPA1 does (derived plain value, no real FK
  reference table needed for this app's single-NITKU-per-account scope).
- **No "Dokumen Referensi" section at all** — confirmed by the full field
  list ending at NITKU, directly followed by Submit/Simpan Konsep. Unlike
  every other bukti type built so far (BPU/BP21/BP26/BPA1 all require
  Jenis Dokumen/Nomor Dokumen/Tanggal Dokumen), BPA2 needs none of it.

**Build status**: BPA2 shipped locally this session (schema, `resolveBpa2Tax`
reusing BPA1's PTKP/Biaya-Jabatan helpers, full CRUD, detail form, nav link,
"Bukti Potong Saya" recap union) and smoke-tested end-to-end against the
same reference scenario as BPA1 (8-month period, K/0, 200,000,000 gaji) —
matched exactly through Simpan Konsep → Submit → Terbitkan: biaya jabatan
4,000,000, PTKP 58,500,000, PKP 137,500,000, Tarif 15%, PPh Terutang
14,625,000, Kurang/Lebih Desember 14,625,000 (PPh yang Telah Dipotong
always 0, same as BPA1's zero-prior-withholding case).

**Not explored this pass**: BPNR, Penyetoran Sendiri, Pemotongan Secara
Digunggung, Dokumen yang Dipersamakan, and the referencedata API's full
Nama Objek Pajak catalog beyond what's already been pulled for BPU/BP21/
BP26/BPA1/BPA2's own object codes (only those specific codes were
fetched per-type via `fetch-reference-data.mjs`, not the entire shared
catalog in one pull).
