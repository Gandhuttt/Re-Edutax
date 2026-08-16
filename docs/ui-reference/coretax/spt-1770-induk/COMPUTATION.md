# Induk computation chain, measured end to end

Verified 2026-08-17 by populating every lampiran grid, selecting a PTKP, and
reading Induk. Every figure below was read from Coretax, not derived from
regulation.

## The chain

| Row | Meaning | Rule | Measured |
|-----|---------|------|----------|
| 1.a, 1.b, 1.c, 1.d | penghasilan neto per source | fed from lampiran, see `../spt-1770-lampiran/BEHAVIOR.md` | 600.750.000 / 0 / 111.111 / 888.888 |
| 2 | Penghasilan neto setahun | `1a + 1b + 1c + 1d` | **601.749.999** |
| 3 | pengurang penghasilan neto | fed from L-5 B | 222.222 |
| 4 | neto setelah pengurang | `2 − 3` | **601.527.777** |
| 5 | PTKP | lookup by status, table below | 63.000.000 (K/1) |
| 6 | Penghasilan Kena Pajak | `4 − 5`, **rounded DOWN to nearest 1.000**, floored at 0 | **538.527.000** |
| 7 | PPh Terutang | progressive tariff on row 6, table below | **105.558.100** |
| 8 | pengurang PPh terutang | fed from L-5 C | 333.333 |
| 9 | PPh setelah pengurang | `7 − 8` | **105.224.767** |
| 10a | kredit pajak | fed from L-1 E `JUMLAH BAGIAN E` | 77.865 |
| 11a | PPh kurang/lebih bayar | `9 − 10a − 10b − 10c + 10d` | — |

Two rules that are easy to get wrong and are **confirmed by measurement**:

- **Row 6 rounds down to the nearest 1.000.** `601.527.777 − 63.000.000 =
  538.527.777`, and the form shows `538.527.000`. This is *pembulatan ke bawah
  ribuan penuh*.
- **Row 6 floors at 0.** With income 1.527.777 against PTKP 63.000.000, row 6
  showed 0, not a negative number, and row 7 followed at 0.

## PTKP table, all 13 options

Read by selecting each option and reading the row 5 amount.

| Status | PTKP |
|--------|------|
| TK/0 | 54.000.000 |
| TK/1 | 58.500.000 |
| TK/2 | 63.000.000 |
| TK/3 | 67.500.000 |
| K/0 | 58.500.000 |
| K/1 | 63.000.000 |
| K/2 | 67.500.000 |
| K/3 | 72.000.000 |
| K/I/0 | 112.500.000 |
| K/I/1 | 117.000.000 |
| K/I/2 | 121.500.000 |
| K/I/3 | 126.000.000 |
| -/- | 0 |

Structure: base 54.000.000, +4.500.000 per tanggungan, +4.500.000 for K
(kawin). The K/I series (penghasilan istri digabung) is 54.000.000 + 54.000.000
+ 4.500.000 = 112.500.000 at zero tanggungan, then +4.500.000 each. `-/-`
yields 0, so it is "not applicable" rather than a status.

## Tariff, progressive, confirmed exactly

Row 6 of 538.527.000 produced row 7 of **105.558.100**. That matches the UU HPP
brackets to the rupiah:

| Bracket | Rate | On this PKP |
|---------|------|-------------|
| 0 – 60.000.000 | 5% | 3.000.000 |
| 60.000.000 – 250.000.000 | 15% | 28.500.000 |
| 250.000.000 – 500.000.000 | 25% | 62.500.000 |
| 500.000.000 – 5.000.000.000 | 30% | 11.558.100 |
| above 5.000.000.000 | 35% | — |
| | | **105.558.100** |

### All five brackets confirmed, 2026-08-17

A second measurement at a much higher PKP exercised the 35% band. Income was
driven up via L-3A (see `../spt-1770-lampiran/L3A.md`), giving PKP
**9.950.750.000**, and the form returned PPh Terutang **3.176.762.500**:

| Bracket | Rate | On this PKP |
|---------|------|-------------|
| 0 – 60.000.000 | 5% | 3.000.000 |
| 60.000.000 – 250.000.000 | 15% | 28.500.000 |
| 250.000.000 – 500.000.000 | 25% | 62.500.000 |
| 500.000.000 – 5.000.000.000 | 30% | 1.350.000.000 |
| above 5.000.000.000 | 35% | 1.732.762.500 |
| | | **3.176.762.500** |

Predicted before reading the form and matched to the rupiah. **The full tariff
table is now measured end to end, nothing in it is inferred.**

A third, intermediate confirmation also exists at PKP 950.750.000 →
229.225.000, again exact.

## What this means for our implementation

The lampiran feed the Induk rows, and **Induk does the rest itself**. So the
tax engine is small and well defined: two lookup tables (PTKP, tariff), one
rounding rule, one floor, and a handful of subtractions. Everything upstream is
aggregation, already documented in `../spt-1770-lampiran/BEHAVIOR.md`.

## Not measured

- The 35% bracket above 5 miliar
- Row 10b (angsuran PPh 25), 10c (STP), 10d, 11b, 12a, 13a–13c, 14h. All stayed
  0 in this draft, and 13a/13b are gated on answers not exercised
- Whether row 7 differs under Status `Normal` or `Lebih Bayar`, or under Metode
  `Pembukuan`. This draft is Pembetulan + Pencatatan throughout
- The Norma path (1.b.2 OPPT, 1.b.3 Norma), which computes neto from peredaran
  bruto × a norma percentage in L-3A-4 A rather than from these rows
