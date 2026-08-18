# Lampiran 3A, penghasilan neto dari usaha berdasarkan laporan keuangan

Captured 2026-08-17. All three sektor variants measured directly, none inferred.

## Gate

L-3A-N appears when Induk **`1.b.4`** is answered. `1.b.4` itself only appears
once `1.b.3` = `Tidak, saya menyelenggarakan pembukuan.`, which in turn needs
`1.b.1` = `Ya`.

`1.b.4` reads *"Anda menyelenggarakan pembukuan. Sebutkan sektor usaha yang Anda
lakukan?"* and has exactly **three** options:

| `1.b.4` | Tab | Hint |
|---------|-----|------|
| `Dagang` | **L-3A-1** | `Ya, silahkan mengisi lampiran 3A-1` |
| `Jasa` | **L-3A-2** | `Ya, silahkan mengisi lampiran 3A-2` |
| `Industri` | **L-3A-3** | `Ya, silahkan mengisi lampiran 3A-3` |

**Only one L-3A-N exists at a time.** Changing `1.b.4` replaces the tab rather
than adding one. This differs from the usual gating rule where each tab has its
own independent gate.

### L-3A-4 is *not* a fourth sektor variant

Corrected 2026-08-17 after a consistency check against `../spt-1770-induk/HINTS.md`
and `BEHAVIOR.md`. An earlier line here said "L-3A-4 is the Norma variant, gated
elsewhere and not capturable from this account". That is wrong in two ways.

L-3A-4 is **not** produced by `1.b.4` at all and is not part of the
Dagang/Jasa/Industri series. It has at least two independent sections with
separate gates:

| Section | Gate | Status |
|---------|------|--------|
| **A** | Induk **`1.b.3` = Ya** (Norma) | **[bundle-corrected]** not observable from this account (see `L3B.md`), but fully specified and now implemented — see below |
| **B** | Induk **`1.c`** (`penghasilan dalam negeri lainnya`) | **already captured**, hint `Ya, silahkan mengisi lampiran 3A-4 Bagian B`, feed measured at 111.111 in `BEHAVIOR.md` |

So the *tab* L-3A-4 is perfectly reachable, and section B was captured on
2026-08-16. Only section A, the norma calculation, is blocked. Do not read the
`L3B.md` note as "L-3A-4 is unreachable".

> **[bundle-corrected]** 2026-08-19. "Blocked" was true of *observation* and false
> of *implementation*, and this file's own column table in
> `NOTES.md` had it right all along (NAMA TKU, JENIS USAHA/PEKERJAAN BEBAS,
> PEREDARAN BRUTO, NORMA (%), PENGHASILAN NETO).
>
> There is no NPPN percentage table in play. `Norm` is the one **enabled** control
> in the row dialog (required, `> 0`, `<= 100`) — the taxpayer types it. The other
> four columns are disabled and regenerated from L-3B Bagian C by
> `addDataL3bTableCToL3A4TableA`, which sums that section's twelve monthly bruto
> per TKU and re-keys the previously entered `Norm` by row identity so editing
> L-3B does not lose it. `NetIncome = norm !== 0 ? bruto × (norm/100) : 0`, rounded
> per row; `TotalNetIncome = Math.round(Grid1TotalNetIncome)`, which sums the
> already-rounded rows. That total feeds Induk row **1.b.1** when 1.b.3 = Ya.
>
> Implemented 2026-08-19 as `hitungLampiranL3A4BagianA` + `L-3A-4/A.svelte`.

Each mapping above was verified by selecting the option and reading the tab
list, not derived from the numbering. (The SPT Badan L1 sektor mapping is a
known trap for exactly this, see `spt_pph_badan_l1_sektor_mapping` in memory.)

## Section A grid, identical across all three

Section A heading differs slightly by sektor:

- L-3A-1 (Dagang): `A. PENGHASILAN NETO DARI USAHA DAN/ATAU PEKERJAAN BEBAS BERDASARKAN LAPORAN KEUANGAN`
- L-3A-2 (Jasa) and L-3A-3 (Industri): `... DAN/ATAU PROFESI ...`

Columns are the same in all three:

