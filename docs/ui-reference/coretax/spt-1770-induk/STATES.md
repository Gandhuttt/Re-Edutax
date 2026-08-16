# Induk, enumerated UI states

Companion to `NOTES.md`. Captured 2026-08-15 from Coretax.

Induk contains 23 Ya/Tidak questions plus comboboxes, so the literal set of
combinations is not enumerable and not useful. What follows is the set of
*dimensions*, and for each control the set of states it can occupy.

Marked **[O]** observed directly, **[I]** inferred from labels or layout and not
yet verified.

---

## 1. Document-level state

These sit above the fields and change which sections exist at all.

### 1.1 Status SPT (header combobox)

| State | Effect |
|-------|--------|
| Normal **[I]** | Section F hidden or inert |
| Pembetulan **[O]** | Section F active, header labels it "DIISI JIKA STATUS SPT ADALAH PEMBETULAN" |

Unverified whether Coretax models "Pembetulan ke-1, ke-2, ..." as separate
values.

### 1.2 Computed status (shown as a chip in section K)

| State | Effect |
|-------|--------|
| Nihil **[O]** | G inert |
| Kurang Bayar **[I]** | E.11c meaningful, payment path |
| Lebih Bayar **[I]** | Section G active (bank account fields) |

Derived from the figures, not user-set. Drives section G's applicability.

### 1.3 Metode Pembukuan/Pencatatan (header combobox)

| State | Effect |
|-------|--------|
| Pencatatan **[O]** | J.a shows "Tidak, jenis pembukuan adalah Pembukuan Sederhana." and is disabled |
| Pembukuan **[I]** | J.a presumably becomes selectable; likely also ungates 14e/14f |

### 1.4 Sumber Penghasilan (header combobox, required)

`Pekerjaan` **[O]**. Full option list not captured. Likely gates section B's
1.a vs 1.b branch.

### 1.5 Posting status

| State | Effect |
|-------|--------|
| Not yet posted **[O]** | Helper text reads "Posting belum pernah dilakukan" |
| Posted **[I]** | Harta, Utang, Daftar Anggota Keluarga, Bukti Potong, Pembayaran populated |

### 1.6 Status Kewajiban Perpajakan Suami dan Istri (A.7)

| State | Effect |
|-------|--------|
| Unset **[O]** | A.8 NIK/NPWP Suami/Istri appears inactive |
| PH or MT **[I]** | A.8 enabled |

---

## 2. Control-level state sets

Every control in Induk is one of five kinds. These are the exhaustive state sets
per kind.

### 2.1 Ya/Tidak radio pair

| State | Notes |
|-------|-------|
| Unanswered | Neither selected. Observed on 11b |
| Ya | |
| Tidak | |
| Disabled, no answer asserted **[O]** | 14e, 14f render greyed with neither selected |
| Disabled, answer asserted via hint **[O]** | 11b: not selectable, yet displays "Tidak. Saya tidak memilikinya" |

The last state is the awkward one: the control is disabled and empty, but the
form asserts an answer through the hint chip rather than the radio.

### 2.2 Hint chip

Always paired with a question. Six observed categories:

| Category | Example | Observed on |
|----------|---------|-------------|
| Route to lampiran | "Ya, silahkan mengisi lampiran 2 Bagian C" | 1.a, 1.d, 3, 8, 10a |
| Route to multiple lampiran | "Ya, silahkan mengisi lampiran 5 Bagian A dan/atau B" | 3 |
| Advance | "Tidak, silahkan lanjut pertanyaan berikutnya" | 1.d, 3, 8, 10d, 13a, 13b |
| Skip to a named row | "Tidak, lanjutkan ke pertanyaan 1d" | 1.c |
| Fill this row | "Ya, lengkapi bagian ini dengan jumlah pengembalian/pengurangan yang Anda terima" | 10d |
| Terminal statement | "Tidak. Saya tidak memilikinya" / "Tidak, tidak ada kewajiban untuk membayar angsuran pajak penghasilan Pasal 25" | 11b, 13c |
| Attachment status | "Tidak ada berkas yang perlu dilampirkan" | J.b, J.c |
| None | no chip rendered | 1.b.2, 1.b.3, J.d, J.e |

Chip text is a function of (row, answer). It is not derivable from the answer
alone, so it must be stored per option.

### 2.3 Amount cell

| State | Notes |
|-------|-------|
| Absent **[O]** | 10a = Tidak removes the input from the DOM |
| Present, disabled **[O]** | grey, e.g. 10d while 10d = Tidak |
| Present, enabled **[O]** | white, e.g. 10c, and 10d once 10d = Ya |
| Present, computed **[O]** | grey, value derived, e.g. rows 2, 4, 6, 7, 9, 11a, 11c, 12b |

Disabled and computed look identical on screen but differ in meaning. Distinguish
them in the model.

### 2.4 Combobox

| State |
|-------|
| Unselected, placeholder "Silakan Pilih" **[O]** |
| Selected **[O]** |
| Selected with clear affordance (× button) **[O]** on header Metode and A.7 |
| Disabled **[I]** |

