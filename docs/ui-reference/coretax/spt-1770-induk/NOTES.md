# SPT Tahunan PPh Wajib Pajak Orang Pribadi, Induk

- Source: `coretaxdjp.pajak.go.id/returnsheets-portal/id-ID/personal-income-tax-return/...`
- Captured: 2026-08-15
- Tahun pajak: 2025
- Captured state: Status `Pembetulan`, Metode `Pencatatan`, Sumber Penghasilan
  `Pekerjaan`, Status SPT `Nihil`, posting never performed

This file covers Induk only.

> The original text said "the returnsheet has two tabs, `Induk` and `L-1`".
> That is a property of the captured answer set, not the form: the tab bar can
> show up to **seven** (`Induk | L-1 | L-2 | L-3A-1 | L-3A-4 | L-3B | L-5`)
> depending on the Induk answers. See `../spt-1770-lampiran/GATING.md`.
>
> (This line previously said "up to five", listing `Induk | L-1 | L-2 | L-3A-4 |
> L-5`. Corrected 2026-08-17: that was the maximum reachable *without ever
> answering the `1.b` family*, which adds L-3A-1/2/3 and L-3B.)

## Screenshots

Sections A to K were originally captured as seven viewport slices (`01`–`07`).
**Those were deleted 2026-08-17**, superseded by the two full-page captures,
which show the whole form in one image and in both answer states:

| File | Covers |
|------|--------|
| `fullpage-induk-minimal.jpg` | whole Induk, baseline answers (tabs: Induk, L-1, L-5) |
| `fullpage-induk-maximal.jpg` | whole Induk, all *then-known* gating questions Ya (five tabs; the `1.b` family was not yet exercised, so this is not the true maximum) |

The state-specific captures below are **not** superseded; each records a
toggle or combobox that a full-page shot cannot show.

| # | File | Covers |
|---|------|--------|
| 08 | `08-hint-counterparts-1d-3-8-set-to-ya.jpg` | 1.d, 3 and 8 flipped to Ya, showing the opposite hint chips |
| 09 | `09-10d-ya-enables-amount-input.jpg` | 10d = Ya enables the row's amount input |
| 10 | `10-10a-tidak-removes-amount-input.jpg` | 10a = Tidak removes the row's amount input entirely |

## Section map

| Letter | Title | Shape |
|--------|-------|-------|
| (header) | HEADER | Tahun Pajak, Status, Metode Pembukuan/Pencatatan, Periode Pembukuan, Sumber Penghasilan, `Posting SPT` |
| A | Identitas Wajib Pajak | 8 fields, mostly prefilled read-only |
| B | Ikhtisar Penghasilan Neto | branching Ya/Tidak, rows 1a to 1d |
| C | Penghitungan Pajak Terutang | rows 2 to 9, computed chain |
| D | Kredit Pajak | rows 10a to 10d |
| E | PPh Kurang/Lebih Bayar | rows 11a to 11c |
| F | Pembetulan | rows 12a, 12b, only when Status is Pembetulan |
| G | Permohonan Pengembalian PPh Lebih Bayar | only when Status is Lebih Bayar |
| H | Angsuran PPh Pasal 25 Tahun Pajak Berikutnya | rows 13a to 13c |
| I | Pernyataan Transaksi Lainnya | rows 14a to 14h |
| J | Lampiran Tambahan | items a to e |
| K | Pernyataan | declaration checkbox, penandatangan, tanda tangan |

## Fields

### HEADER

| Label | Type | Notes |
|-------|------|-------|
| Tahun Pajak/Bagian Tahun Pajak | number | `2025` in capture, appears read-only |
| Status | combobox | `Pembetulan` observed. Drives whether F and G apply |
| Metode Pembukuan/Pencatatan | combobox, clearable | `Pencatatan` observed. Drives J.a hint |
| Periode Pembukuan | two text inputs | bulan awal `1`, bulan akhir `12` |
| Sumber Penghasilan | combobox, required | `Pekerjaan` observed |
| `Posting SPT` | button | pulls in Harta, Utang, Daftar Anggota Keluarga, Bukti Potong, Pembayaran. Helper text states whether posting has been done |

The accessibility tree also exposed a `Prefill Returnsheet` button not visible in
the rendered header. Unresolved whether it is a second control or a
state-dependent label for the same one.

### A. Identitas Wajib Pajak

| # | Label | Type | Required |
|---|-------|------|----------|
| 1 | NIK/NPWP | text | yes |
| 2 | Nama | text | yes |
| 3 | Jenis ID | text | yes, `KTP` observed |
| 4 | No. ID | text | yes, same value as NIK/NPWP |
| 5 | No. Telepon | text | yes |
| 6 | Email | text | yes |
| 7 | Status Kewajiban Perpajakan Suami dan Istri | combobox, clearable | only if status is PH/MT |
| 8 | NIK/NPWP Suami/Istri | text | conditional on 7 |

