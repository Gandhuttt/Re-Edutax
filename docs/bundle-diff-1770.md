# src/ vs Coretax bundle — SPT 1770 calculation & state gating diff

**Provenance.** Findings below come from reading the deployed Coretax production
bundle, not from UI measurement, and not from `docs/ui-reference/` (whose notes
were NOT treated as evidence about `src/` — several `src/` comments citing them
are contradicted by the code they annotate, noted inline).

- Chunk: `827.1117977ff84ffcd9.js` from
  `https://coretaxdjp.pajak.go.id/returnsheets-portal/id-ID/`, fetched 2026-08-19
  with `curl --compressed` (origin serves brotli).
- Verified live the same day: 6 L-4 Section B outputs across two tax bands, the
  PH branch zeroing Induk C4/C5, and `valueC7` sourcing `IncomeTaxPaybleHusband`.
- The chunk covers **pph-orang-pribadi only**. `pph-badan` and `ppn` are separate
  portal modules and are NOT covered by anything here.

Coretax internal field names are given as `valueXN` / `ValueN`; the mapping to our
row numbers is `valueC1 = n2`, `valueC2 = n3`, `valueC3 = n4`, `valueC7 = row 7`,
`valueC6 = row 9`, `valueD1 = n10a`, `valueE1 = n11a`, `valueH1 = angsuran`.

---

## A. Calculation divergences

### A1 — Section B PKP gabungan is missing the floor to 1.000  (high)

`hitungPphOrangPribadi.ts`, `hitungLampiranL4SectionB`:

```ts
const penghasilanKenaPajakGabungan = Math.max(0, netoGabungan - ptkpGabunganNilai);
```

Coretax `calculateL4B6`:

```js
const t = V17 - V18;
patchValue({ Value19: t < 0 ? 0 : this.roundingThousand(t) });
```

Any `netoGabungan - ptkp` that is not already a multiple of 1.000 diverges, and
because `hitungPphTerutang` then rounds, the error lands in `pphTerutangGabungan`
and both spouse shares. The in-code comment claiming this was "confirmed exact
… with no floor/rounding applied" is wrong — both measured cases were round
millions, so they could not distinguish the two.

Failing case (both implementations run side by side): `netoWp` 150.000.000, spouse
100.000.777, PTKP K/I/0

| | PKP gabungan | PPh gabungan | ditanggung WP | ditanggung suami/istri |
|---|---|---|---|---|
| ours | 137.500.777 | 14.625.117 | 8.775.043 | 5.850.074 |
| Coretax | 137.500.000 | 14.625.000 | 8.774.973 | 5.850.027 |

Control: the case observed live on 2026-08-19 (465.000.000 / 310.000.000 / K/I/1)
matches exactly in both, so the baseline is sound — this is edge-driven only.

### A2 — Section B spouse split is missing three branches  (high)

Ours:

```ts
const wpShare = netoGabungan > 0 ? input.netoWp / netoGabungan : 0;
const pphDitanggungWp = Math.round(pphTerutangGabungan * wpShare);
const pphDitanggungSuamiIstri = pphTerutangGabungan - pphDitanggungWp;
```

Coretax `calculateL4B8` / `calculateL4B9`:

```js
V21 = V15 >= 0 ? (V16 > 0 && V17 !== 0 ? round(V15 / V17 * V20)
                                       : (V16 <= 0 ? V20 : 0))
                : 0;
V22 = V16 >= 0 ? V20 - V21 : 0;
```

Three behaviours we don't have:
- `V16 <= 0` → the **whole** `V20` goes to the WP, no ratio applied.
- `V15 < 0` → `V21 = 0`.
- `V16 < 0` → `V22 = 0`.

Failing case: `netoWp` 400.000.000, spouse **−100.000.000**, PTKP K/I/0. Both agree
PKP gabungan 187.500.000 and PPh gabungan 22.125.000, then diverge:

| | ditanggung WP | ditanggung suami/istri |
|---|---|---|
| ours | 29.500.000 (`wpShare` = 1,333…, **exceeds** the PPh gabungan) | **−7.375.000** |
| Coretax | 22.125.000 (all of `V20`) | 0 |

### A3 — `roundingThousand` edge behaviour differs in both directions  (medium)

Coretax has two *different* thousand-roundings:

