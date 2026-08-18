# Induk, combobox option lists

Captured 2026-08-15. Screenshots 11 to 17 in this directory.

The underlying component library is PrimeNG/PrimeReact (`.p-dropdown-item`,
`.p-multiselect-item`, `role="option"`), which is why the option lists are DOM
nodes rather than native `<select>` options.

---

## HEADER, Status

**Not observed.** The control does not open on an existing draft, so it is
read-only once a returnsheet exists.

> **[bundle-explained]** 2026-08-19, partially. The bundle compares
> `returnSheetModel` against the literal string `"NORMAL"`, and gates row 12a /
> section F on `"NORMAL" !== returnSheetModel`, so a Normal/amendment distinction
> is confirmed to exist and to drive the amendment rows. The amendment code's own
> literal lives in a shared enum outside the fetched chunk and is still
> unconfirmed — do not assume the string `"PEMBETULAN"`.

## HEADER, Metode Pembukuan/Pencatatan

Single select, clearable.

| Option |
|--------|
| Pembukuan stelsel akrual |
| Pembukuan stelsel kas |
| Pencatatan |

Note there are three values, not the two the label implies. "Pembukuan" splits
into akrual and kas.

## HEADER, Sumber Penghasilan

**Multi-select, not single select.** Renders checkboxes and a search box.

| Option |
|--------|
| Kegiatan Usaha |
| Pekerjaan |
| Pekerjaan Bebas |

A taxpayer can have more than one source at once, so this must be a set in our
schema, not an enum column. Captured draft has only `Pekerjaan` checked.

## A.7, Status Kewajiban Perpajakan Suami dan Istri

Single select, clearable, with a search box.

| Option |
|--------|
| Pisah Harta (PH) |
| Memilih Terpisah (MT) |

Matches the label's "Isi jika status adalah PH/MT". Two options only, so the
unset state carries the meaning "neither".

## 1.b.2, OPPT

Single select. **The option labels are full routing sentences, not values.**

| Option |
|--------|
| Tidak, lanjutkan ke pertanyaan selanjutnya |
| Ya, saya termasuk Wajib Pajak Orang Pribadi yang memiliki peredaran bruto tertentu yang dikenai pajak bersifat final. |
| Ya, saya termasuk orang pribadi pengusaha tertentu |

Note there are **two distinct Ya branches**, which is why this is a combobox
rather than a Ya/Tidak radio. PP 23 final-rate taxpayer and OPPT are different
regimes.

## 1.b.3, Norma

Single select, same pattern.

| Option |
|--------|
| Tidak, saya menyelenggarakan pembukuan. |
| Tidak, saya hanya menerima penghasilan dari usaha yang dikenakan pajak bersifat final dan tidak menyelenggarakan pembukuan. |
| Ya, saya berhak menggunakan Norma Penghitungan Penghasilan Neto. |

Again two Tidak branches with different meanings.

## 5, Penghasilan Tidak Kena Pajak (PTKP)

Single select, 13 options. The rendered dropdown is clipped and scrolls, so this
list was read from the DOM rather than a screenshot.

| Option |
|--------|
| K/0 |
| K/1 |
| K/2 |
| K/3 |
| K/I/0 |
| K/I/1 |
| K/I/2 |
| K/I/3 |
| TK/0 |
| TK/1 |
| TK/2 |
| TK/3 |
| -/- |

`-/-` is presumably "not applicable". DOM order is as listed, K before TK,
with `-/-` last, which is not alphabetical or logical order. If we mirror the
dropdown we should decide whether to keep DOM order or sort.

Amounts per status are not shown in the dropdown, only the codes.

> **The amounts are recorded elsewhere.** See `COMPUTATION.md` for the full
> PTKP table, all 13 statuses with their rupiah values, read by selecting each
> option and reading Induk row 5. Added 2026-08-17 because the sentence above,
> read alone, implies the amounts are unavailable, and that led to the tax
> engine being treated as uncapturable for a while.

## G, "PPh lebih bayar pada 11a atau 12b mohon:"

**Not captured.** Section G is inert unless the return is in a refund position.

> **Disambiguation, 2026-08-17.** "Status" is overloaded in these docs. The
> HEADER `Status` field on this draft is **`Pembetulan`** and is `p-disabled`.
> The word "Nihil" originally used here refers to the *computed outcome*
> (kurang/lebih bayar being nil), not to that field. Two different concepts.
>
> **Decision: do not capture section G.** It is being built from the existing
> SPT Badan implementation instead, which already has the equivalent
> (`f19aMetodePengembalian`, Induk F rows 19.a/19.b). See `HEADER-FIELDS.md`.

---

## Structural takeaway

Three of these comboboxes (1.b.2, 1.b.3, and the Ya/Tidak radios' hint chips)
express the same idea in two different widgets: **the answer text carries the
routing explanation**. For radios the sentence lives in a separate hint chip
beside the control; for comboboxes it is the option label itself.

So a single model can cover both: an option is `{ value, label, hint }`, and the
widget choice (radio pair vs dropdown) is a presentation detail driven by how
many branches exist. Two branches becomes a radio pair with a hint chip, three
or more becomes a dropdown with sentence labels.
