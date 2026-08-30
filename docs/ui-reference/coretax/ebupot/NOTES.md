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
value allowed for this tax object" validation error -- this app doesn't
replicate that per-object max validation (only the bracket lookup itself),
which is a minor known gap, not incorrect computation. `resolveBp21.ts` and
its client-side mirror in `bp21/[id]/+page.svelte` now check for this plain
band shape between the TER and flat branches.

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

## Not yet explored this pass

BPNR, Penyetoran Sendiri, Pemotongan Secara Digunggung, Dokumen yang
Dipersamakan, BPA2, and the referencedata API pull for the Nama Objek Pajak
catalog (full list — only spot-checked ~7 of what looked like 20+ entries by
scrolling). BPA2 is very likely BPA1's field set minus civilian-specific bits
plus PNS/TNI/Polri rank fields — not confirmed live.

Next step for full parity: pull the withholding-slips-portal JS bundle (same
method as [[coretax-bundle-as-spec]]) and the reference-data API (per
[[coretax-reference-data-api]]) to get the *complete* Nama Objek Pajak →
{jenis_pajak, kode_objek_pajak, sifat, dpp%, tarif%, kap_kjs} catalog instead
of manual UI scrolling — this is the highest-value single artifact since it's
shared across BP21/BPU/BP26/MP/BPA1/BPA2.