Rows 1 to 6 render with a grey background, consistent with prefilled and
read-only. Row 8 is white, so presumably enabled once 7 is set.

### B. Ikhtisar Penghasilan Neto

| # | Question | Control |
|---|----------|---------|
| 1.a | Menerima penghasilan dalam negeri dari pekerjaan? | Ya/Tidak |
| 1.b.1 | Menerima penghasilan dalam negeri dari usaha dan/atau pekerjaan bebas? | Ya/Tidak |
| 1.b.2 | Termasuk WP OP yang memiliki peredaran bruto tertentu atau OPPT? | combobox |
| 1.b.3 | Menggunakan Norma dalam menghitung penghasilan neto? | combobox |
| 1.b.5 | Penghasilan neto dari usaha dan/atau pekerjaan bebas | amount, computed |
| 1.c | Menerima penghasilan dalam negeri lainnya? | Ya/Tidak |
| 1.d | Menerima penghasilan luar negeri? | Ya/Tidak |

Numbering skips `1.b.4`. Either it is hidden in this state or the numbering has
a genuine gap. Worth confirming before mirroring it.

Note 1.b.2 and 1.b.3 are comboboxes, not Ya/Tidak radios, despite reading as
yes/no questions.

### C. Penghitungan Pajak Terutang

| # | Label | Type |
|---|-------|------|
| 2 | Penghasilan neto setahun (1a+1b+1c+1d) | computed |
| 3 | Apakah terdapat pengurang penghasilan neto (kompensasi kerugian, zakat/sumbangan keagamaan) selain yang telah diperhitungkan dalam Formulir BPA1 dan/atau BPA2? | Ya/Tidak |
| 4 | Penghasilan neto setelah pengurang penghasilan neto (2-3) | computed |
| 5 | Penghasilan Tidak Kena Pajak | combobox (PTKP status) + amount |
| 6 | Penghasilan Kena Pajak (4-5) | computed |
| 7 | PPh Terutang | computed |
| 8 | Apakah terdapat pengurang PPh Terutang? | Ya/Tidak |
| 9 | PPh Terutang setelah pengurang PPh Terutang (7-8) | computed |

### D. Kredit Pajak

| # | Label | Type |
|---|-------|------|
| 10a | Apakah terdapat PPh yang telah dipotong/dipungut oleh pihak lain? | Ya/Tidak + amount |
| 10b | Angsuran PPh Pasal 25 | amount |
| 10c | STP PPh Pasal 25 (Hanya pokok pajak) | amount, editable |
| 10d | Apakah menerima pengembalian/pengurangan kredit PPh luar negeri yang telah dikreditkan? | Ya/Tidak |

### E. PPh Kurang/Lebih Bayar

| # | Label | Type |
|---|-------|------|
| 11a | PPh kurang/lebih bayar (9-10a-10b-10c+10d) | computed |
| 11b | Apakah terdapat Surat Keputusan Persetujuan Pengangsuran atau Penundaan Pembayaran Pajak? | Ya/Tidak |
| 11c | PPh yang masih harus dibayar (11a-11b) | computed |

### F. Pembetulan (only when Status SPT is Pembetulan)

| # | Label | Type |
|---|-------|------|
| 12a | PPh kurang/lebih bayar pada SPT yang dibetulkan | amount + `Ganti SPT sebelumnya` checkbox |
| 12b | PPh kurang/lebih bayar karena pembetulan (11a-12a) | computed |

### G. Permohonan Pengembalian PPh Lebih Bayar (only when Status SPT is Lebih Bayar)

`PPh lebih bayar pada 11a atau 12b mohon:` combobox, plus Pilih Rekening Bank
(picker button), Nomor Rekening, Nama Bank, Nama Pemilik Rekening.

### H. Angsuran PPh Pasal 25 Tahun Pajak Berikutnya

| # | Question |
|---|----------|
| 13a | Hanya menerima penghasilan teratur dan berkewajiban membayar angsuran PPh Pasal 25 tahun berikutnya? |
| 13b | Menyusun perhitungan tersendiri angsuran PPh Pasal 25 tahun berikutnya? |
| 13c | Membayar angsuran PPh Pasal 25 OPPT tahun berikutnya? |

### I. Pernyataan Transaksi Lainnya

