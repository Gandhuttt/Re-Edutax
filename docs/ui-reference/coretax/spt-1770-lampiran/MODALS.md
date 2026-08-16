# Modals and overlays

Captured 2026-08-15 (screenshots 07 to 11) and completed 2026-08-16.

> **All 15 row-editor modals are now captured**, in `modals/`, one screenshot per
> grid, taken in the maximal state so every gated grid was reachable. On
> 2026-08-15 only 1 of 15 existed. Field-level specs for all 15 are in
> `MODAL-FIELDS.md`.

Still not opened, deliberately: `Hapus`, `Hapus Semua`, `Posting SPT` and
`Bayar dan Lapor`, being destructive or submission actions. A capture-phase click
blocker was installed on `Simpan Konsep` and `Bayar dan Lapor` during the sweep;
it never fired.

Note every modal was opened and closed with `Tutup`, never `Simpan`, so no rows
were created.

## 1. Row editor, opened by `Tambah`

Example taken from L-1 Section A sub-table 1, KAS DAN SETARA KAS. The original
screenshots 07/08/09 were deleted 2026-08-17; see instead
`modals/01-l1-a1-kas-dan-setara-kas.jpg` for the modal,
`REFERENCE-LISTS.txt` (LIST1) for the Deskripsi options, and
`behavior/01-validation-all-required-on-simpan.jpg` for the validation state.

**The modal title is the sub-table name**, and the layout is a vertical
label/field form, not the horizontal grid layout. So each grid needs two
presentations: a read-only tabular view and a separate form for create/edit.

Fields for KAS DAN SETARA KAS:

| Field | Control | Required marker | Notes |
|-------|---------|-----------------|-------|
| Kode | text | * | **disabled**, grey. Derived, presumably from Deskripsi |
| Deskripsi | combobox with search | * | the reference list, see below |
| Nomor Akun | text | * | |
| Atas Nama | text | * | |
| Nama Bank/Institusi | text | * | |
| Lokasi Harta | combobox with search | * | country list, see below |
| Tahun Perolehan | text | * | |
| Saldo | text | * | |
| Keterangan | combobox | **none** | but see validation below |

Footer buttons: `Tutup` and `Simpan`.

### Kode is derived, not entered

The Kode field is disabled while every other field is editable. The grid shows
KODE as its own column, so the code is system-assigned from the Deskripsi
selection.

**We are deliberately not copying this.** Decision 2026-08-15: Kode is a plain
text input in our implementation, typed by the peserta. No derivation from
Deskripsi, no disabled state. This is a known, intentional divergence from
Coretax, not an oversight, so do not "fix" it later.

Consequence: our reference lists do not need to carry codes paired to
descriptions, and L-1 A4 (Harta bergerak, the one grid with a KODE but no
Deskripsi dropdown) stops being a special case worth investigating.

### Validation fires on blur, per field

Leaving a required field untouched and moving on renders `Kolom ini wajib diisi!`
in a pink band directly under that field, and the band **pushes subsequent
fields down**, which shifts click targets. Errors accumulate one per field as
you tab through.

### The required marker and the validation disagree

**Keterangan has no asterisk yet still raises `Kolom ini wajib diisi!`.** So the
asterisk cannot be trusted as the source of truth for required-ness. If we
transcribe requiredness from the labels we will get Keterangan wrong.

## 2. Reference lists behind the grid dropdowns

### Deskripsi, for KAS DAN SETARA KAS

9 options, and this is the list that determines Kode:

| Option |
|--------|
| Uang Tunai/Bank Note/Koin |
| Tabungan (Bank/Lembaga Keuangan) |
| Giro |
| Deposito |
| Uang elektronik |
| Cek |
| Wessel |
| Commercial Paper |
| Setara Kas Lainnya |

Note "Wessel", DJP's spelling, rather than "Wesel".

Each of L-1's other six harta sub-tables will have its own Deskripsi list. Only
this one has been captured.

### Lokasi Harta, the country list

**265 entries, 263 unique.** The list is shared with any other "negara" style
dropdown in the form.

**It contains duplicates: "Angola" appears twice and "Jersey" appears twice.**
This is a data-quality defect in DJP's own reference data. If we mirror the list
and key by name we will get a collision, so key by code and preserve DJP's
ordering rather than deduplicating silently.

Ordering is not alphabetical in Indonesian: it begins Aruba, Afganistan, Angola,
Angola, Kepulauan Aland, Albania, Andorra, Uni Emirat Arab. That ordering looks
like it follows ISO country codes (ABW, AFG, AGO, ALA, ALB, AND, ARE) with
Indonesian display names, which supports keying by code.

`Indonesia` is present as a single entry.

### Keterangan

**Not captured.** The dropdown would not open across two attempts.

## 3. `Impor data` menu

Screenshot 10. A two-item dropdown, not a modal:

| Item |
|------|
| Pilih File |
| Unduh Format Data |

So DJP publishes a **downloadable template per table**, and import is
file-based. If we mirror the import feature we should match their template
format rather than inventing one. The template itself was not downloaded.

## 4. `XML Monitoring`

Screenshot 11. Reached from a button in the page header, present on every tab.

A tracking table for bulk XML submissions:

| Column |
|--------|
| TIDAK |
| NAMA FILE |
| ATTACHMENTNAME |
| UPLOADED DATE |
| STATUS |
| PESAN KESALAHAN |
| AKSI |

Toolbar: refresh, `Filter`, `Atur Kolom`, `Export`. Pagination with a page-size
selector. Empty state reads "Tidak ada data." which is a **third** empty-state
string, distinct from the lampiran grids' two.

Two implications:

- There is an **entire XML bulk-submission path** parallel to filling the form
  by hand. Worth knowing exists even if the training app never implements it.
- This modal uses a **different table component** from the lampiran grids:
  `Filter` / `Atur Kolom` / `Export` as labelled buttons, versus the lampiran
  grids' icon row and inline per-column filters. Coretax is not internally
  consistent about its own data grid.

## 5. `Pilih Rekening Bank`, Induk section G

**Does not open.** The button is disabled because the SPT's computed status is
Nihil and section G only applies to Lebih Bayar.

This **confirms** what `../spt-1770-induk/STATES.md` had marked as inferred:
section G is genuinely disabled, not merely visually inert. Needs a Lebih Bayar
draft to capture.

## Still unopened

- `Hapus` and `Hapus Semua` confirmations, destructive
- `Posting SPT`, pulls live DJP data into the return
- `Bayar dan Lapor`, files the return
~~The `Keterangan` dropdown~~ — opened 2026-08-17. It is a **2-option** list,
`Harta PPS` / `Harta Investasi PPS`, shared by six grids. The 2026-08-15 note
that it "would not open across two attempts" was a transient failure, not a
disabled control.

~~Deskripsi lists for L-1 harta sub-tables 2 to 6, and for every other grid~~ —
done 2026-08-17. **All 29 dropdowns across the 15 modals are captured**, in
`REFERENCE-LISTS.txt`: 20 distinct lists, 630 options total.

~~The row editor for any grid other than KAS DAN SETARA KAS~~ — done 2026-08-16,
all 15 in `modals/`.

Genuinely still unopened: the `Impor data` file-format template (never
downloaded), and the confirmations/submission actions listed above.