```js
// L-4 A and B
roundingThousand(t) { return t.toString().length >= 4 && t % 1000 != 0 ? t - t % 1000 : t }
// Induk row 6 (getTaxableIncome)
o = t < _ ? 0 : t - _;  o > 1000 ? o -= o % 1000 : o = 0;
```

Ours uses one rule everywhere: `Math.max(0, Math.floor(x / 1000) * 1000)`.

- **L-4 A and B, PKP 1…999**: Coretax keeps the value (string length < 4 → returned
  unchanged); ours floors to 0.
- **Induk row 6, PKP exactly 1000**: Coretax gives **0** (`o > 1000` is false);
  ours gives 1000.

### A4 — Induk row 9 is not clamped at 0  (high)

Ours: `const n9 = n7 - n8;`

Coretax `getIncomeTaxPayableAfterIncomeTaxDeduction`:

```js
const o = t < _ ? 0 : t - _;              // t = C7 (row 7), _ = C8 (row 8)
const i = Math.floor(o) + (o % 1 >= .5 ? 1 : 0);   // round half up
0 === i && (t = 0);                        // row 7 forced to 0 when row 9 is 0
patchValue({ valueC6: i, valueC7: t });
```

With row 8 > row 7 ours produces a negative row 9, which then propagates into
`n11a` and `angsuranPph25TahunDepan`. We also lack the back-write that zeroes
row 7 when row 9 lands on 0.

### A5 — L-4 A "PPh yang harus dibayar" is not clamped at 0  (high)

Ours: `const pphYangHarusDibayar = pajakTerutang - pengurangPphTerutang - kreditPajak;`

Coretax `calculateL4A9`: `Value9 = max(0, V7 - V23 - V8)`.

Kredit pajak exceeding PPh terutang gives us a negative row 10 and then a
negative `angsuranPph25`.

### A6 — Angsuran PPh 25 hardcodes /12 and skips the 0-clamp  (high)

Ours: `Math.round((n9 - n10a) / 12)`.

Coretax:

```js
get numberOfMonth() { const s = parseInt(AccountingPeriodStart), e = parseInt(AccountingPeriodEnd);
  return s <= e ? e - s + 1 : 12 - (s ?? 0) + ((e ?? 0) - 1) + 2 }
valueH1 = Math.round(1 / numberOfMonth * (C6 < D1 ? 0 : C6 - D1));
```