| # | Label |
|---|-------|
| 14a | Harta pada akhir Tahun Pajak (isi Lampiran 1 Bagian A, lalu ke pertanyaan selanjutnya) |
| 14b | Memiliki utang pada akhir tahun pajak? |
| 14c | Menerima penghasilan yang dikenakan pajak penghasilan bersifat final? |
| 14d | Menerima penghasilan yang tidak termasuk objek pajak? |
| 14e | Melaporkan biaya penyusutan dan/atau amortisasi fiskal? |
| 14f | Melaporkan biaya entertainment, promosi, penggantian atau imbalan dalam bentuk natura dan/atau kenikmatan, serta piutang yang nyata-nyata tidak dapat ditagih? |
| 14g | Menerima dividen dan/atau penghasilan lain dari luar negeri dan melaporkannya sebagai penghasilan tidak termasuk objek pajak? |
| 14h | Kelebihan PPh Final atas penghasilan dari usaha dengan peredaran bruto tertentu yang dapat diminta pengembalian |

14e and 14f render greyed out in the captured state, so some of these are gated
on earlier answers, probably the Pembukuan vs Pencatatan choice.

### J. Lampiran Tambahan

Items a to e, each `1. Ya` / `2. Tidak`:

| Item | Label | Hint in captured state |
|------|-------|------------------------|
| a | Laporan Keuangan/Laporan Keuangan yang telah diaudit | "Tidak, jenis pembukuan adalah Pembukuan Sederhana." |
| b | Bukti pembayaran zakat/sumbangan keagamaan | "Tidak ada berkas yang perlu dilampirkan" |
| c | Bukti pemotongan/pemungutan sehubungan dengan kredit pajak luar negeri | "Tidak ada berkas yang perlu dilampirkan" |
| d | Surat kuasa khusus | (none) |
| e | Dokumen lainnya | (none) |

Items a to c are greyed out and system-driven from earlier answers. Only d and e
are freely selectable.

## Conditional behaviour

This is the main reason to model on Coretax rather than the PDF form.

**Every Ya/Tidak question renders an inline hint chip to its right that tells the
user what happens next.** The hint text changes with the answer. Observed forms:

- Routing to a lampiran: "Ya, silahkan mengisi lampiran I Bagian D" (1a),
  "Ya, silahkan mengisi lampiran 1 Bagian E" (10a)
- Advance: "Ya, lanjutkan ke pertanyaan selanjutnya" (1.b.1),
  "Tidak, silahkan lanjut pertanyaan berikutnya" (1d, 3, 8, 13a, 13b)
- Skip ahead to a specific row: "Tidak, lanjutkan ke pertanyaan 1d" (1c)
- Terminal statements: "Tidak. Saya tidak memilikinya" (11b),
  "Tidak, tidak ada kewajiban untuk membayar angsuran pajak penghasilan Pasal 25" (13c)
- Attachment status: "Tidak ada berkas yang perlu dilampirkan" (J.b, J.c)

So the hint is not a static helper, it is a per-answer routing message. Any
faithful reimplementation needs the hint string as part of the answer option
data, not as a field-level label.

**Greying out is used heavily** for both system-computed values (C, E rows) and
for questions gated on earlier answers (14e, 14f, J.a to J.c). Grey means
disabled, not merely read-only styling.

### Verified by flipping answers (2026-08-15)

Answers were flipped on the live draft, observed, then restored to baseline.

| Row | Answer | Hint |
|-----|--------|------|
| 1.c | Tidak | "Tidak, lanjutkan ke pertanyaan 1d" |
| 1.d | Tidak | "Tidak, silahkan lanjut pertanyaan berikutnya" |
| 1.d | **Ya** | "Ya, silahkan mengisi lampiran 2 Bagian C" |
| 3 | Tidak | "Tidak, silahkan lanjut pertanyaan berikutnya" |
| 3 | **Ya** | "Ya, silahkan mengisi lampiran 5 Bagian A dan/atau B" |
| 8 | Tidak | "Tidak, silahkan lanjut pertanyaan berikutnya" |
| 8 | **Ya** | "Ya, silahkan mengisi lampiran 5 Bagian C" |
| 10a | Ya | "Ya, silahkan mengisi lampiran 1 Bagian E" |
| 10a | **Tidak** | "Tidak, lanjutkan ke pertanyaan berikutnya" |
| 10d | Tidak | "Tidak, lanjutkan ke pertanyaan berikutnya" |
| 10d | **Ya** | "Ya, lengkapi bagian ini dengan jumlah pengembalian/pengurangan yang Anda terima" |

So a single question can route to a different lampiran depending on which
question it is, and 3 can route to *two* lampiran sections at once
("A dan/atau B"). The hint is genuinely per question-and-answer, not derivable.

