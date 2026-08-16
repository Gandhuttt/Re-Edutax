# Induk, complete hint matrix

Captured 2026-08-15. All 23 Ya/Tidak rows were exercised in both directions
where the control allowed it.

## Coverage

| Rows | Count | Status |
|------|-------|--------|
| Both answers captured | 15 | complete |
| Disabled, no answer selectable | 8 | 11b, 14e, 14f, J.a, J.b, J.c and their hints are system-set |

## Full matrix

| Row | Answer | Hint text |
|-----|--------|-----------|
| 1.a | Ya | Ya, silahkan mengisi lampiran I Bagian D |
| 1.a | Tidak | Tidak, silahkan lanjut pertanyaan berikutnya |
| 1.b.1 | Ya | Ya, lanjutkan ke pertanyaan selanjutnya |
| 1.b.1 | Tidak | Tidak, lanjutkan ke pertanyaan 1c |
| 1.c | Ya | **Ya, silahkan mengisi lampiran 3A-4 Bagian B** |
| 1.c | Tidak | Tidak, lanjutkan ke pertanyaan 1d |
| 1.d | Ya | Ya, silahkan mengisi lampiran 2 Bagian C |
| 1.d | Tidak | Tidak, silahkan lanjut pertanyaan berikutnya |
| 3 | Ya | Ya, silahkan mengisi lampiran 5 Bagian A dan/atau B |
| 3 | Tidak | Tidak, silahkan lanjut pertanyaan berikutnya |
| 8 | Ya | Ya, silahkan mengisi lampiran 5 Bagian C |
| 8 | Tidak | Tidak, silahkan lanjut pertanyaan berikutnya |
| 10a | Ya | Ya, silahkan mengisi lampiran 1 Bagian E |
| 10a | Tidak | Tidak, lanjutkan ke pertanyaan berikutnya |
| 10d | Ya | Ya, lengkapi bagian ini dengan jumlah pengembalian/pengurangan yang Anda terima |
| 10d | Tidak | Tidak, lanjutkan ke pertanyaan berikutnya |
| 11b | disabled | Tidak. Saya tidak memilikinya |
| 13a | Ya | **Ya, Angsuran PPh Pasal 25 adalah 1/12 x ((9) – (10)(a))** |
| 13a | Tidak | Tidak, silahkan lanjut pertanyaan berikutnya |
| 13b | Ya | **Ya, silahkan mengisi Lampiran 4 Bagian A** |
| 13b | Tidak | Tidak, silahkan lanjut pertanyaan berikutnya |
| 13c | Ya | **Ya, angsuran PPh Pasal 25 saya adalah 0.75% dari penghasilan bruto setiap bulan dari masing-masing tempat usaha.** |
| 13c | Tidak | Tidak, tidak ada kewajiban untuk membayar angsuran pajak penghasilan Pasal 25 |
| 14b | Ya | Ya, silakan mengisi lampiran 1 Bagian B |
| 14b | Tidak | Tidak, lanjutkan ke pertanyaan berikutnya |
| 14c | Ya | Ya, silakan mengisi lampiran 2 Bagian A |
| 14c | Tidak | Tidak, lanjutkan ke pertanyaan berikutnya |
| 14d | Ya | Ya, silahkan mengisi lampiran 2 Bagian B |
| 14d | Tidak | Tidak, lanjutkan ke pertanyaan berikutnya |
| 14e | disabled | Tidak, lanjutkan ke pertanyaan berikutnya |
| 14f | disabled | Tidak, lanjutkan ke pertanyaan berikutnya |
| 14g | Ya | **Pastikan Anda sudah menyampaikan laporan realisasi investasi secara terpisah.** |
| 14g | Tidak | Tidak, lanjutkan ke pertanyaan berikutnya |
| J.a | disabled | Tidak, jenis pembukuan adalah Pembukuan Sederhana. |
| J.b | disabled | Tidak ada berkas yang perlu dilampirkan |
| J.c | disabled | Tidak ada berkas yang perlu dilampirkan |
| J.d | Ya | (no chip, reveals file upload control) |
| J.d | Tidak | (no chip) |
| J.e | Ya | (no chip, reveals file upload control) |
| J.e | Tidak | (no chip) |