| Column |
|--------|
| `TINDAKAN` |
| `KODE AKUN` |
| `NAMA AKUN` |
| `NILAI KOMERSIAL` |
| `TIDAK TERMASUK OBJEK PAJAK` |
| `DIKENAKAN PPh BERSIFAT FINAL` |
| `OBJEK PAJAK TIDAK FINAL` |
| `PENYESUAIAN FISKAL POSITIF` |
| `PENYESUAIAN FISKAL NEGATIF` |
| `KODE PENYESUAIAN FISKAL` |
| `NILAI FISKAL` |

**This is the same shape as SPT Badan L1**: a fixed chart of accounts with
`4xxx` = income and `5xxx` = expense, a commercial value, fiscal reclassification
columns, and a derived `NILAI FISKAL`. The rules already documented for Badan L1
should be checked for reuse rather than rederived, in particular:

- which columns are inputable per `4xxx`/`5xxx` prefix
- the `NILAI FISKAL` sign convention (sign flips for expense rows)

Both are recorded in memory under `spt_pph_badan_l1_income_expense` and
`spt_pph_badan_l1_fiskal_sign`. **Whether they hold identically here has not been
verified**, no amounts were entered into L-3A in this session.

## Chart of accounts per sektor

Rows are fixed and pre-seeded, there is no add/delete. Group captions (no kode)
are shown in bold below.

### L-3A-1, Dagang

```
Penjualan
  4002  Penjualan Domestik
  4003  Penjualan Ekspor
  4004  Penjualan Bruto
Dikurangi :
  4011  Retur
  4012  Potongan Penjualan
  4020  Penjualan Bersih
Harga Pokok Penjualan (HPP)
  5001  Pembelian
  5008  Persediaan - Awal
  5009  (Dikurangi: Persediaan Akhir)
  5020  Jumlah HPP
  4300  Laba Kotor
Beban Usaha
  5311  Gaji, Tunjangan, Bonus, Honorarium, THR, dsb
  5313  Beban Transportasi
  5314  Beban Penyusutan dan Amortisasi
  5315  Beban Sewa
  5316  Beban Bunga
  5317  Beban Sehubungan dengan Jasa
  5318  Beban Piutang Tidak Tertagih
  5320  Beban Pemasaran atau Promosi
  5321  Beban Entertainment
  5322  Beban Umum dan Administrasi
  5399  Beban Usaha Lainnya
  5400  Jumlah Beban Usaha
```

### L-3A-2, Jasa

```
Pendapatan
  4021  Pendapatan Jasa
  5020  Biaya Pokok Jasa
  4300  Laba Kotor
Beban Usaha
  5311  Gaji, Upah, Bonus, Grafikasi, Honorarium, THR, Dsb
  5313  Beban Transportasi
  5314  Beban Penyusutan dan Amortisasi
  5315  Beban Sewa
  5316  Beban Bunga
  5317  Beban Sehubungan Dengan Jasa
  5318  Beban Piutang Tidak Tertagih
  5320  Biaya Pemasaran/Promosi
  5321  Beban Entertainment
  5322  Beban Umum dan Administrasi
  5399  Beban Usaha Lainnya
  5400  Jumlah Beban Usaha
```

Note `Grafikasi`, which is a typo for *gratifikasi* in the live form. Reproduce
our own copy correctly rather than mirroring it.

Jasa is much shorter: no inventory, no ekspor/retur, and `5020` is a direct
`Biaya Pokok Jasa` rather than a computed HPP.

### L-3A-3, Industri

```
Penjualan
  4002  Penjualan Domestik
  4003  Penjualan Ekspor
  4004  Penjualan Bruto
Dikurangi :
  4011  Retur
  4012  Potongan Penjualan
  4020  Penjualan Bersih
  5040  Biaya Bahan Baku
  5050  Biaya Tenaga Kerja Langsung
Biaya Pabrikasi
  5051  Biaya Tenaga Kerja Tidak Langsung
  5052  Biaya Pemeliharaan dan Perbaikan Mesin
  5058  Biaya Penyusutan dan Amortisasi
  5059  Biaya Utilitas
  5069  Biaya Pabrikasi Lainnya
  5070  Jumlah Biaya Pabrikasi
  5080  Jumlah Biaya Produksi
  5090  Persediaan Awal Barang Dalam Proses
  5099  (Dikurangi: Persediaan Akhir Barang Dalam Proses)
  5100  Jumlah Harga Pokok Produksi
  5008  Persediaan Awal Barang Jadi
  5009  (Dikurangi: Persediaan Akhir Barang Jadi)
  5020  Jumlah Harga Pokok Penjualan
  4300  Laba Kotor
Beban Usaha
  5311  Gaji, Tunjangan, Bonus, Honorarium, THR, dll
  5313  Beban Transportasi
  5314  Beban Penyusutan dan Amortisasi
  5315  Beban Sewa
  5316  Beban Bunga
  5317  Beban Sehubungan Dengan Jasa
  5318  Beban Piutang Tidak Tertagih
  5320  Biaya Pemasaran/Promosi
  5321  Beban Entertainment
  5322  Beban Umum dan Administrasi
  5399  Beban Usaha Lainnya
  5400  Jumlah Beban Usaha
```

