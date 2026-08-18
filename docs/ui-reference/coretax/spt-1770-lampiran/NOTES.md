# SPT 1770 lampiran, L-1 / L-2 / L-3A-4 / L-5

- Source: `coretaxdjp.pajak.go.id/returnsheets-portal/id-ID/personal-income-tax-return/...`
- Captured: 2026-08-15
- Tahun pajak: 2025, Status Pembetulan, Metode Pencatatan

Column lists were read from the DOM rather than screenshots, since the grids
scroll horizontally beyond the viewport.

## The big structural difference

**Induk is a questionnaire. The lampiran are data grids.** Nothing in the
lampiran resembles Induk's Ya/Tidak-plus-hint pattern. Each section is one or
more editable tables with:

- a toolbar: `Tambah`, `Hapus`, `Hapus Semua`, `Impor data` (dropdown)
- an icon row: refresh, and three export buttons (document / Excel / PDF), plus
  a filter toggle
- sortable columns (every header carries a sort control)
- a per-column filter row, with text inputs or `Pilih <COLUMN>` dropdowns
- a `JUMLAH TABEL n` footer row carrying the column total
- pagination with a page-size selector, default 10, showing "Menampilkan 0
  sampai 0 dari 0 entri"
- an empty state, "Tidak ada data yang ditemukan." (L-1/L-2) or "Tidak ada data
  untuk ditampilkan." (L-3A-4)

Note the two different empty-state strings.

Each lampiran tab has its own small HEADER block showing read-only Tahun Pajak
and NPWP, and a bulleted list of its sections directly under the tab bar.

## L-1

Five sections.

| Section | Title |
|---------|-------|
| A | HARTA PADA AKHIR TAHUN PAJAK |
| B | UTANG PADA AKHIR TAHUN PAJAK |
| C | DAFTAR ANGGOTA KELUARGA YANG MENJADI TANGGUNGAN |
| D | PENGHASILAN NETO DALAM NEGERI DARI PEKERJAAN |
| E | DAFTAR BUKTI PEMOTONGAN/PEMUNGUTAN PPh |

Section A is itself split into **7 numbered sub-tables**, each with a different
column set:

| # | Sub-table | Columns (after TINDAKAN, NO.) |
|---|-----------|-------------------------------|
| 1 | KAS DAN SETARA KAS | KODE, DESKRIPSI, NOMOR AKUN, ATAS NAMA, NAMA BANK/INSTITUSI, LOKASI HARTA, TAHUN PEROLEHAN, SALDO, KETERANGAN |
| 2 | PIUTANG | KODE, DESKRIPSI, LOKASI PENERIMA PINJAMAN, NIK/NPWP PENERIMA PINJAMAN, NAMA PENERIMA PINJAMAN, TAHUN DIMULAI, NILAI PIUTANG, SALDO PIUTANG SAAT INI, KETERANGAN |
| 3 | INVESTASI/SEKURITAS | KODE, DESKRIPSI, LOKASI HARTA, NPWP BANK/INSTITUSI/PENERIMA INVESTASI, NAMA BANK/INSTITUSI/PENERIMA INVESTASI, NOMOR AKUN, TAHUN PEROLEHAN, HARGA PEROLEHAN, NILAI SAAT INI, KETERANGAN |
| 4 | HARTA BERGERAK | KODE, TIPE, MERK/MODEL, NOMOR POLISI/REGISTRASI, KEPEMILIKAN, NIK/NPWP PEMILIK, NAMA PEMILIK, TAHUN PEROLEHAN, HARGA PEROLEHAN, NILAI SAAT INI, KETERANGAN |
| 5 | HARTA TIDAK BERGERAK (TERMASUK TANAH BANGUNAN) | KODE, DESKRIPSI, LOKASI HARTA, UKURAN PROPERTI - TANAH, UKURAN PROPERTI - BANGUNAN, SUMBER KEPEMILIKAN, NOMOR SERTIFIKAT, TAHUN PEROLEHAN, HARGA PEROLEHAN, NILAI SAAT INI, KETERANGAN |
| 6 | HARTA LAINNYA | KODE, DESKRIPSI, TAHUN PEROLEHAN, BUKTI KEPEMILIKAN/NOMOR AKUN, INFORMASI TAMBAHAN, HARGA PEROLEHAN, NILAI SAAT INI, KETERANGAN |
| 7 | IKHTISAR HARTA | DESKRIPSI, HARGA PEROLEHAN, NILAI SAAT INI |