## Lampiran referenced

| Lampiran | Referenced by | Bagian |
|----------|---------------|--------|
| 1 (as "I") | 1.a | D |
| 1 | 10a | E |
| 1 | 14b | B |
| 1 | 14a (label text) | A |
| 2 | 1.d | C |
| 2 | 14c | A |
| 2 | 14d | B |
| 3A-4 | 1.c | B |
| 4 | 13b | A |
| 5 | 3 | A dan/atau B |
| 5 | 8 | C |

So the form references lampiran **1, 2, 3A-4, 4 and 5**. Nothing observed
references a plain "lampiran 3".

**Lampiran naming is inconsistent in the source text**: "lampiran I Bagian D"
(roman numeral), "lampiran 1 Bagian E" (arabic), "Lampiran 4 Bagian A"
(capitalised), "lampiran 3A-4 Bagian B" (compound). Transcribe verbatim rather
than normalising, then decide separately what our own labels say.

Spelling is also inconsistent: **silahkan** (1.a, 1.d, 3, 8, 13b, 14d) vs
**silakan** (14b, 14c). Both appear in DJP's own copy.

## Hint categories, final list

Nine distinct kinds, up from the six in the first pass.

| Category | Example |
|----------|---------|
| Route to lampiran | Ya, silahkan mengisi lampiran 2 Bagian C |
| Route to multiple lampiran | Ya, silahkan mengisi lampiran 5 Bagian A dan/atau B |
| Advance | Tidak, silahkan lanjut pertanyaan berikutnya |
| Skip to a named row | Tidak, lanjutkan ke pertanyaan 1c |
| Fill this row | Ya, lengkapi bagian ini dengan jumlah pengembalian/pengurangan yang Anda terima |
| **Formula statement** | Ya, Angsuran PPh Pasal 25 adalah 1/12 x ((9) – (10)(a)) |
| **Rate statement** | Ya, angsuran PPh Pasal 25 saya adalah 0.75% dari penghasilan bruto setiap bulan dari masing-masing tempat usaha. |
| **Compliance reminder** | Pastikan Anda sudah menyampaikan laporan realisasi investasi secara terpisah. |
| Terminal statement | Tidak. Saya tidak memilikinya |
| Attachment status | Tidak ada berkas yang perlu dilampirkan |

The formula and rate statements matter most: they are not navigation at all,
they declare **how a value is computed**. 13a's hint is the actual Pasal 25
formula and 13c's is the OPPT rate. Those belong in our calculation layer, not
just as display strings.

## Structural behaviours discovered in this pass

### Mutual exclusivity between rows

Setting 13a = Ya **cleared 13b's answer** back to unanswered. 13a, 13b and 13c
are alternative Pasal 25 regimes, so answering one voids another. This is not
expressible as independent per-row booleans.

### Answers collapse whole rows

Setting 1.b.1 = Tidak **removed rows 1.b.2, 1.b.3 and 1.b.5 from the DOM**.
They are not disabled, they are gone. This is why the numbering appeared to skip
1.b.4 in the first pass; the sub-rows under 1.b are a conditional block.

### Section B writes back into HEADER

Setting 1.a = Tidak (with 1.b.1 already Tidak) **cleared the header's Sumber
Penghasilan field and raised "Kolom ini wajib diisi!" on it**. With neither
pekerjaan nor usaha income declared, the previously selected `Pekerjaan` source
became invalid and was removed.

So the coupling is bidirectional: the header constrains section B, and section B
can invalidate the header. Any implementation that treats the header as
"settings entered once up front" will get this wrong.

### Ya answers materialise lampiran tabs, irreversibly

Tab bar went from `Induk | L-1` to `Induk | L-1 | L-2 | L-5` over this session.
Reverting the answer does not remove the tab. L-4 never appeared despite 13b = Ya
being set at one point, because 13a = Ya subsequently cleared 13b, which suggests
materialisation happens on save of a sustained Ya rather than on every click.

### File upload is a distinct control kind

J.d and J.e = Ya reveal a `Choose / Upload / Cancel` file control with a file
list area. This is a sixth control kind, missing from the first `STATES.md`
inventory.
