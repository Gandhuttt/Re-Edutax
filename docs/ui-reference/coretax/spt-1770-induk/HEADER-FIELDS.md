# Induk HEADER fields

Captured 2026-08-17 on the Pembetulan draft.

| Field | Editable | Notes |
|-------|----------|-------|
| `Tahun Pajak/Bagian Tahun Pajak` | no | `2025` |
| `Periode Pembukuan` | no | two boxes, `1` and `12` |
| `Status` | **no**, `p-disabled` | `Pembetulan` |
| `Metode Pembukuan/Pencatatan` | yes | 3 options, below |
| `Sumber Penghasilan` | **derived** | see below |
| `Posting SPT` | button | never pressed, see below |

## `Status` is fixed at draft creation

The `Status` dropdown carries `p-disabled` and does not open. It is set when the
return is created, not from within the returnsheet.

**Consequence:** the `Normal` and `Lebih Bayar` states, and therefore Induk
section **G** (`PERMOHONAN PENGEMBALIAN PPh LEBIH BAYAR`), **cannot be reached
by editing this draft**. Capturing them requires creating a return with that
status. Previous notes listed this as merely "never active", which understated
it, no amount of poking at this draft will reach it.

### Decision: do not capture it, model on SPT Badan instead

Owner's call, 2026-08-17: *"kurang bayar/lebih bayar shouldn't be too different
from the spt pph badan"*. Verified against the repo, and it is already built on
the badan side:

| Concern | Badan implementation |
|---------|----------------------|
| signed balance | `spt_pph_badan.pphKurangLebihBayar`, one signed integer, set from `computed.f17c` |
| refund method | `f19aMetodePengembalian`, picklist `['pemeriksaan', 'pengembalian_pendahuluan']` |
| refund UI | `components/Induk/F.svelte` row **19.a**, two radios: *dikembalikan melalui pemeriksaan* / *dikembalikan melalui Pengembalian Pendahuluan*, plus row **19.b** `Informasi Rekening` |
| kurang-bayar routing | `computed.f17c > 0 ? 'menunggu_pembayaran' : 'dilaporkan'` in `saveSptPphBadan.remote.ts` |

So OP section G is the same shape: a refund-method choice plus bank account
details, shown when the computed balance is a refund. **Build it from the badan
code rather than blocking on a Coretax capture.** Create a `Lebih Bayar` draft
only if the OP variant later turns out to diverge.

## `Metode Pembukuan/Pencatatan`

Three options:

- `Pembukuan stelsel akrual`
- `Pembukuan stelsel kas`
- `Pencatatan`

These correspond to the code legend printed in L-3B section B, where
`1 = PENCATATAN` and `2 = PEMBUKUAN STELSEL KAS ATAU PEMBUKUAN STELSEL AKRUAL`.
So L-3B's `METODE PEMBUKUAN` column collapses the two pembukuan variants into
one code.

### It does **not** gate Induk rows 14e / 14f

An earlier note hypothesised that switching to `Pembukuan` would un-grey `14e`
and `14f`. **That is wrong.** Measured under both `Pencatatan` and `Pembukuan
stelsel akrual`, with everything else held constant:

| Row | Pencatatan | Pembukuan akrual |
|-----|-----------|------------------|
| 14a | present, no radios | same |
| 14b, 14c, 14d, 14e, 14g | present, enabled | same |
| **14f** | present, **radios disabled** | present, **radios disabled** |

Section I is `14a`..`14g`; there is no `14h` in any state observed.

`14f` (*biaya entertainment, biaya promosi, natura dan/atau kenikmatan, serta
piutang yang nyata-nyata tidak dapat ditagih*) stayed disabled under both.

### `14f` later became enabled, trigger not isolated

Later in the same session `14f` was found **enabled**. Between the two
measurements, L-3A was populated (two accounts with amounts, penyesuaian fiskal
and an `FPO-01` code, saved) and `1.b.4` was changed from `Industri` to `Jasa`.

The obvious hypothesis, that `14f` keys off the L-3A accounts it names
(`5318` piutang tak tertagih, `5320` promosi, `5321` entertainment), is
**not supported**: those three accounts were never filled, and `14f` stayed
enabled after switching `1.b.4` back to `Industri`, which swaps in a completely
empty L-3A-3.

So the enable is **sticky and its cause is not isolated**. Do not assume a
gating rule for `14f` from this data. Isolating it needs a fresh draft and one
change at a time. Candidates still open:

- any penyesuaian fiskal existing anywhere in the return, persisted server-side
- having saved any L-3A row at all, regardless of the current sektor
- something set earlier in the session and never reverted

## `Sumber Penghasilan` is derived, not an input

It changed on its own from `Pekerjaan` to `Pekerjaan, Kegiatan Usaha` when
`1.b.1` was set to `Ya`. It is a computed summary of the answered income-source
questions.

Re-verified 2026-08-18 on a draft with `1.a` = Ya, `1.b.1` = Ya, and `1.b.3` =
"Ya, saya berhak menggunakan Norma...": the field read `Pekerjaan, Kegiatan
Usaha, Pekerjaan Bebas` — three items, not two. Confirmed non-interactive: a
click on the combobox does not open a selection panel (no `.p-multiselect-panel`
appears in the DOM), despite the widget carrying no `p-disabled` class.

Not disambiguated: whether `Pekerjaan Bebas` derives from `1.b.1` alone
(app's current assumption — its question text is literally "usaha dan/atau
pekerjaan bebas", so one Ya could mean both) or additionally requires `1.b.3`
answered. The original two-item capture may have been an intermediate state
before `1.b.3` was reached, not a contradiction.

## `Posting SPT` — do not press

Found on the **Induk** tab only, in `HEADER` under `Periode Pembukuan`. It does
not appear on any lampiran tab, whose HEADER carries only `Tahun Pajak` and
`NPWP`.

Helper text:

> Klik tombol "Posting SPT" untuk menampilkan data perpajakan Anda (Harta,
> Utang, Daftar Anggota Keluarga, Bukti Potong PPh, Pembayaran, dan lainnya).
> Posting belum pernah dilakukan

It bulk-pulls the taxpayer's real DJP records into the return.

**It is not dangerous the way `Simpan Konsep` and `Bayar dan Lapor` are** —
owner clarified 2026-08-17 that it is "not that bad". It does not file or
submit anything. Two practical reasons to leave it alone anyway:

1. **It would overwrite the test data.** Every behaviour result in these docs
   depends on deliberately-planted junk amounts across the lampiran. Posting
   replaces them with real records and destroys the baseline.
2. **It pulls real private data into the sheet.** Harta, Utang, Daftar Anggota
   Keluarga, Bukti Potong and Pembayaran are actual financial records. Anything
   captured afterwards would carry them into screenshots and dumps, which is
   exactly what `../../README.md` says not to accumulate.

So the rule is "don't press it", for hygiene rather than danger. If a future
session ever *does* want its behaviour, it is a legitimate thing to capture
deliberately, on a throwaway draft, at a point where losing the test data is
acceptable and with the PII consequences understood.

The capture session's click guard blocks all three labels in the capture phase:

```js
/^(Simpan Konsep|Bayar dan Lapor|Posting SPT)$/i
```
