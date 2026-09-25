<script lang="ts">
    import type { DaftarReferensi, KodeReferensi } from "../referensi";
    import { DisclosureItem, Stack } from "$lib/re-ui-components";
    import A from "./A.svelte";
    import B from "./B.svelte";
    import C from "./C.svelte";
    import type { BarisKompensasi, BarisPengurang } from "./types";

    interface Props {
        currentTab: string;
        referensi: DaftarReferensi;
        kodeReferensi: KodeReferensi;
        tahunPajak: number;
        kompensasi: BarisKompensasi[];
        pengurangNeto: BarisPengurang[];
        pengurangPph: BarisPengurang[];
        // A single gate (Induk row 3) drives both A's editability and B's; C is
        // driven by row 8 independently.
        c3AdaPengurangPenghasilanNeto: boolean | undefined;
        c8AdaPengurangPphTerutang: boolean | undefined;
        readonly?: boolean;
    }

    let {
        currentTab,
        referensi,
        kodeReferensi,
        tahunPajak,
        kompensasi = $bindable(),
        pengurangNeto = $bindable(),
        pengurangPph = $bindable(),
        c3AdaPengurangPenghasilanNeto,
        c8AdaPengurangPphTerutang,
        readonly = false
    }: Props = $props();
</script>

<div class="{currentTab === 'L-5' ? '' : 'tw:hidden'}">
    <Stack gap="0">
        <DisclosureItem title="A. PENGHITUNGAN KOMPENSASI KERUGIAN FISKAL" open>
            <A
                bind:rows={kompensasi}
                {tahunPajak}
                dapatDiubah={Boolean(c3AdaPengurangPenghasilanNeto)}
                {readonly}
            />
        </DisclosureItem>
        <DisclosureItem title="B. PENGURANG PENGHASILAN NETO" open>
            <B
                bind:rows={pengurangNeto}
                {referensi}
                {kodeReferensi}
                dapatDiubah={Boolean(c3AdaPengurangPenghasilanNeto)}
                {readonly}
            />
        </DisclosureItem>
        <DisclosureItem title="C. PENGURANG PPh TERUTANG" open>
            <C
                bind:rows={pengurangPph}
                {referensi}
                {kodeReferensi}
                dapatDiubah={Boolean(c8AdaPengurangPphTerutang)}
                {readonly}
            />
        </DisclosureItem>
    </Stack>
</div>
