# Grid row actions: add, edit, delete

Captured 2026-08-17. Applies to the lampiran grids generally, measured on
L-1 Bagian D.

## The three paths

| Action | Control | Flow |
|--------|---------|------|
| Add | `Tambah` button above the grid | modal → `Simpan` |
| Edit | pencil in `TINDAKAN` | `UBAH` modal → `Simpan` |
| Delete | trash in `TINDAKAN` | inline confirm popover → `Yes` |
| Delete all | `Hapus Semua` button beside `Tambah` | same confirm popover → `Yes` |

Not every grid has all four. Grids seeded from reference data (L-3B from the TKU
registry, L-3A from a fixed chart of accounts) have **only** the pencil, no
`Tambah`, no trash, no `Hapus Semua`.

## Do not confuse `pi-times` with `pi-trash`

Scanning for delete affordances by icon is misleading. On the Induk rows
`1.b.2`, `1.b.3` and `1.b.4`, `pi-times` is the **clear-value X on the
dropdown**, not a row delete. Only `pi-trash` is a row delete.

## Delete confirmation is a DOM popover, not a native dialog

Clicking the trash opens a small inline popover anchored to the icon:

> ⚠ Apakah Anda yakin ingin memproses?
> [ No ] [ **Yes** ]

`Yes` is the primary (filled) button. This is PrimeNG's confirm component
(`p-confirmdialog` is present in the DOM); `window.confirm` is never patched and
never used.

**This matters for automation.** A native `confirm()` would block the browser
extension entirely and require manual dismissal. Coretax does not use one, so
delete is safe to drive. Verify before assuming:

```js
window.confirm.toString().indexOf('[native code]') === -1  // false = untouched
!!document.querySelector('p-confirmdialog,.p-confirm-dialog')  // true = DOM dialog
```

## Delete is immediate and server-side

Confirming fires, in order:

```
POST /returnsheetportal/api/loadpit/l1-table-d-grid/delete
POST /returnsheetportal/api/loadpit/l1-table-d-grid/footer
POST /returnsheetportal/api/loadpit/l1-table-d-grid
```

so: delete the row, recompute the grid footer, refetch the grid. **No
`Simpan Konsep` is involved**, consistent with the established finding that this
form has no unsaved-changes buffer.

The endpoint naming is uniform, `<lampiran>-table-<section>-grid/<verb>`, same
family as the `l2-table-a-grid/delete-tax-object` seen when a gate is turned off.

## Rows renumber, and totals cascade to Induk

Before, L-1 D held two rows:

| NO. | BRUTO | PENGURANG | NETO |
|-----|-------|-----------|------|
| 1 | 1.000.000 | 250.000 | 750.000 |
| 2 | 600.000.000 | 0 | 600.000.000 |

`JUMLAH BAGIAN D` 600.750.000 → Induk `1.a` 600.750.000.

Deleting row 1:

- the surviving row **renumbered from `NO. 2` to `NO. 1`**, so `NO.` is a
  render-time ordinal, not a stored key
- `JUMLAH BAGIAN D` → 600.000.000
- Induk `1.a` → **600.000.000**, down by exactly the deleted row's neto
- Induk row 2 → 600.000.000, row 7 → **124.000.000**

Row 7 re-derives exactly: `3.000.000 + 28.500.000 + 62.500.000 + 30% ×
100.000.000 = 124.000.000`. That is a fourth independent confirmation of the
tariff table in `../spt-1770-induk/COMPUTATION.md`, at a fourth PKP.

Also confirmed incidentally: `PENGHASILAN NETO = PENGHASILAN BRUTO − PENGURANG`
per row (`1.000.000 − 250.000 = 750.000`).

## Changing sektor discards L-3A data

Switching Induk `1.b.4` from `Jasa` to `Industri` replaced L-3A-2 with an empty
L-3A-3, and Induk `1.b.5` fell from 9.350.000.000 to **0**.

This is a destructive edit with no warning: the previously entered laba rugi is
not carried across and is not offered back when switching sektor again. Whether
the old sheet's data is retained server-side and restored on switching *back*
was not tested.

For our rebuild, either warn before switching sektor or keep per-sektor drafts.

## `Hapus Semua`, bulk delete

Measured on L-1 Bagian E. Fires the same shape of call with a `delete-all` verb:

```
POST /returnsheetportal/api/loadpit/l1-table-e-grid/delete-all
POST /returnsheetportal/api/loadpit/l1-table-e-grid/footer
POST /returnsheetportal/api/loadpit/l1-table-e-grid
```

**The confirmation is identical to a single-row delete**: the same
`Apakah Anda yakin ingin memproses?` popover with `No` / `Yes`. There is no row
count, no "this will delete N rows", and nothing distinguishing it from
deleting one row. The button is red where `Tambah` is blue, and that colour is
the *only* signal that it is the more destructive of the two.

Worth diverging from in our rebuild: peserta will click this by accident. State
the row count in the confirmation.

## Grid toolbar

Above each editable grid, in order:

| Icon | Meaning |
|------|---------|
| `pi-plus` | `Tambah` |
| `pi-trash` | `Hapus Semua` |
| `pi-refresh` | reload grid |
| `pi-file` | export, plain file |
| `pi-file-excel` | export xlsx |
| `pi-file-pdf` | export pdf |
| `pi-filter-slash` / `pi-filter-icon` | per-column filter controls |

The export buttons were not exercised.

## Two different empty states

The wording differs depending on how the grid became empty:

| Situation | Text |
|-----------|------|
| never populated | `Tidak ada data untuk ditampilkan.` |
| emptied by `Hapus Semua` | `Tidak ada data yang ditemukan.` |

Probably an inconsistency on DJP's side rather than a meaningful distinction,
but do not treat the two strings as interchangeable when matching on them.

## Not captured

- Whether delete is recoverable before `Simpan Konsep` (almost certainly not,
  it is already persisted)
- Delete on a grid whose row was auto-created by a gate rather than by `Tambah`
- Whether switching `1.b.4` away and back restores the original L-3A data
- The three export buttons