Industri is Dagang plus a full production-cost build-up. Note that `5008`/`5009`
are reused with different labels (`Barang Jadi` here, plain `Persediaan` in
Dagang), and `5020` is `Jumlah Harga Pokok Penjualan` rather than `Jumlah HPP`.

### Shared tail

All three end with the identical `5311`..`5400` beban usaha block, with only
cosmetic label drift (`dsb` / `Dsb` / `dll`, `Beban Pemasaran atau Promosi` vs
`Biaya Pemasaran/Promosi`). Treat it as one shared block in our schema.

The `4300 Laba Kotor` and `5400 Jumlah Beban Usaha` rows are subtotals in every
variant.

## Page structure

The page is titled `REKONSILIASI LAPORAN KEUANGAN (<SEKTOR>)`, e.g.
`REKONSILIASI LAPORAN KEUANGAN (JASA)`.

```
HEADER                                     Tahun Pajak, NPWP (read-only)
A. PENGHASILAN NETO DARI USAHA DAN/ATAU ... BERDASARKAN LAPORAN KEUANGAN
   A.1. LAPORAN LABA RUGI                  the chart of accounts above
   A.2. LAPORAN POSISI KEUANGAN (NERACA)   balance sheet
```

`A.1` also carries a `4800 Laba (Rugi) Sebelum Pajak` subtotal below
`5400 Jumlah Beban Usaha`, which the initial row dump cut off.

### A.2, Neraca

Two side-by-side tables, assets on the left and liabilities plus equity on the
right, three columns each: `Kode Akun`, `Akun`, and an unlabelled value input.
**Values are entered inline, there is no row editor**, unlike A.1.

This is the same arrangement as SPT Badan L1 Section B, see
`spt_pph_badan_l1_neraca_section_b` in memory.

**The neraca chart also varies by sektor**, but only for Industri. All three
measured:

| | Dagang | Jasa | Industri |
|---|--------|------|----------|
| Persediaan | `1401 Persediaan` | `1401 Persediaan` | `1402 Bahan Baku`, `1403 Barang Dalam Proses`, `1404 Barang Jadi` |
| Aset tetap | `1523/1524`, `1529/1530` | same | adds `1525/1526 Peralatan`, `1527/1528 Mesin` |
| Row count (aset) | 24 | 24 | 30 |

**Dagang and Jasa share an identical neraca**; only Industri expands it, which
follows from Industri being the only sektor with a production process. The
liabilitas/ekuitas side is **identical in all three** (24 rows).

So the neraca needs two variants, not three: a default and an Industri one.

### Totals and balance

Derived footer rows:

- `1700 Jumlah Aset` (aset table)
- `2999 Jumlah Liabilitas`, `3299 Jumlah Ekuitas`,
  `3300 Jumlah Liabilitas dan Ekuitas` (right table)

**The neraca does not enforce balance.** Entered `1101 Kas` 5.000.000.000 and
`2102 Utang Usaha` 1.000.000.000, giving `1700` = 5.000.000.000 against `3300` =
1.000.000.000. No warning, no error, no block. It is disclosure only, with
derived subtotals and no aset = liabilitas + ekuitas check.

Whether A.2 feeds anything downstream was not observed; nothing in Induk moved.

### Section A footer

Below the neraca, outside both tables:

| Field | Type |
|-------|------|
| `LAPORAN KEUANGAN` | dropdown: `Tidak Diaudit`, `Diaudit` |
| `NPWP KONSULTAN PAJAK` | text |
| `NAMA KONSULTAN PAJAK` | text |

