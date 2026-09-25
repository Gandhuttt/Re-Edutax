<script lang="ts">
    import { DisclosureItem, FieldGrid, RupiahField, Stack } from "$lib/re-ui-components";
    import { applyRupiahInput } from "$lib/helpers/rupiahInput";
    import type { DaftarReferensi, KodeReferensi } from "../referensi";
    import Grid from "./Grid.svelte";
    import { L3C_AMORTISASI, L3C_PENYUSUTAN, L3C_SUB_GRID, type BarisPerTabel } from "./types";

    // L-3C, DAFTAR PENYUSUTAN DAN AMORTISASI FISKAL.
    // Three sections over twelve sub-grids. Nothing here feeds an Induk figure.
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

    const berwujud = L3C_SUB_GRID.filter((grid) => grid.seksi === "berwujud");
    const bangunan = L3C_SUB_GRID.filter((grid) => grid.seksi === "bangunan");
    const takBerwujud = L3C_SUB_GRID.filter((grid) => grid.seksi === "takberwujud");
    const jumlahDari = (indeks: number[]) => indeks.reduce(
        (sum, index) => sum + (perTabel[index] ?? []).reduce((subtotal, row) => subtotal + Number(row.penyusutanFiskalTahunIni || 0), 0),
        0
    );

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
    setKomersial: (nilai: number) => void
)}
    <FieldGrid>
        <RupiahField label={labelFiskal} value={fiskal} disabled />
        <RupiahField label={labelKomersial} value={komersial} oninput={(event) => setKomersial(applyRupiahInput(event))} disabled={readonly} />
        <RupiahField label={labelSelisih} value={selisih} disabled />
    </FieldGrid>
{/snippet}

<div class:hidden={currentTab !== "L-3C"}>
    <Stack gap="0">
        <DisclosureItem title="HARTA BERWUJUD">
            <Stack gap="20px">
                {#each berwujud as grid (grid.tableIndex)}
                    <Grid bind:rows={perTabel[grid.tableIndex]} tableIndex={grid.tableIndex} judul={grid.judul} daftarHarta={grid.daftar} seksi={grid.seksi} {tahunPajak} {referensi} {kodeReferensi} {readonly} />
                {/each}
            </Stack>
        </DisclosureItem>
        <DisclosureItem title="BANGUNAN">
            <Stack gap="20px">
                {#each bangunan as grid (grid.tableIndex)}
                    <Grid bind:rows={perTabel[grid.tableIndex]} tableIndex={grid.tableIndex} judul={grid.judul} daftarHarta={grid.daftar} seksi={grid.seksi} {tahunPajak} {referensi} {kodeReferensi} {readonly} />
                {/each}
                {@render ringkasan(
                    "A. JUMLAH PENYUSUTAN FISKAL",
                    totalPenyusutanFiskal,
                    "B. JUMLAH PENYUSUTAN KOMERSIAL",
                    totalPenyusutanKomersial,
                    "C. SELISIH PENYUSUTAN (A-B)",
                    selisihPenyusutan,
                    (nilai) => (totalPenyusutanKomersial = nilai)
                )}
            </Stack>
        </DisclosureItem>
        <DisclosureItem title="HARTA TIDAK BERWUJUD">
            <Stack gap="20px">
                {#each takBerwujud as grid (grid.tableIndex)}
                    <Grid bind:rows={perTabel[grid.tableIndex]} tableIndex={grid.tableIndex} judul={grid.judul} daftarHarta={grid.daftar} seksi={grid.seksi} {tahunPajak} {referensi} {kodeReferensi} {readonly} />
                {/each}
                {@render ringkasan(
                    "D. JUMLAH AMORTISASI FISKAL",
                    totalAmortisasiFiskal,
                    "E. JUMLAH AMORTISASI KOMERSIAL",
                    totalAmortisasiKomersial,
                    "F. SELISIH AMORTISASI (D-E)",
                    selisihAmortisasi,
                    (nilai) => (totalAmortisasiKomersial = nilai)
                )}
            </Stack>
        </DisclosureItem>
    </Stack>
</div>

<style>.hidden { display: none; }</style>
