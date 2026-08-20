<script lang="ts">
    import type { DaftarReferensi, KodeReferensi } from "../referensi";
    import Accordion from "$lib/components/AccordionItem.svelte";
    import Grid from "./Grid.svelte";
    import { applyRupiahInput, formatRupiah, formatRupiahDerived } from "$lib/helpers/rupiahInput";
    import { L3C_AMORTISASI, L3C_PENYUSUTAN, L3C_SUB_GRID, type BarisPerTabel } from "./types";

    // L-3C, DAFTAR PENYUSUTAN DAN AMORTISASI FISKAL.
    //
    // Three sections over twelve sub-grids. Nothing here feeds an Induk figure:
    // Coretax only persists and validates L3CForm and never patches a valueXX
    // from it, so this lampiran is a declaration attachment.
    interface Props {
        currentTab: string;
        referensi: DaftarReferensi;
        kodeReferensi: KodeReferensi;
        tahunPajak: number;
        perTabel: BarisPerTabel;
        totalPenyusutanKomersial: number;
        totalAmortisasiKomersial: number;
        readonly?: boolean;
    }

    let {
        currentTab,
        referensi,
        kodeReferensi,
        tahunPajak,
        perTabel = $bindable(),
        totalPenyusutanKomersial = $bindable(),
        totalAmortisasiKomersial = $bindable(),
        readonly = false
    }: Props = $props();

    const berwujud = L3C_SUB_GRID.filter((g) => g.seksi === 'berwujud');
    const bangunan = L3C_SUB_GRID.filter((g) => g.seksi === 'bangunan');
    const takBerwujud = L3C_SUB_GRID.filter((g) => g.seksi === 'takberwujud');

    const jumlahDari = (indeks: number[]) =>
        indeks.reduce(
            (sum, i) =>
                sum + (perTabel[i] ?? []).reduce((s, r) => s + Number(r.penyusutanFiskalTahunIni || 0), 0),
            0
        );

    // Coretax sums grids 1-7 into TotalFiscalDepreciation and 8-12 into
    // TotalFiscalAmortization, then subtracts the typed commercial total for each
    // to get the two SELISIH figures. Both fiscal totals and both differences are
    // disabled there; only the commercial totals are entered.
    //
    // The penyusutan trio therefore spans TWO sections (harta berwujud and
    // bangunan) and is rendered at the end of the second, lettered A/B/C, with
    // the amortisasi trio D/E/F after the third. That placement and lettering
    // follow the official form as laid out in sheet "LAMP 3C" of
    // docs/Copy of SIMULASI_SPT_OP-KOMPLEKS.xlsx.
    let totalPenyusutanFiskal = $derived(jumlahDari(L3C_PENYUSUTAN));
    let totalAmortisasiFiskal = $derived(jumlahDari(L3C_AMORTISASI));
    let selisihPenyusutan = $derived(totalPenyusutanFiskal - Number(totalPenyusutanKomersial || 0));
    let selisihAmortisasi = $derived(totalAmortisasiFiskal - Number(totalAmortisasiKomersial || 0));
</script>

{#snippet ringkasan(
    labelFiskal: string,
    fiskal: number,
    labelKomersial: string,
    komersial: number,
    labelSelisih: string,
    selisih: number,
    setKomersial: (nilai: number) => void,
    id: string
)}
    <div class="tw:mt-4 tw:flex tw:flex-col tw:gap-2">
        <div style="display: flex; align-items: center;">
            <label for={`${id}-fiskal`} style="width: 320px; font-weight: bold;">{labelFiskal}</label>
            <input type="text" id={`${id}-fiskal`} value={formatRupiahDerived(fiskal)} readonly style="flex: 1; text-align: right; background-color: #e9ecef;" />
        </div>
        <div style="display: flex; align-items: center;">
            <label for={`${id}-komersial`} style="width: 320px; font-weight: bold;">{labelKomersial}</label>
            <input
                type="text"
                inputmode="numeric"
                id={`${id}-komersial`}
                value={formatRupiah(komersial)}
                oninput={(e: Event) => setKomersial(applyRupiahInput(e))}
                disabled={readonly}
                style="flex: 1; text-align: right;"
            />
        </div>
        <div style="display: flex; align-items: center;">
            <label for={`${id}-selisih`} style="width: 320px; font-weight: bold;">{labelSelisih}</label>
            <input type="text" id={`${id}-selisih`} value={formatRupiahDerived(selisih)} readonly style="flex: 1; text-align: right; background-color: #e9ecef;" />
        </div>
    </div>
{/snippet}

<div class="{currentTab === 'L-3C' ? '' : 'tw:hidden'}">
    <div class="accordion">
        <Accordion item={"HARTA BERWUJUD"}>
            <div class="tw:p-5">
                {#each berwujud as grid (grid.tableIndex)}
                    <Grid
                        bind:rows={perTabel[grid.tableIndex]}
                        tableIndex={grid.tableIndex}
                        judul={grid.judul}
                        daftarHarta={grid.daftar}
                        seksi={grid.seksi}
                        {tahunPajak}
                        {referensi}
                        {kodeReferensi}
                        {readonly}
                    />
                {/each}
            </div>
        </Accordion>
        <Accordion item={"BANGUNAN"}>
            <div class="tw:p-5">
                {#each bangunan as grid (grid.tableIndex)}
                    <Grid
                        bind:rows={perTabel[grid.tableIndex]}
                        tableIndex={grid.tableIndex}
                        judul={grid.judul}
                        daftarHarta={grid.daftar}
                        seksi={grid.seksi}
                        {tahunPajak}
                        {referensi}
                        {kodeReferensi}
                        {readonly}
                    />
                {/each}
                {@render ringkasan(
                    'A. JUMLAH PENYUSUTAN FISKAL',
                    totalPenyusutanFiskal,
                    'B. JUMLAH PENYUSUTAN KOMERSIAL',
                    totalPenyusutanKomersial,
                    'C. SELISIH PENYUSUTAN (A-B)',
                    selisihPenyusutan,
                    (nilai) => (totalPenyusutanKomersial = nilai),
                    'l3c-penyusutan'
                )}
            </div>
        </Accordion>
        <Accordion item={"HARTA TIDAK BERWUJUD"}>
            <div class="tw:p-5">
                {#each takBerwujud as grid (grid.tableIndex)}
                    <Grid
                        bind:rows={perTabel[grid.tableIndex]}
                        tableIndex={grid.tableIndex}
                        judul={grid.judul}
                        daftarHarta={grid.daftar}
                        seksi={grid.seksi}
                        {tahunPajak}
                        {referensi}
                        {kodeReferensi}
                        {readonly}
                    />
                {/each}
                {@render ringkasan(
                    'D. JUMLAH AMORTISASI FISKAL',
                    totalAmortisasiFiskal,
                    'E. JUMLAH AMORTISASI KOMERSIAL',
                    totalAmortisasiKomersial,
                    'F. SELISIH AMORTISASI (D-E)',
                    selisihAmortisasi,
                    (nilai) => (totalAmortisasiKomersial = nilai),
                    'l3c-amortisasi'
                )}
            </div>
        </Accordion>
    </div>
</div>