Aset, **Jasa variant** (24 rows):

```
Aset Lancar
  1101  Kas dan Setara Kas
  1200  Investasi
  1122  Piutang Usaha - Pihak Ketiga
  1123  Piutang Usaha - Pihak yang Mempunyai Hubungan Istimewa
  1124  Piutang Lainnya - Pihak Ketiga
  1125  Piutang Lainnya - Pihak yang Mempunyai Hubungan Istimewa
  1131  (Dikurangi: Cadangan Piutang Tak Tertagih)
  1401  Persediaan
  1421  Beban Dibayar di Muka
  1422  Uang Muka
  1423  Pajak Dibayar di Muka
  1499  Aset Lancar Lainnya
Aset Tidak Lancar
  1501  Piutang Jangka Panjang
  1523  Tanah dan Bangunan
  1524  (Dikurangi: Akumulasi Penyusutan)
  1529  Aset Tetap Lainnya
  1530  (Dikurangi: Akumulasi Penyusutan)
  1541  Investasi pada Perusahaan Asosiasi
  1599  Investasi Jangka Panjang Lainnya
  1600  Aset Tak Berwujud - Net
  1611  Aset Pajak Tangguhan
  1698  Aset Tidak Lancar Lainnya
```

Liabilitas dan Ekuitas (24 rows):

```
Liabilitas Jangka Pendek
  2102  Utang Usaha - Pihak Ketiga
  2103  Utang Usaha - Pihak yang Mempunyai Hubungan Istimewa
  2111  Utang Bunga
  2191  Utang Pajak
  2192  Utang Dividen
  2195  Beban yang Masih Harus Dibayar
  2201  Utang Bank Jangka Pendek
  2202  Utang Jangka Panjang yang Jatuh Tempo dalam Satu Tahun
  2203  Uang Muka
  2228  Liabilitas Jangka Pendek Lainnya
Liabilitas Jangka Panjang
  2301  Utang Bank Jangka Panjang
  2303  Utang Jangka Panjang-Pihak Ketiga
  2304  Utang Jangka Panjang - Pihak yang Mempunyai Hubungan Istimewa
  2321  Liabilitas Pajak Tangguhan
  2998  Liabilitas Jangka Panjang Lainnya
  2999  Jumlah Liabilitas
Ekuitas
  3102  Modal Saham
  3120  Tambahan Modal Disetor
  3200  Saldo Laba
  3298  Ekuitas Lainnya
  3299  Jumlah Ekuitas
```

`3102 Modal Saham` on an *orang pribadi* return is odd but is what the live form
shows. The account list is evidently shared with the badan form.

Aset, **Industri variant** (30 rows), differences from Jasa in bold:

```
Aset Lancar
  1101  Kas dan Setara Kas
  1200  Investasi
  1122  Piutang Usaha - Pihak Ketiga
  1123  Piutang Usaha - Pihak yang Mempunyai Hubungan Istimewa
  1124  Piutang Lainnya - Pihak Ketiga
  1125  Piutang Lainnya - Pihak yang Mempunyai Hubungan Istimewa
  1131  (Dikurangi: Cadangan Piutang Tak Tertagih)
**1402  Persediaan Bahan Baku**
**1403  Persediaan Barang Dalam Proses**
**1404  Persediaan Barang Jadi**
  1421  Beban Dibayar di Muka
  1422  Uang Muka
  1423  Pajak Dibayar di Muka
  1499  Aset lancar lainnya
Aset Tidak Lancar
  1501  Piutang Jangka Panjang
  1523  Tanah dan Bangunan
  1524  (Dikurangi: Akumulasi Penyusutan)
**1525  Peralatan**
**1526  (Dikurangi: Akumulasi Penyusutan)**
**1527  Mesin**
**1528  (Dikurangi: Akumulasi Penyusutan)**
  1529  Aset Tetap Lainnya
  1530  (Dikurangi: Akumulasi Penyusutan)
  1541  Investasi pada Perusahaan Asosiasi
  1599  Investasi Jangka Panjang Lainnya
  1600  Aset Tak Berwujud - Net
  1611  Aset Pajak Tangguhan
  1698  Aset Tidak Lancar Lainnya
  1700  Jumlah Aset (derived)
```

