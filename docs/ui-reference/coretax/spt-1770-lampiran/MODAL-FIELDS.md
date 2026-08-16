# Row-editor field specs, all 15 grids

Captured 2026-08-16 in the maximal state (see `GATING.md`), one modal per
editable grid. Screenshots in `modals/`. Opened with `Tambah`, closed with
`Tutup`, never `Simpan`.

Legend: `*` = asterisk shown on the label, `[dis]` = control rendered disabled.
Remember from 2026-08-15 that **the asterisk is not a reliable required marker**:
Keterangan carries no asterisk yet still raises `Kolom ini wajib diisi!`.

## The three cross-cutting findings

**1. Derived fields are wider than just Kode.** Every modal disables `Kode`, as
already known. But four other kinds of field are also disabled and system-filled:

| Field | Modal | Derived from |
|-------|-------|--------------|
| Nama Penerima Pinjaman | L-1 A2 Piutang | the NIK/NPWP entered above it |
| Nomor Identitas Pemilik + Nama pemilik | L-1 A4 Harta Bergerak | Kepemilikan selection |
| Nama Pemberi Kerja | L-1 D | the NPWP entered above it |
| **Penghasilan Neto** | L-1 D | **computed: Bruto − Pengurang** |
| Nama Pemotong/Pemungut PPh | L-1 E | the NPWP |
| Kode Objek Pajak | L-2 A | Jenis Penghasilan |
| Kode Penghasilan | L-2 C | Jenis Penghasilan |

L-1 D's `Penghasilan Neto` is the important one: it is an arithmetic result, not a
lookup, so the modal does a live calculation while open.

The NPWP-to-name lookups **pre-fill with the taxpayer's own identity** by default
(NIK `3275081005930029`, name `WAWAN SETIYAWAN`), which is a defaulting behaviour
worth mirroring or deliberately not mirroring.

**2. Three modals are titled wrongly or in English.** The modal title is normally
the sub-table name in caps. Three break it:

| Grid | Modal title | Issue |
|------|-------------|-------|
| 6. HARTA LAINNYA | `Aset Lain-Lain` | different words, mixed case |
| E. DAFTAR BUKTI PEMOTONGAN/PEMUNGUTAN PPh | `Penghasilan Bruto` | names one of its own fields |
| C. PENGURANG PPh TERUTANG | **`Income Tax Deduction`** | untranslated English |

Placeholders leak too: most dropdowns read `Silakan Pilih`, but L-1 A6, L-1 B,
L-1 E, L-2 A, L-2 B, L-2 C, L-3A-4 B and L-5 B/C all show **`Please Select`**.
So Coretax's own Indonesian localisation is incomplete. Do not copy these
strings; use consistent Indonesian.

**3. The same concept uses different controls in different modals.**
`Lokasi Harta` is a searchable dropdown (the 265-entry negara list) in A1 and A3,
but a **plain text input** in A5. Any reference-table design has to be per-grid,
not per-concept.

## Per-grid field lists

### L-1 A1, KAS DAN SETARA KAS (9)
`[dis]*Kode` · `*Deskripsi` (dropdown) · `*Nomor Akun` · `*Atas Nama` ·
`*Nama Bank/Institusi` · `*Lokasi Harta` (dropdown) · `*Tahun Perolehan` ·
`*Saldo` · `Keterangan` (dropdown)

Matches the 2026-08-15 capture exactly, which cross-validates the method.

### L-1 A2, PIUTANG (9)
`[dis]*Kode` · `*Deskripsi` (dropdown) · `*Lokasi Penerima` (dropdown) ·
`*Nomor Identitas Penerima (NIK/NPWP)` · `[dis]*Nama Penerima Pinjaman` ·
`*Nilai Piutang` · `*Tahun Dimulai` · `*Saldo Piutang Saat Ini` ·
`Keterangan` (dropdown)

### L-1 A3, INVESTASI/SEKURITAS (10)
`[dis]*Kode` · `*Deskripsi` (dropdown) · `*Lokasi Harta` (dropdown) ·
`*Nomor Identitas Bank/Institusi/Penerima Investasi (NPWP)` ·
`*Nama Bank/Institusi/Penerima Investasi` · `*Nomor Akun` · `*Harga Perolehan` ·
`*Tahun Perolehan` · `*Nilai Saat Ini` · `Keterangan` (dropdown)