Sub-table 7 is a rollup of 1 to 6, and has no TINDAKAN/NO. columns, so it is
read-only.

Sections B to E:

| Section | Columns |
|---------|---------|
| B. Utang | KODE, DESKRIPSI, KREDITUR, NEGARA KREDITUR, TAHUN PEMINJAMAN, SALDO, KETERANGAN, Nomor Identitas WP, Nama |
| C. Anggota keluarga | NO., NAMA, NIK, TANGGAL LAHIR, HUBUNGAN DENGAN WAJIB PAJAK, PEKERJAAN |
| D. Penghasilan neto pekerjaan | NAMA PEMBERI KERJA, NOMOR IDENTITAS PEMBERI KERJA, PENGHASILAN BRUTO, PENGURANG PENGHASILAN BRUTO/BIAYA, PENGHASILAN NETO |
| E. Bukti potong | NAMA PEMOTONG/PEMUNGUT PPh, NPWP PEMOTONG/PEMUNGUT PPh, NOMOR BUKTI PEMOTONGAN/PEMUNGUTAN, TANGGAL BUKTI PEMOTONGAN/PEMUNGUTAN, JENIS PAJAK, PENGHASILAN BRUTO, PPh YANG DIPOTONG/DIPUNGUT |

## L-2

Three sections, matching Induk rows 14c, 14d, 1.d.

| Section | Title | Columns |
|---------|-------|---------|
| A | PENGHASILAN YANG DIKENAKAN PAJAK PENGHASILAN BERSIFAT FINAL | NPWP PEMOTONG/PEMUNGUT, NAMA PEMOTONG/PEMUNGUT, KODE OBJEK PAJAK, JENIS PENGHASILAN, DASAR PENGENAAN PAJAK (Rupiah), PPh TERUTANG |
| B | PENGHASILAN YANG TIDAK TERMASUK OBJEK PAJAK | KODE, JENIS PENGHASILAN, SUMBER PENGHASILAN, PENGHASILAN BRUTO, NIK/NPWP, NAMA |
| C | PENGHASILAN NETO LUAR NEGERI | NO., SUMBER/PEMBERI PENGHASILAN, TANGGAL TRANSAKSI, JENIS PENGHASILAN, PENGHASILAN NETO (RUPIAH), PPh YANG DIBAYAR/DIPOTONG/TERUTANG DI LUAR NEGERI, KREDIT PAJAK YANG DAPAT DIPERHITUNGKAN, NAMA, NEGARA, NILAI DALAM MATA UANG ASING, NILAI DALAM RUPIAH, MATA UANG ASING |

Section A's toolbar has only `Tambah`, no Hapus/Impor, unlike L-1's grids.

Section C carries foreign-currency columns, so it needs a currency reference and
a rupiah conversion, similar to the Badan side's negara refs.

## L-3A-4

Two sections. This is the lampiran reached from Induk 1.c.

| Section | Title | Columns |
|---------|-------|---------|
| A | PENGHASILAN NETO DALAM NEGERI DARI USAHA DAN/ATAU PEKERJAAN BEBAS BERDASARKAN PENCATATAN | NO., NAMA TKU, JENIS USAHA/PEKERJAAN BEBAS, PEREDARAN BRUTO (Rp), NORMA (%), PENGHASILAN NETO |
| B | PENGHASILAN NETO DALAM NEGERI LAINNYA | TINDAKAN, NO., KODE, JENIS PENGHASILAN, PENGHASILAN NETO |

Section A carries an italic instruction line above the grid: "Wajib Pajak yang
menyelenggarakan pencatatan wajib mengisi Lampiran 3B untuk menyampaikan rincian
penghasilan bruto." So **a Lampiran 3B exists** that we have not seen, and the
tab is named `L-3A-4` rather than `L-3`, implying the 3-series is subdivided
(3A, 3B, and something numbered 4 within it).