Option lists are in `OPTIONS.md`. Still missing: Status (read-only on an
existing draft) and G's "mohon" combobox (inert while Nihil).

**Sumber Penghasilan is a multi-select**, so it is a set rather than a single
value, and does not fit this state table. Add a sixth control kind if we mirror
it faithfully.

### 2.5 Checkbox

| Control | States |
|---------|--------|
| 12a "Ganti SPT sebelumnya" | unchecked **[O]**, checked **[I]** |
| K declaration | unchecked **[O]**, checked **[I]** |

---

## 3. Section-level presence

| Section | Always present | Gated on |
|---------|----------------|----------|
| HEADER | yes | |
| A. Identitas | yes | |
| B. Ikhtisar Penghasilan Neto | yes | |
| C. Penghitungan Pajak Terutang | yes | |
| D. Kredit Pajak | yes | |
| E. PPh Kurang/Lebih Bayar | yes | |
| F. Pembetulan | no | Status SPT = Pembetulan |
| G. Permohonan Pengembalian | no | computed status = Lebih Bayar |
| H. Angsuran PPh Pasal 25 | yes | |
| I. Pernyataan Transaksi Lainnya | yes | |
| J. Lampiran Tambahan | yes | |
| K. Pernyataan | yes | |

F and G render with their gating stated in the section title itself, so they are
present-but-inert rather than hidden. **[O]** for F, **[I]** for G.

---

## 4. Page-level transient states

| State | Trigger | Notes |
|-------|---------|-------|
| Save toast **[O]** | any answer change | "Success / Successfully saved the Personal Income Tax Returnsheet!". The form autosaves |
| Validation error **[I]** | not triggered in this pass | Required fields are marked `*`, so errors must exist |
| Announcement overlay **[O]** | on pajak.go.id, not on the returnsheet | |

---

## 5. Per-row state inventory

Radio rows, with their captured answer as of the baseline.

| Row | Question topic | Baseline | Ya hint captured | Tidak hint captured |
|-----|----------------|----------|------------------|---------------------|
| 1.a | penghasilan dari pekerjaan | Ya | yes | no |
| 1.b.1 | penghasilan dari usaha/pekerjaan bebas | Ya | yes | no |
| 1.c | penghasilan dalam negeri lainnya | Tidak | no | yes |
| 1.d | penghasilan luar negeri | Tidak | yes | yes |
| 3 | pengurang penghasilan neto | Tidak | yes | yes |
| 8 | pengurang PPh terutang | Tidak | yes | yes |
| 10a | PPh dipotong/dipungut pihak lain | Ya | yes | yes |
| 10d | pengembalian/pengurangan kredit PPh LN | Tidak | yes | yes |
| 11b | SK persetujuan pengangsuran/penundaan | disabled | no | n/a |
| 13a | penghasilan teratur, wajib angsuran 25 | Tidak | no | yes |
| 13b | perhitungan tersendiri angsuran 25 | Tidak | no | yes |
| 13c | angsuran 25 OPPT | Tidak | no | yes |
| 14b | utang akhir tahun | Tidak | no | yes |
| 14c | penghasilan final | Tidak | no | yes |
| 14d | bukan objek pajak | Tidak | no | yes |
| 14e | penyusutan/amortisasi fiskal | disabled | no | no |
| 14f | entertainment/promosi/natura/piutang | disabled | no | no |
| 14g | dividen luar negeri | Tidak | no | yes |
| J.a | laporan keuangan | disabled | no | no |
| J.b | bukti zakat | disabled | no | no |
| J.c | bukti potong kredit pajak LN | disabled | no | no |
| J.d | surat kuasa khusus | Tidak | no | yes |
| J.e | dokumen lainnya | Tidak | no | yes |

Coverage: 11 of 23 rows have at least one hint captured; 5 of 23 have both.

Non-radio controls: 1.b.2, 1.b.3, 5 (PTKP), G "mohon", header Status / Metode /
Sumber Penghasilan are comboboxes whose option lists are entirely uncaptured.

---

## 6. What would complete the picture

Ordered by how much each unblocks implementation.

1. ~~Combobox option lists~~ done 2026-08-15, see `OPTIONS.md`. 5 of 7 captured;
   Status is read-only on an existing draft and G's is inert while Nihil.
2. ~~Validation errors~~ done, "Kolom ini wajib diisi!" observed on 1.b.2 and
   1.b.3, capture 16.
3. ~~Remaining hint chips~~ done 2026-08-15, all 23 rows swept, see `HINTS.md`.
4. A `Normal` status draft, to see F inert and confirm 1.1.
5. A `Lebih Bayar` draft, the only way to see section G active and its combobox.
6. A `Pembukuan` draft, to confirm it ungates J.a, 14e and 14f.
7. Whether a materialised lampiran tab can be removed once created.
8. The L-1, L-2 and L-5 tabs themselves, none of which have been opened.

Note the control-kind inventory in section 2 is **incomplete**: the full sweep
found a **file upload** control (J.d/J.e = Ya) not listed there, and Sumber
Penghasilan is a multi-select. See `HINTS.md` for both.