Unlike A2, the Nama here is **editable**, not derived, despite sitting under an
NPWP field. Inconsistent with A2 and D.

### L-1 A4, HARTA BERGERAK (11)
`[dis]*Kode` · `*Tipe` (dropdown) · `*Merk/Model` · `*Nomor Polisi/Registrasi` ·
`*Kepemilikan` (dropdown) · `[dis]*Nomor Identitas Pemilik (NIK/NPWP)` ·
`[dis]*Nama pemilik` · `*Tahun Perolehan` · `*Harga Perolehan` ·
`*Nilai Saat Ini` · `Keterangan` (dropdown)

**No Deskripsi.** `Tipe` drives Kode here instead, which explains why A4 was the
one grid with a KODE column but no Deskripsi dropdown. Note `Nama pemilik` is
lower-case `pemilik` where every sibling label is Title Case.

### L-1 A5, HARTA TIDAK BERGERAK (11)
`[dis]*Kode` · `*Deskripsi` (dropdown) · `*Lokasi Harta` (**text**) ·
`*Ukuran Properti - Tanah` · `*Ukuran Properti - Bangunan` ·
`*Sumber Kepemilikan` (dropdown) · `*Nomor Sertifikat` · `*Tahun Perolehan` ·
`*Harga Perolehan` · `*Nilai Saat Ini` · `Keterangan` (dropdown)

### L-1 A6, HARTA LAINNYA — modal titled `Aset Lain-Lain` (8)
`[dis]*Kode` · `*Deskripsi` (dropdown) · `*Tahun Perolehan` ·
`*Biaya Perolehan` · `*Nilai Saat Ini` · `*Bukti Kepemilikan/Nomor Akun` ·
`*Informasi Tambahan` · `Keterangan` (dropdown)

Modal says **Biaya** Perolehan; the grid column says **HARGA** PEROLEHAN. Same
field, two names.

### L-1 B, UTANG PADA AKHIR TAHUN PAJAK (8)
`[dis]*Kode` · `*Deskripsi` (dropdown) · `*NIK/NPWP Kreditur` ·
`*Nama Kreditur` · `*Negara Kreditur` (dropdown) · `Tahun Peminjaman` ·
`*Saldo` · `Keterangan` (dropdown)

`Tahun Peminjaman` is the rare non-Kode, non-Keterangan field with no asterisk.

### L-1 D, PENGHASILAN NETO DALAM NEGERI DARI PEKERJAAN (5)
`*Nomor Identitas Pemberi Kerja` · `[dis]*Nama Pemberi Kerja` ·
`*Penghasilan Bruto` · `*Pengurang Penghasilan Bruto/Biaya` ·
`[dis]*Penghasilan Neto`

**No Kode field at all.** `Simpan` renders **disabled** here until the required
fields are filled, unlike every other modal where it is enabled from the start.

### L-1 E, BUKTI PEMOTONGAN — modal titled `Penghasilan Bruto` (7)
`[dis]*Nama Pemotong/Pemungut PPh` · `*NPWP Pemotong/Pemungut PPh` ·
`*Nomor Bukti Pemotongan/Pemungutan` ·
`*Tanggal Bukti Pemotongan/Pemungutan` (**date picker**, `dd-mm-yyyy`) ·
`*Jenis Pajak` (dropdown) · `*Penghasilan Bruto` · `*PPh yang Dipotong/Dipungut`

First date control in the form. It has a calendar button and a clear (X) button.

### L-2 A, PENGHASILAN FINAL (6)
`*NPWP Pemotong/Pemungut` · `*Nama Pemotong/Pemungut` ·
`[dis] Kode Objek Pajak` · `Jenis Penghasilan` (dropdown) ·
`Dasar Pengenaan Pajak` (Rp) · `*PPh Terutang` (Rp)

Money fields carry a grey `Rp` prefix box. Note `Jenis Penghasilan` has **no
asterisk** yet drives the derived Kode Objek Pajak.

### L-2 B, BUKAN OBJEK PAJAK (5)
`[dis] Kode` · `*Jenis Penghasilan` (dropdown) · `NPWP Sumber Penghasilan` ·
`Nama Sumber Penghasilan` · `Penghasilan Bruto` (Rp)