Section A footers are `JUMLAH PEREDARAN BRUTO (Rp)` and `TOTAL PENGHASILAN NETO`,
two totals rather than L-1's single `JUMLAH TABEL n`.

**NAMA TKU** matches the TKU concept already implemented on the Badan side
(L5 TKU id remap in the pembetulan copy).

## L-5

Three sections, matching Induk rows 3 and 8.

| Section | Title |
|---------|-------|
| A | PENGHITUNGAN KOMPENSASI KERUGIAN FISKAL |
| B | PENGURANG PENGHASILAN NETO |
| C | PENGURANG PPh TERUTANG |

Section A is **not a normal grid**. It is a fixed carryforward matrix:

- Rows are tahun pajak, 2016 through 2025, numbered 1 to 10
- Left column group `LABA/RUGI NETO FISKAL` with sub-columns `Tahun
  Pajak/Bagian Tahun Pajak` and `NILAI (RUPIAH)`
- Right column group `JUMLAH KOMPENSASI KERUGIAN FISKAL` spanning `TAHUN 2021`
  to `TAHUN 2026`, each `NILAI (Rp)`, with 2025 labelled `TAHUN PAJAK INI` and
  2026 labelled `TAHUN PAJAK BERJALAN`
- No Tambah/Hapus toolbar, the row set is fixed

This is directly analogous to the Badan L7 carryforward, which is already
implemented with deliberately manual math. Same shape, different year window.

Sections B and C are ordinary grids:

| Section | Columns |
|---------|---------|
| B | NO., KODE, JENIS PENGURANG PENGHASILAN NETO, JUMLAH PENGURANG PENGHASILAN NETO |
| C | KODE, JENIS PENGURANG PPh TERUTANG, JUMLAH PENGURANG PPh TERUTANG |

## Not every grid is user-editable

Checked 2026-08-15 by enumerating `Tambah` buttons and checking each table body
for inline inputs. **12 of the 19 grids have a `Tambah` button. The rest have no
row editor and no inline entry at all.**

Has `Tambah` (modal row editor):

| Grid |
|------|
| L-1 A1 to A6, the six harta sub-tables |
| L-1 B, Utang |
| L-1 E, Daftar bukti pemotongan |
| L-2 A, Penghasilan final |
| L-2 B, Bukan objek pajak |
| L-3A-4 B, Penghasilan neto dalam negeri lainnya |
| L-5 C, Pengurang PPh terutang |

No `Tambah`, no inline inputs:

| Grid | Likely reason |
|------|---------------|
| L-1 A7, Ikhtisar Harta | rollup of A1 to A6, read-only by design |
| L-1 C, Daftar anggota keluarga | populated by `Posting SPT` |
| L-1 D, Penghasilan neto dari pekerjaan | populated by `Posting SPT` |
| L-2 C, Penghasilan neto luar negeri | unknown |
| L-5 A, Kompensasi kerugian fiskal | fixed year matrix |
| L-5 B, Pengurang penghasilan neto | **unexplained** |

The Induk header text for `Posting SPT` explicitly lists "Harta, Utang, Daftar
Anggota Keluarga, Bukti Potong, Pembayaran", which matches C and D being
system-populated. So **some lampiran data is pulled from DJP records rather than
typed**, and our training app has to seed that instead.

Two open puzzles:

- ~~**L-5 B has no way to add a row**~~ and ~~**L-2 C likewise has no entry
  path**~~ — **[bundle-confirmed] 2026-08-19, both were unexercised gates.** Each
  grid's add/edit column is a one-line derivation of an Induk answer:

  | Grid | Coretax | Induk answer |
  |------|---------|--------------|
  | L-5 A | no action column at all | — (fixed ten-row matrix) |
  | L-5 B | `IsShowActionColumn = !isStatusSubmitted && chkC2` | row **3** = Ya |
  | L-5 C | `IsShowActionColumn = !isStatusSubmitted && chkC5` | row **8** = Ya |
  | L-2 C | `IsShowActionColumn = !isStatusSubmitted && chkB1D` | **1.d** = Ya |

  The captured draft had 1.d = Tidak, which is the whole explanation for L-2 C.
  `GATING.md`'s guess for L-5 B was right.