Note the casing drift on `1499`: `Aset Lancar Lainnya` in Jasa,
`Aset lancar lainnya` in Dagang and Industri. Normalise in our copy.

Dagang's aset list is row-for-row identical to Jasa's above, apart from that
`1499` casing.

## A.1 row editor, `UBAH`

Opened from the pencil in `TINDAKAN`. Subtotal rows (`4300`, `5400`, `4800`) and
group captions have no pencil.

| Field | State |
|-------|-------|
| `Kode Akun` | read-only |
| `Keterangan` | read-only (the account name) |
| `NILAI (KOMERSIAL)` | editable |
| `NON OBJEK PAJAK` | editable |
| `DIKENAKAN PPh FINAL` | editable |
| `TIDAK FINAL` | **derived** |
| `PENYESUAIAN FISKAL POSITIF` | editable |
| `PENYESUAIAN FISKAL NEGATIF` | editable |
| `KODE PENYESUAIAN FISKAL` | multi-select, disabled until an adjustment is entered |
| `NILAI FISKAL (Sebelum Fasilitas Perpajakan)` | **derived** |

Buttons `Tutup` / `Simpan`.

### Formulas, both row types measured

**Income row, `4021 Pendapatan Jasa`.** Entered KOMERSIAL 1.000.000.000,
NON OBJEK 100.000.000, FINAL 200.000.000, POSITIF 50.000.000, NEGATIF
30.000.000:

```
TIDAK FINAL  = KOMERSIAL − NON OBJEK PAJAK − DIKENAKAN PPh FINAL
             = 1.000.000.000 − 100.000.000 − 200.000.000 = 700.000.000   ✓

NILAI FISKAL = TIDAK FINAL + POSITIF − NEGATIF
             = 700.000.000 + 50.000.000 − 30.000.000     = 720.000.000   ✓
```

**Expense row, `5311 Gaji, ...`.** Entered KOMERSIAL 400.000.000, POSITIF
50.000.000, NEGATIF 20.000.000:

```
NILAI FISKAL = TIDAK FINAL − POSITIF + NEGATIF
             = 400.000.000 − 50.000.000 + 20.000.000     = 370.000.000   ✓
```

**The sign flips on expense rows**, exactly as SPT Badan L1 does
(`spt_pph_badan_l1_fiskal_sign`). Positif *reduces* a deductible expense and
negatif *increases* it, which is correct: a positive fiscal adjustment always
raises taxable profit, whichever side of the P&L it sits on.

On `5xxx` rows **`NON OBJEK PAJAK` and `DIKENAKAN PPh FINAL` are disabled**, so
`TIDAK FINAL` collapses to `KOMERSIAL`. Only `4xxx` income rows can split
across the three tax-treatment columns. This matches the Badan L1
inputable-column rule (`spt_pph_badan_l1_income_expense`).

Everything recomputes live per keystroke, before saving.

### Subtotal rollup

With only those two rows filled:

| Row | KOMERSIAL | NON OBJEK | FINAL | TIDAK FINAL | POSITIF | NEGATIF | FISKAL |
|-----|-----------|-----------|-------|-------------|---------|---------|--------|
| 4021 | 1.000.000.000 | 100.000.000 | 200.000.000 | 700.000.000 | 50.000.000 | 30.000.000 | 720.000.000 |
| 4300 Laba Kotor | 1.000.000.000 | | | 700.000.000 | | | 720.000.000 |
| 5311 | 400.000.000 | | | 400.000.000 | 50.000.000 | 20.000.000 | 370.000.000 |
| 5400 Jumlah Beban Usaha | 400.000.000 | | | 400.000.000 | | | 370.000.000 |
| **4800 Laba (Rugi) Sebelum Pajak** | **600.000.000** | **100.000.000** | **200.000.000** | **300.000.000** | **100.000.000** | **50.000.000** | **350.000.000** |

- `4300 = pendapatan − biaya pokok`, `5400 = Σ beban usaha`, and
  `4800 = 4300 − 5400` **column by column**.
- The adjustment columns are **summed, not netted**, on `4800`:
  POSITIF `50.000.000 + 50.000.000 = 100.000.000`, NEGATIF
  `30.000.000 + 20.000.000 = 50.000.000`. They are not sign-adjusted at the
  subtotal level even though they were at the row level.