**Answers also control the row's own amount input**, a third behaviour beyond
routing and enabling other sections:

- 10d = Ya enables 10d's amount input (was disabled) and the hint changes to an
  instruction to fill it in, rather than a routing message.
- 10a = Tidak **removes** 10a's amount input from the DOM entirely, rather than
  disabling it. Compare 09 and 10.

So three distinct visual states exist for an amount cell: present and enabled,
present and disabled (grey), and absent. Our implementation needs all three.

**11b is disabled**, not merely unanswered. Neither Ya nor Tidak can be
selected in the captured state, yet it displays the hint "Tidak. Saya tidak
memilikinya". So a disabled question can still assert an answer in its hint.

### Answering Ya materialises lampiran tabs ~~and reverting does not remove them~~

> **CORRECTED 2026-08-17. The conclusion below was wrong; the test was
> confounded.** See `../spt-1770-lampiran/GATING.md`.

Original observation: before any edits the tab bar read `Induk | L-1`. After
setting row 3 to Ya (routing to "lampiran 5 Bagian A dan/atau B"), reverting it
to Tidak, and reloading, the tab bar still read `Induk | L-1 | L-5`. That was
read as creation being irreversible.

**It is not.** A lampiran tab is present exactly while **at least one** gate
routing to it is Ya, and removing the last one removes the tab. L-5 survived
reverting row 3 because **row 8 also routes to L-5** (Bagian C) and was Ya the
whole time.

Demonstrated 2026-08-17 on L-2, which has three gates (14c, 14d, 1.d):

| Flip | Tabs after |
|------|-----------|
| 14c to Tidak | Induk, L-1, **L-2**, L-3A-4, L-5 |
| 14d to Tidak | Induk, L-1, **L-2**, L-3A-4, L-5 |
| 1.d to Tidak, the last gate | Induk, L-1, L-3A-4, L-5 — **L-2 gone** |

So the tab tracks the OR of its gates, live, with no reload.

Implication for our implementation, revised: lampiran presence is **derived
state**, not a one-way side effect, so it needs no special lifecycle handling.
Compute it from the answer set. The real hazard is different, and worse: turning
the last gate off **deletes that lampiran's rows server-side** (a
`delete-tax-object` POST), so a peserta can destroy entered data by flipping an
answer. That is what deserves a deliberate decision, see `BEHAVIOR.md`.

### Autosave

Every answer change fires a `Success / Successfully saved the Personal Income
Tax Returnsheet!` toast. The returnsheet **autosaves on change**, so
`Simpan Konsep` is not what persists edits. Relevant both for capture safety
and because our own form does not currently autosave.

## Section K and submission

- A `Status SPT : Nihil` chip is displayed, computed from the figures above
  (Nihil / Kurang Bayar / Lebih Bayar), and it drives whether F and G apply.
- Declaration checkbox with the standard "Dengan menyadari sepenuhnya akan
  segala akibatnya..." statement.
- Penandatangan radio: `Wajib Pajak` / `Kuasa Wajib Pajak`.
- NPWP and Nama Lengkap, prefilled read-only. Tanda Tangan field.
- Actions: `Simpan Konsep` and `Bayar dan Lapor`. Plus a `Pergi ke pencarian`
  link.

## Implementation notes

- Radio values come through the accessibility tree as `1` and `0`, so Ya/Tidak
  is boolean-encoded. 1.b.2 and 1.b.3 being comboboxes breaks that pattern.
- Section F maps onto the existing pembetulan mechanic on the Badan side, but
  here it is a section of the Induk rather than a separate flow.
- The `Posting SPT` prefill step has no equivalent in our app yet. It populates
  Harta, Utang, Daftar Anggota Keluarga, Bukti Potong and Pembayaran from DJP
  records, which for a training app would be seeded rather than fetched.

## Still to capture

Updated 2026-08-17.

- ~~The `L-1` tab~~ — done, plus L-2, L-3A-4 and L-5, see `../spt-1770-lampiran/`
- ~~Answer-flipped variants for section I (14b to 14g)~~ — done via the maximal
  state, see `../spt-1770-lampiran/GATING.md`
- ~~Validation errors~~ — done on a lampiran grid, see
  `../spt-1770-lampiran/BEHAVIOR.md`. Induk-level validation is still untested

Genuinely outstanding:

- States that only appear under Status `Normal` and `Lebih Bayar` (section G is
  never active in a Nihil Pembetulan, and `Pilih Rekening Bank` cannot be opened)
- The 1.b.2 (OPPT) and 1.b.3 (Norma) combobox option lists, still unopened
- Section H rows 13a/13b flipped to Ya, and whether they are mutually exclusive
  with 13c