The general form of this instruction still holds, and is worth stating more
strongly: **"no entry path" has meant "gate not answered" every single time it has
been investigated.** Do not assume every lampiran a hint routes to is fillable in
the state we captured, and do not conclude a feature is absent from it.

Also resolved while checking the above: the **Bukti Zakat** attachment question in
section J is gated on L-5 B containing a Zakat or ReligiousDonation code, or L-5 C
containing a Zakat code, *and* the L-5 tab being shown —
`(_ > -1 || o > -1) && ShowPitrL5Form`, which then patches
`ProofZakatAttachmentAnswer`.

> **RESOLVED 2026-08-16, see `GATING.md`.** Both were state artifacts: a grid is
> editable only when the Induk question routing to it is answered Ya. L-5 B was
> dead because Induk 3 = Tidak, L-2 C because Induk 1.d = Tidak.
>
> **The editability table above is therefore a snapshot of one answer set, not a
> property of the form.** Two of its entries invert under a different Induk
> configuration: L-1 B loses `Tambah` when 14b = Tidak, and L-1 D gains it when
> 1.a = Ya. Read `GATING.md` before relying on any row of that table.

## Implementation implications

1. **Two entirely different UI kinds.** Induk needs the question/hint/routing
   model from `../spt-1770-induk/HINTS.md`. The lampiran need a reusable data
   grid with add/delete/import, per-column filter and sort, a totals footer, and
   pagination. Nothing in the current Badan implementation looks like this grid.
2. **`Impor data` is a real feature**, present on nearly every L-1 grid. Decide
   early whether we mirror it, since it implies a file format per table.
3. **Export buttons** (document / Excel / PDF) appear on every grid too.
4. **L-5 Section A's fixed matrix** should reuse whatever the Badan L7
   carryforward does rather than being built fresh.
5. **Lampiran 3B is referenced but not present** as a tab. Either it appears
   under a different condition, or it lives outside this returnsheet.

## Still to capture

Updated 2026-08-17. Most of the original list is done:

- ~~What the `Tambah` row editor looks like~~ — all 15 captured, `modals/` and
  `MODAL-FIELDS.md`
- ~~The `KODE` and `Pilih DESKRIPSI` reference lists~~ — all 29 dropdowns,
  20 distinct lists, `REFERENCE-LISTS.txt`
- ~~Whether L-2 Section A's missing Hapus/Impor is a pattern~~ — it is real;
  L-2 A has only `Tambah`, confirmed in `fullpage-l2-maximal.jpg`

Genuinely outstanding (revised 2026-08-17):

- ~~**Lampiran 3B**, referenced by L-3A-4 Section A but with no tab in any
  answer state~~ — **resolved.** Gated on Induk `1.b.2`, which had never been
  answered. Fully captured, see `L3B.md`.
- ~~`14e` / `14f` ... likely gated on Metode Pembukuan~~ — **[bundle-confirmed]
  2026-08-19, both gates now identified.** Metode Pembukuan really does not gate
  them, as measured. The actual gates: `14e` is enabled when **1.b.3 = Tidak**
  (menyelenggarakan pembukuan) and `14f` when **1.b.1 = Ya**. They gate lampiran
  **L-3C** and **L-3D**, two whole lampiran this corpus never saw. See
  `../spt-1770-induk/HEADER-FIELDS.md` and `docs/bundle-diff-1770.md` B9.
- ~~Behaviour beyond the insert path: editing, `Hapus` on a populated row~~ —
  **done.** Edit, single delete and `Hapus Semua` all captured with their API
  calls, see `GRID-ROW-ACTIONS.md`.
- The `Impor data` dropdown contents and its downloadable template format
  (deliberately skipped, it needs a file download) — **still outstanding**
- Cross-field validation beyond the one grid covered in `BEHAVIOR.md` —
  **still outstanding**