### L-2 C, PENGHASILAN NETO LUAR NEGERI — titled `Penghasilan Luar Negeri` (10)
`Nama Sumber/Pemberi Penghasilan` · `Negara Sumber/Pemberi Penghasilan` (dropdown) ·
`*Tanggal Transaksi` (date) · `*Jenis Penghasilan` (dropdown) ·
`[dis]*Kode Penghasilan` · `Penghasilan Neto` (Rp) ·
`*Pajak yang Dibayar/Dipotong/Terutang di Luar Negeri dalam Mata Uang Asing` ·
`Mata Uang` (dropdown) ·
`*Pajak yang Dibayar/Dipotong/Terutang di Luar Negeri dalam Rupiah` (Rp) ·
`*Kredit Pajak yang Dapat Diperhitungkan` (Rp)

The largest modal, and the only one with a **`Mata Uang` currency dropdown**, a
reference list we have not captured and do not yet have an equivalent of.

### L-3A-4 B, PENGHASILAN NETO DALAM NEGERI LAINNYA (3)
`[dis] Kode` · `*Jenis Penghasilan` (dropdown) · `*Penghasilan Neto` (Rp.)

Smallest modal. Note the Rp prefix here is `Rp.` with a period, where every other
modal uses `Rp`.

### L-5 B, PENGURANG PENGHASILAN NETO — titled `PENGURANGAN PENGHASILAN NETO` (3)
`[dis]*Kode` · `*Jenis Pengurang Penghasilan Neto` (dropdown) ·
`*Jumlah Pengurang Penghasilan Neto` (Rp)

Title says PENGURANG**AN**, the section heading says PENGURANG.

### L-5 C, PENGURANG PPh TERUTANG — titled `Income Tax Deduction` (3)
`[dis]*Kode` · `*Jenis Pengurang PPh Terutang` (dropdown) ·
`*Jumlah Pengurang PPh Terutang` (Rp)

## What this means for our implementation

- A generic "row editor from column list" component will **not** work. Field
  count ranges 3 to 10, some fields are absent from the grid, some grid columns
  are absent from the modal, and disabled/derived behaviour differs per grid.
- Since we deliberately keep `Kode` as a plain text input (see
  `pph-op-kode-plain-text-input`), every `[dis]*Kode` above becomes an ordinary
  input for us, and the Deskripsi-to-Kode derivation is not implemented.
- `Penghasilan Neto` in L-1 D is genuine arithmetic and should stay derived.
- All dropdown contents are now captured in `REFERENCE-LISTS.txt`: 29 dropdowns,
  **20 distinct lists, 630 options**. Three are shared rather than per-grid:
  the 265-entry negara list (5 fields), the 2-entry `Keterangan` PPS list
  (6 fields), and everything else is unique to one grid.

## Notes from the reference lists

- **`Keterangan` is a PPS flag, not free text.** Only `Harta PPS` /
  `Harta Investasi PPS`, so it marks assets declared under the Voluntary
  Disclosure Program. L-1 B Utang gets its own 1-option variant, whose label is
  bilingual: `Debt in relation to Voluntary Disclosure Program Assets/Utang
  terkait PPS`.
- **L-2 A `Jenis Penghasilan` has 104 options**, by far the largest, and it is
  the final-tax object list. It carries live policy detail (crypto/aset kripto,
  IKN incentives, DHE deposit tenors), so it will date faster than the others.
- **`Mata Uang` has 111 entries** with inconsistent naming: mostly Indonesian
  (`Rupiah Indonesia`, `Dolar Australia`) but some English-with-country
  (`UAE Dirham: UNITED ARAB EMIRATES`, `Yuan Renminbi: CHINA`).
- The negara list's known defects are confirmed at 265 entries: `Angola` twice
  (3, 4), `Jersey` twice (115, 116), plus non-country entries such as
  `Tanpa kewarganegaraan`, `Pengungsi (Konvensi Pasal 1, 1951)`,
  `UNITED NATIONS AGENCY`, and casing-inconsistent duplicates like
  `Korea (Republik)` alongside `KOREA (STH), REPUBLIC`. Key by code, preserve
  DJP ordering, do not silently dedupe.