Three issues: the divisor is the accounting-period length, not always 12 (we
already hold `periodeBulanMulai` / `periodeBulanSelesai` in `+page.svelte` and
don't use them); the numerator is clamped at 0; and it uses Coretax's *clamped*
row 9 (`C6`), whereas ours uses our unclamped `n9` (see A4). The 13a hint text
in the bundle is built as `"Ya, Angsuran PPh Pasal 25 adalah 1/" + numberOfMonth
+ " x ((9) – (10)(a))"`, i.e. the form itself displays the variable divisor.

Note the bundle's L-4 A uses `Math.round(V9 * 0.08333333333333333)` rather than
`/12`; verified equivalent over 400k random values, so no action needed there.

### A7 — no pre-2022 bracket set  (low, unless tahun pajak ≤ 2021 is reachable)

`BRACKETS` in `src` holds only the UU HPP ladder. Coretax carries both, and picks
between them **inconsistently**:

```js
// L-4 A: calculationIncomeTaxPayble(field, PeriodYear)
if (parseInt(PeriodYear) + 1 < 2022) { /* 50jt ladder */ } else { /* 60jt ladder */ }
// L-4 B: calculationIncomeTaxPaybleL4B(field)
this.mainFormData.PeriodYear < 2022 ? /* 50jt ladder */ : /* 60jt ladder */
```

For `PeriodYear` 2021 the two sections disagree with each other. Untested live —
would need a 2021 return.

> **Closed by decision, 2026-08-20.** The pre-2022 ladder was implemented, then
> removed again along with both predicates: this app now applies the UU HPP
> schedule (60jt/5%, 250jt/15%, 500jt/25%, 5M/30%, 35%) for **every** tahun
> pajak, in Induk row 7 and in L-4 Bagian A and B alike. This is a deliberate
> divergence from Coretax for returns before 2022, not an oversight, and it also
> retires the A-vs-B 2021 inconsistency. Reinstate from git history if pre-2022
> returns ever become reachable.

### A8 — bracket implementation equivalent, float behaviour differs  (low)

Ours accumulates marginal bands; Coretax applies `rate × PKP − minus`. Verified
mathematically identical for every band, including all four boundaries (the ladder
is continuous: 60jt → 3.000.000, 250jt → 31.500.000, 500jt → 94.000.000,
5M → 1.444.000.000 under either form). Two consequences:

- Band-edge `<` vs `<=` errors are **undetectable by testing** — don't rely on
  live comparison to validate boundaries.
- On multiples of 1.000 the two still differ in float representation for large
  35%-band values (PKP 5.856.624.000 → `rate−minus` yields 1.743.818.399,9999998).
  Coretax leaves row 7 unrounded (Induk `valueC7`, L-4 A `Value7`) and only rounds
  at row 9; ours rounds inside `hitungPphTerutang`. Cosmetic unless we mirror the
  displayed row-7 value.

### A9 — Section B WP "Penghasilan Neto" shows the wrong row  (low, display only)

`_L4.svelte` renders `n4` in both WP cells. Coretax:

```js
annualNetIncome && patchValue({ Value13: annualNetIncome })    // = valueC1 = our n2
netIncomeSummary && patchValue({ Value15: netIncomeSummary })  // = valueC3 = our n4
```

`Value13` is Induk row 2, not row 4. It feeds no formula, so this is display-only —
but the `src` comment asserting "both mirror Induk row 4" is incorrect.

Also note both patches are `&&`-guarded, so a computed 0 does **not** overwrite a
previously prefilled value.

---

## B. State gating divergences

### B1 — L-4 Bagian A renders unconditionally  (high)

`_L4.svelte` puts Bagian A outside any `{#if}`, while its own comment says it is
"Gated on Induk 13b = Ya". Coretax gates the panel itself:

```js
e.Q6J("ngIf", _.chkH2)               // Bagian A
e.Q6J("ngIf", _.isSectionBRequired)  // Bagian B
```

The **tab** gate in `+page.svelte` is correct (`h13b || isPhMt`, matching
`ShowPitrL4Form`), but on a PH/MT return with 13b = Tidak — exactly the state of
the live account — Coretax shows Bagian B only, and we show both.

### B2 — Bagian A PTKP is not disabled on PH/MT  (high, affects numbers)

Coretax `ngOnInit`:

```js
statusOfTaxObligation == SeparatedAsset.code || ChooseToBeSeparated.code
  ? (this.isTaxExemptionDisabled = !0, calculateL4B4(), calculateL4B8(), calculateL4B9())
  : this.isTaxExemptionDisabled = !1
```

bound in the template as `("disabled", t.isTaxExemptionDisabled)`. `Value5` is
`{value: 0, disabled: true}` and is only ever written by the dropdown handler, so
on PH/MT the Bagian A PTKP stays **0**. Ours lets the user pick one, changing
row 6/7/10/11 of Bagian A.

Related quirk worth deciding on deliberately: `onChangeChooseTaxObligation` sets
`TaxExemptionType: "-/-"` via `patchValue`, which does not fire the change handler,
so `Value5` keeps its previous amount rather than resetting to 0.

### B3 — Induk 1.a = Tidak does not zero row 1a  (high)

Coretax:

```js
!0 === t.chkB1A ? t.L1Form && patchValue({ valueB1A: t.L1Form.SumOfNetIncome ?? 0 })
                : patchValue({ valueB1A: 0 })
```

Ours passes `n1a = jumlah(l1Pekerjaan, 'penghasilanNeto')` into `hitungInduk`
unconditionally, even though `b1aPenghasilanPekerjaan` exists as an answer. Since
we deliberately retain lampiran rows when a gate closes, answering 1.a = Tidak
leaves the L-1 D total still feeding row 2.

`valueB1B1` is likewise zeroed first (`patchValue({valueB1B1: 0})`) before being
re-filled per branch. `valueB1C` / `valueB1D` / `valueI3` / `valueI4` are
`&&`-guarded with **no** else-zero, so those go stale in Coretax instead — our
always-re-sum behaviour is close enough there and needs no change.

### B4 — L-3A-4 tab gate is missing the Norma branch  (medium)

Coretax: `ShowPitrL3A4Form = selectB1B3 === Yes.code || chkB1C === true`.
Ours: `visibility: Boolean(b1cPenghasilanDalamNegeriLainnya)` only.

### B5 — Norma has no path into row 1.b.1  (medium)

Coretax switches the source of `valueB1B1`:

```js
patchValue({ valueB1B1: 0 });
t.selectB1B3 === Yes.code   && t.L3A4Form && patchValue({ valueB1B1: t.L3A4Form.TotalNetIncome ?? 0 });
"1" == t.selectB1B47 && t.L3A1Form && patchValue({ valueB1B1: t.L3A1Form?.L3A1TreeTotalRow?.FinalAmount ?? 0 });
"2" == t.selectB1B47 && t.L3A2Form && patchValue({ valueB1B1: t.L3A2Form?.L3A2TreeTotalRow?.FinalAmount ?? 0 });
```

Ours always reads L-3A's 4800 NILAI FISKAL for the selected sektor, so choosing
Norma (1.b.3) leaves `n1b = 0`. Also unverified: whether our 4800 `nilaiFiskal`
equals their `L3A{1,2,3}TreeTotalRow.FinalAmount`.

### B6 — 13a/13b/13c exclusivity is 3-way here, 1-way in Coretax  (medium)

Coretax has exactly one interlock, 13a over 13b:

```js
checkedChkH1(t){ 0 == t ? (patchValue({valueH1:0, chkH1:!1}), chkH2.enable())
                        : (patchValue({chkH1:!0}), chkH2.disable(),
                           chkH2.setValue("0"), patchValue({valueH2:0, chkH2:!1})) }
disableChkH2(){ "1" == chkH1.value || 1 == chkH1.value ? (chkH2.disable(), ...) : chkH2.enable() }
checkedChkH3(t){ patchValue(0 == t ? {chkH3:!1} : {chkH3:!0}) }   // no cross-clearing
```

Two differences: `chkH3` clears nothing in Coretax, whereas our `pilih()` clears
13a and 13b when 13c is answered Ya; and Coretax **disables** 13b (unanswerable)
where we only clear it. Note also the mixed types — `setValue("0")` string vs
`chkH2: !1` boolean, and `disableChkH2` testing both `"1"` and `1`.

### B7 — L-3B gate: `src` is right, its comment understates it  (no change needed)

```js
ShowPitrL3BForm = lActiveB1B24 === true || selectB1B24 === YesReceived.code
                || selectB1B24 === YesSpecific.code || selectB1B3 === Yes.code
```

The Norma branch our comment describes as locally "added here" beyond what the
doc observed is genuinely in Coretax. Only `lActiveB1B24` (a runtime flag, not a
form value) is unmatched.

### B8 — L-3C / L-3D absent  (informational)

`ShowPitrL3CForm = chkI5`, `ShowPitrL3DForm = chkI6`. Neither appears in our
`tabs` list, and the `+page.svelte` fallback comment ("gated above but not built
yet") does not apply to these two — they are not gated above either.

---

## Verified-equivalent (no action)

| Area | Ours | Coretax |
|---|---|---|
| Row 2 | `n1a + n1b + n1c + n1d` | `valueB1A + valueB1B1 + valueB1C + valueB1D` |
| Row 4 | `n2 - n3` | `valueC3 = C1 - C2` |
| Row 11a | `n9 - n10a - n10b - n10c + n10d` | `valueE1 = C6 - D1 - D2 - D3 + D4` |
| Row 11c | `n11a - n11b` | `valueE3 = E1 - E2` |
| PTKP table | 12 codes + `-/-` | same amounts; Coretax also carries HB0–HB3 but filters them out of the dropdown |
| Bracket values | UU HPP ladder | equivalent to `rate × PKP − minus` at every band (see A8) |
| L-4 tab gate | `h13b \|\| isPhMt` | `ShowPitrL4Form` |
| L-4 B gate | `status === 'ph' \|\| 'mt'` | `IsL4SectionBRequired` |
| L-2 tab gate | `14c \|\| 14d \|\| b1d` | `chkB1D \|\| chkI3 \|\| chkI4` |
| L-3A-1/2/3 gate | `b1b4Sektor === dagang/jasa/industri` | `selectB1B47 === Trading/Service/Industry` |
| L-5 tab gate | `c3 \|\| c8` | `chkC5 \|\| chkC2` |
| PH/MT override | row 6 → 0, row 7 ← Section B WP share | `valueC5 = 0`, `valueC7 = L4Form.IncomeTaxPaybleHusband` |
| Row 7 status auto-set | — | `checkFamilyMemberStatus`: wife Dependant → null, PH → SeparatedAsset, MT → ChooseToBeSeparated (**not** implemented here; unclear whether we want it) |

## Not covered by this diff

- Server-side recomputation on submit — a separate implementation, never seen.
- `PIT_TAX_RATE` reference data: the Induk tariff is **data-driven**, not the
  hardcoded ladder. `getIncomeTaxPayable` fetches
  `getMaintenanceReferenceDataList("PIT_TAX_RATE")`, picks the row whose
  `ValidFrom`/`ValidTo` bracket the end of month `(TaxYear, AccountingPeriodEnd − 1)`,
  parses `ParameterData.ItemList[0].Rates`, and matches `Min <= PKP && Max >= PKP`
  for `Rate` and `Minus`, falling back to `rate = 1%, minus = 0`. Never observed
  firing (PH/MT returns take the other branch), and the actual band data is unseen.
- The `isMigrated` / `isStatusSubmitted` / `submitted` / `isPrefillDone` /
  `returnSheetStatusCode === "CREATED"` guards, which suppress recalculation in
  specific combinations throughout the Coretax component. We have no equivalent
  concept; likely relevant only for amended/migrated returns.
- `pph-badan` and `ppn`: different portal modules, different bundles, not fetched.

---

## Resolution status (2026-08-19)

Fixed, with a regression case in `hitungPphOrangPribadi.check.ts` for each
(37 new assertions, all bundle-derived; the 26 pre-existing measured ones still
pass unchanged):

| # | Where |
|---|---|
| A1 | `hitungLampiranL4SectionB` → `pembulatanRibuanL4` |
| A2 | `hitungLampiranL4SectionB` → three-branch split |
| A3 | `pembulatanRibuanL4` + `pembulatanRibuanInduk`, kept as two distinct helpers |
| A4 | `hitungInduk` → `n9` clamp + `pembulatanSetengahKeAtas` + `n7` back-write |
| A5 | `hitungLampiranL4` → clamps on `jumlahPenghasilanNeto` and `pphYangHarusDibayar` |
| A6 | `hitungJumlahBulan`, threaded from `periodeBulanMulai`/`Selesai` in `+page.svelte` |
| A7 | ~~`BANDS_PRA_HPP` + both year predicates~~ — removed 2026-08-20, one ladder for every tahun pajak |
| A8 | `terapkanTarif` uses the band form; row 7 left unrounded |
| A9 | `_L4.svelte` Bagian B WP cell → new `n2` prop |
| B1 | `_L4.svelte` `{#if bagianAGated}` |
| B2 | `_L4.svelte` PTKP `disabled`, `hitungLampiranL4`'s `phMt`, `Induk/C.svelte` `phMt` |
| B3 | `+page.svelte` `n1a` gated on `b1aPenghasilanPekerjaan` |
| B4 | `+page.svelte` L-3A-4 visibility gains the Norma branch |
| B6 | `Induk/H.svelte` — 3-way exclusivity replaced by 13a-over-13b, 13b disabled |
| B5 | `hitungLampiranL3A4BagianA`, `L-3A-4/A.svelte`, `norma_persen` column, row 1.b.1 branch |

Deliberate deviation, one place: on PH/MT we zero Bagian A's PTKP, where Coretax
leaves the previously selected amount stranded in a now-disabled field (its
`patchValue({TaxExemptionType:"-/-"})` never fires the change handler). Noted at
the call site in `_L4.svelte`.

### Still open

- **B5 — FIXED.** The earlier "blocked" verdict was wrong, and wrong for a
  specific reason: it came from UI observation only. The bundle shows there is no
  NPPN reference table in play at all. In L-3A-4 Bagian A's row dialog, `Norm` is
  the one ENABLED control (required, `greaterThan(0)`, `lessThanEquals(100)`) —
  the taxpayer types the percentage. The other four columns are disabled and
  regenerated from L-3B Bagian C by `addDataL3bTableCToL3A4TableA`, which sums the
  twelve monthly bruto per TKU and re-keys the previously entered `Norm` by row
  identity so editing L-3B does not lose it. `NetIncome = norm !== 0 ? bruto *
  (norm/100) : 0`, rounded per row by `setGrid1DataMap`;
  `TotalNetIncome = Math.round(Grid1TotalNetIncome)` where that getter sums the
  already-rounded rows, so per-row rounding is load-bearing (see the multi-row
  regression case). Implemented as `hitungLampiranL3A4BagianA` +
  `L-3A-4/A.svelte`, with `norma_persen` added to
  `spt_pph_orang_pribadi_lampiran_3b_tku` (migration `0013_typical_paladin.sql`)
  because that registry row is what the section is generated from. Row 1.b.1 now
  switches on 1.b.3 = Norma.
  Still unverified: whether our L-3A 4800 NILAI FISKAL equals Coretax's
  `L3A{1,2,3}TreeTotalRow.FinalAmount` for the non-Norma sektor paths.
- **B9 — L-3C / L-3D gating** — FIXED (see the B9 section below); the grids remain unbuilt.
- **B8 — L-3C / L-3D** (`chkI5` / `chkI6`) remain unbuilt and unlisted in `tabs`.
- **`checkFamilyMemberStatus`** — Coretax auto-sets row 7 from the wife's
  `TaxUnitStatus` (Dependant → null, PH → SeparatedAsset, MT → ChooseToBeSeparated).
  Not implemented; needs the family-member data model.
- Everything under "Not covered by this diff" above, unchanged: server-side
  recomputation, `PIT_TAX_RATE` reference data, the `isMigrated` /
  `isStatusSubmitted` / `isPrefillDone` guards, and `pph-badan` / `ppn`.

---

## B9 — L-3C and L-3D: two entire lampiran, and two mis-modelled gates

Found while reviewing B8, and a bigger miss than B8 recorded. `src/` already has
the two questions that gate them, hardcoded as permanently `disabled`:

```svelte
<!-- I.svelte, before -->
<RowTanya nomor={"14.e"} ... disabled disabledHint={HINTS_DISABLED.i14e} />
<RowTanya nomor={"14.f"} ... disabled disabledHint={HINTS_DISABLED.i14f} />
```

with a comment stating the Metode Pembukuan hypothesis had been measured and
disproved, and that 14.f "later became enabled for reasons that could not be
pinned down". The bundle gives both rules outright. `chkI5`/`chkI6` are declared
`disabled` in the form group and enabled only by an earlier answer:

```js
// 14.e -> chkI5 -> L-3C, in emittedEventB1B3 (the 1.b.3 handler)
t.value === No.code ? chkI5.enable() : chkI5.disable()

// 14.f -> chkI6 -> L-3D, via filledDisableSubForm (the 1.b.1 handler)
filledDisableSubForm(t) { ...; updateChkI6(t) }
updateChkI6(t) { 0 == t ? (patchValue({chkI6: 0}), chkI6.disable()) : chkI6.enable() }
```

- **14.e is answerable exactly when 1.b.3 = Tidak (menyelenggarakan pembukuan).**
  Fiscal depreciation applies to a bookkeeper, not a Norma user. The Metode
  Pembukuan hypothesis was close — wrong field, right idea.
- **14.f is answerable exactly when 1.b.1 = Ya.** That is why it "later became
  enabled": 1.b.1 had been answered Ya in the meantime.

Fixed: `I.svelte` now takes `b1b3Norma` and `b1b1PenghasilanUsaha` and computes
both `disabled` states, and `+page.svelte` registers `L-3C` / `L-3D` tabs on those
two answers, so the gating graph is complete.

### The grids themselves are still unbuilt

Sizing, from the bundle — each is a three-grid lampiran with per-row edit dialogs,
comparable in scope to L-1:

- **L-3C, DAFTAR PENYUSUTAN DAN AMORTISASI FISKAL** (`rshshr-pitr-l3c-grid1..3`,
  each with a `-edit` dialog). Columns include KELOMPOK/JENIS HARTA, TAHUN
  PEROLEHAN, HARGA PEROLEHAN, NILAI SISA BUKU FISKAL AWAL TAHUN, METODE
  PENYUSUTAN/AMORTISASI, PENYUSUTAN/AMORTISASI FISKAL TAHUN INI. Rows group by
  KELOMPOK 1–4 plus KELOMPOK LAINNYA. Footer totals: JUMLAH PENYUSUTAN FISKAL /
  JUMLAH PENYUSUTAN KOMERSIAL / SELISIH PENYUSUTAN, and the same three for
  AMORTISASI — the `calculateTotalFiscalAndDifferenceDepreciation` and
  `calculateDifferenceAmortization` functions.
- **L-3D, daftar nominatif** (`rshshr-pitr-l3d-grid1..3` + dialogs), covering
  entertainment (Tanggal / Nama Tempat / Alamat / Jenis Entertainment / Jumlah
  Pemberian / Nama Relasi / Jenis Usaha Relasi), Daftar Nominatif Biaya Promosi,
  and bad debts (PENERIMA PIUTANG / NILAI PIUTANG / TAHUN DIMULAI / SALDO PIUTANG
  SAAT INI).

**Priority note:** neither affects a single computed figure. Coretax only
persists and validates them — `chkI5 && patchValue({L3CForm: ...})`,
`chkI6 && patchValue({L3DForm: ...})`, plus `runValidate` /
`checkFormValidityL3CForm` — and never patches any `valueXX` from either. So the
calculation diff above is unaffected by their absence; what was actually broken
was the gating, now fixed.

## Bonus finding — why Norma was never observable in the UI

`emittedEventB1B3` explains the "never capturable on the live form" note that
blocked B5. Selecting 1.b.3 = Ya triggers a server check, and on failure the
answer is thrown away:

```js
t.value === Yes.code && checkFacilityRegisterByFiscalYear(taxpayer, AS04, AS0401, PeriodCode)
  .subscribe(o => { if (!o.IsSuccessful || !o.Payload) {
      showUserFriendlyError("Anda tidak berhak menggunakan Norma Penghitungan Penghasilan Neto untuk menghitung penghasilan neto Anda");
      selectB1B3.patchValue(null); ... } })
```

The test account has no NPPN facility registered, so Norma reset itself every
time it was selected. No amount of UI probing on that account could have revealed
Bagian A — which is the general lesson for this whole document.

---

## docs/ui-reference audit (2026-08-19)

Prompted by three wrong conclusions in that corpus. Every absolute or negative
claim in the 19 notes was re-checked against the bundle; the measurements were all
accurate, and what needed correcting were the inferences drawn from them.

**Corrected — the claim was wrong:**

| Where | Was | Now |
|---|---|---|
| `L4.md` | PKP gabungan "confirmed exact", no rounding; plain proportional split | floored to 1.000; split has three extra branches |
| `L3A.md` | Bagian A "not capturable" | gate is 1.b.3 = Ya; fully specified; implemented |
| `NOTES.md`, `GATING.md`, `HEADER-FIELDS.md` | 14e/14f gates "unidentified", 14f enable "sticky and uncaused" | 14e ← 1.b.3 = Tidak, 14f ← 1.b.1 = Ya; each gates a lampiran |

**Resolved — the claim was right but incomplete:**

| Where | Open question | Answer |
|---|---|---|
| `NOTES.md` | L-5 B has no way to add a row | `IsShowActionColumn = !isStatusSubmitted && chkC2` (row 3 = Ya) |
| `NOTES.md` | L-2 C has no entry path | same shape on `chkB1D` (1.d = Ya); captured draft had 1.d = Tidak |
| `L3B.md` | why Norma was refused | `checkFacilityRegisterByFiscalYear(…, AS04, AS0401, …)` rejects it and nulls the answer |
| `OPTIONS.md` | HEADER Status values | Normal/amendment distinction confirmed (`returnSheetModel !== "NORMAL"` drives section F); amendment literal still unknown |
| `COMPUTATION.md` | tariff "confirmed exactly" | still true, but band edges are untestable and the Induk rate is reference-data driven |
| `Induk/G.svelte` | section G modelled on Badan, unverified | 4 of Coretax's 6 controls match; `BankCode` has no equivalent here |

**Kept as-is** — accurate, and about appearance or about our own deliberate
choices rather than about Coretax's behaviour: the modal field inventories, the
grid column tables (`NOTES.md`'s L-3A-4 Bagian A columns were right all along),
the positional-Kode correction in `BEHAVIOR.md`, and the spousal-NPWP lookup note.

The `Kode`-as-plain-text decision was in this list when it was written, on the
grounds that it was our own deliberate choice rather than a misreading of
Coretax. That no longer holds: the choice was forced by not having the codes, and
the reference-data endpoint has them. It was reversed on 2026-08-19 and Kode is
now derived from Deskripsi in every lampiran but L-2 C. See `MODALS.md`.

`docs/ui-reference/README.md` now opens with the reading rules this exercise
produced: separate observation from inference, treat negative claims as the
dangerous class, prefer the bundle for logic and this corpus for appearance, and
read "no entry path" as "gate not answered" — which it has been every time.