- `4800 NILAI FISKAL` is consistent under both derivations:
  `720.000.000 − 370.000.000 = 350.000.000` and
  `300.000.000 + 100.000.000 − 50.000.000 = 350.000.000`.

### `KODE PENYESUAIAN FISKAL` is conditionally required

`Simpan` was **rejected** with `Kolom ini wajib diisi!` once a penyesuaian
fiskal was entered. The field is disabled while both adjustment amounts are
empty and becomes mandatory as soon as either is non-zero.

It is a **multi-select with checkboxes**, not a single-value dropdown, so more
than one code can apply to one account. It is *not* a PrimeNG `.p-dropdown`,
which is why `.p-dropdown-panel` selectors do not find it.

Options (15, plus a blank `-`):

```
FPO-01  Biaya yang dibebankan/dikeluarkan untuk kepentingan pribadi Wajib Pajak
        atau orang yang menjadi tanggungannya
FPO-02  Premi Asuransi kesehatan, asuransi kecelakaan, asuransi jiwa, asuransi
        dwiguna, dan asuransi beasiswa yang dibayar oleh Wajib Pajak
FPO-04  Jumlah yang melebihi kewajaran yang dibayarkan kepada pihak yang
        mempunyai hubungan istimewa sehubungan dengan pekerjaan yang dilakukan
FPO-05  Harta yang dihibahkan, bantuan atau sumbangan
FPO-06  Pajak penghasilan
FPO-07  Gaji yang dibayarkan kepada pemilik/orang yang menjadi tanggungannya
FPO-08  Sanksi administrasi
FPO-09  Selisih penyusutan komersial di atas penyusutan fiskal
FPO-10  Selisih amortisasi komersial di atas amortisasi fiskal
FPO-11  Biaya untuk mendapatkan, menagih dan memelihara penghasilan yang
        dikenakan PPh Final dan penghasilan yang tidak termasuk objek pajak
FPO-12  Penyesuaian fiskal positif lainnya
FNE-01  Penghasilan yang dikenakan PPh final dan penghasilan yang tidak termasuk
        objek pajak tetapi termasuk dalam peredaran usaha
FNE-02  Selisih penyusutan komersial di bawah penyusutan fiskal
FNE-03  Selisih amortisasi komersial di bawah amortisasi fiskal
FNE-04  Penyesuaian fiskal negatif lainnya
```

`FPO` = fiskal positif, `FNE` = fiskal negatif. **`FPO-03` does not exist** in
the list, the numbering skips it. Do not renumber to close the gap, these are
the DJP reference codes.

The list is *not* filtered by whether the amount was entered as positif or
negatif, both FPO and FNE codes were offered on a row with both filled.

## Feed to Induk, confirmed end to end

**Induk `1.b.5` = L-3A `4800 NILAI FISKAL`**, directly and with no further
adjustment. Measured: `4800` fiskal 350.000.000 → `1.b.5` **350.000.000**.

The rest of the chain then follows `../spt-1770-induk/COMPUTATION.md`:

```
1.a  600.750.000   (pekerjaan, from L-1 D)
1.b  350.000.000   (usaha, from L-3A 4800 NILAI FISKAL)
2    950.750.000   = 1a + 1b + 1c + 1d
4    950.750.000   (no pengurang)
5              0   (PTKP unset)
6    950.750.000
7    229.225.000
```

Row 7 re-derives exactly from the UU HPP brackets:
`3.000.000 + 28.500.000 + 62.500.000 + 30% × 450.750.000 = 229.225.000`. That is
an independent second confirmation of the tariff table in `COMPUTATION.md`,
measured at a different PKP from the original capture.

So the full pembukuan path is now closed: **L-3A A.1 accounts → `4800` fiskal →
Induk `1.b.5` → row 2 → PTKP → progressive tariff.**

## Not captured

- Whether `KODE PENYESUAIAN FISKAL` restricts FPO codes to the positif amount
  and FNE codes to the negatif amount at save time (FPO-01 was accepted on a row
  that had *both* a positif and a negatif amount, so probably not)
- The Dagang neraca variant
- The `Laba Kotor` formula when `5020` is populated (it was left empty)
- Delete/clear of an A.1 row once saved
- Whether A.2 feeds anything downstream (nothing in Induk moved)
- Whether `LAPORAN KEUANGAN = Diaudit` makes the konsultan fields required
